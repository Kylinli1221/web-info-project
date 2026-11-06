# Debian 13 (trixie) 裸机部署文档（Nuxt + MySQL + Nginx + HTTPS）

适用于全新的 Debian 13.x（含 13.7）服务器，裸机部署本项目（Nuxt 4 + Prisma + MySQL），使用 Let's Encrypt 免费证书开启 HTTPS。

> 如果你部署的是 Debian 12，请见 [debian-12.md](./debian-12.md)。

## 前置条件

- 域名已解析到服务器公网 IP：`your-domain.com` 和 `www.your-domain.com` 各一条 A 记录（如果只用根域名，可忽略 www 相关的配置和说明）
- 服务器安全组/防火墙放行 TCP `22`、`80`、`443` 端口
- 通过 SSH 以 root 或具有 sudo 权限的用户登录服务器

> 以下命令除特别说明外，均在服务器上以 root 身份执行（或加 `sudo`）。

## 1. 系统初始化

```bash
apt update && apt -y upgrade
apt -y install curl ufw

# 创建部署用户（日常操作都用它，不再直接用 root）
adduser deploy
usermod -aG sudo deploy
```

### 1.1 检查软件源（Debian 13 新格式）

Debian 13 默认使用 deb822 格式的源配置文件 `/etc/apt/sources.list.d/debian.sources`（不再使用传统的 `/etc/apt/sources.list`）。如果 `apt update` 报 `Release file not found` 或安装包时报 `has no installation candidate`，按以下方式重建源。

先备份并查看现有配置：

```bash
cp /etc/apt/sources.list.d/debian.sources /root/debian.sources.bak 2>/dev/null
cat /etc/apt/sources.list.d/debian.sources
```

官方源（写入 `/etc/apt/sources.list.d/debian.sources`）：

```deb822
Types: deb
URIs: http://deb.debian.org/debian
Suites: trixie trixie-updates
Components: main contrib non-free non-free-firmware
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg

Types: deb
URIs: http://security.debian.org/debian-security
Suites: trixie-security
Components: main contrib non-free non-free-firmware
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg
```

国内服务器（阿里云等）换国内镜像更快，例如阿里云：

```deb822
Types: deb
URIs: http://mirrors.aliyun.com/debian
Suites: trixie trixie-updates
Components: main contrib non-free non-free-firmware
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg

Types: deb
URIs: http://mirrors.aliyun.com/debian-security
Suites: trixie-security
Components: main contrib non-free non-free-firmware
Signed-By: /usr/share/keyrings/debian-archive-keyring.gpg
```

改完后 `apt update` 验证。

### 1.2 配置防火墙

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

> 如果 SSH 不是 22 端口，把第一条改为 `ufw allow <你的SSH端口>/tcp`。

### 1.3 添加 Swap（小内存服务器必做）

如果服务器内存 ≤ 2GB，务必先加 Swap，否则后面 MySQL 初始化和 Nuxt 构建会因内存不足（OOM，退出码 137）被系统杀进程：

```bash
free -h    # 查看内存和 Swap，若已有 Swap 可跳过
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## 2. 安装 Node.js 22 LTS 与 pnpm

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt -y install nodejs
node -v    # 应为 v22.x

# pnpm 通过 corepack 提供，版本由 package.json 的 packageManager 字段锁定（10.6.1）
corepack enable
```

安装编译工具（argon2、sharp 等原生依赖需要，也便于兜底源码编译）：

```bash
apt -y install build-essential python3
```

## 3. 安装并配置 MySQL 8.4 LTS

Debian 官方仓库不带 MySQL（只有 MariaDB），需添加 MySQL 官方 APT 源。MySQL 官方源已支持 Debian 13 (trixie)，需使用 `mysql-apt-config` **0.8.36 及以上版本**（首个支持 trixie 的版本）。本项目依赖的 `@prisma/adapter-mariadb` 使用 MariaDB 官方 Node.js 连接器，与 MySQL 服务端完全兼容（本地开发使用的即是 MySQL 8.4）。

```bash
apt -y install wget

# 预置选择 MySQL 8.4 LTS，避免安装配置包时弹出交互界面
echo "mysql-apt-config mysql-apt-config/select-server select mysql-8.4-lts" | debconf-set-selections
wget https://dev.mysql.com/get/mysql-apt-config_0.8.36-1_all.deb
DEBIAN_FRONTEND=noninteractive dpkg -i mysql-apt-config_0.8.36-1_all.deb
rm mysql-apt-config_0.8.36-1_all.deb
apt update
apt -y install mysql-server
systemctl enable --now mysql
```

> 若上面的 `wget` 下载 404，说明配置包版本已更新，请到 [MySQL APT Repository 下载页](https://dev.mysql.com/downloads/repo/apt/) 查看最新的 `mysql-apt-config` 版本号并替换（需 ≥ 0.8.36 才支持 trixie）。

安装过程中会提示设置 root 密码，认证插件选择 **Use Strong Password Encryption (RECOMMENDED)**。随后执行安全加固（root 密码已设置选 N，其余——移除匿名用户、禁止远程 root 登录、删除测试库、刷新权限——选 Y）：

```bash
mysql_secure_installation
```

创建应用数据库和用户（请替换 `<DB_PASSWORD>` 为强密码）：

```bash
mysql -u root -p <<'SQL'
CREATE DATABASE webinfo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'webinfo'@'localhost' IDENTIFIED BY '<DB_PASSWORD>';
GRANT ALL PRIVILEGES ON webinfo.* TO 'webinfo'@'localhost';
FLUSH PRIVILEGES;
SQL
```

## 4. 部署应用

### 4.1 上传代码

方式一：git（推荐，便于后续更新）

```bash
apt -y install git
mkdir -p /opt/webinfo
git clone <你的仓库地址> /opt/webinfo
```

方式二：本地打包上传（无 git 仓库时）

在本地项目根目录的 PowerShell 中执行（打包后上传到服务器 `/opt/webinfo` 解压）：

```powershell
$exclude = 'node_modules','.nuxt','.output','.git','generated','.data','.superpowers','storage','.env','webinfo.zip'
Compress-Archive -Path (Get-ChildItem -Force | Where-Object { $exclude -notcontains $_.Name }) -DestinationPath webinfo.zip
```

> 若项目已是 git 仓库，也可以用 `git archive --format=zip -o webinfo.zip HEAD` 打包（.gitignore 中的目录会自动排除）；若不是 git 仓库又想用该命令，先执行 `git init && git add . && git commit -m "init"` 初始化。

### 4.2 创建运行用户

```bash
adduser --system --group --home /opt/webinfo webinfo
chown -R webinfo:webinfo /opt/webinfo
```

### 4.3 配置环境变量

```bash
cp /opt/webinfo/.env.example /opt/webinfo/.env
chmod 600 /opt/webinfo/.env
```

编辑 `/opt/webinfo/.env`，内容如下（`SESSION_SECRET` 用 `openssl rand -hex 32` 生成）：

```ini
DATABASE_URL=mysql://webinfo:<DB_PASSWORD>@127.0.0.1:3306/webinfo
SESSION_SECRET=<openssl rand -hex 32 的输出>
UPLOAD_DIR=./storage/uploads
PUBLIC_SITE_URL=https://your-domain.com
```

> 注意：生产部署不需要 `SHADOW_DATABASE_URL`（仅本地 `prisma migrate dev` 使用）。

### 4.4 安装依赖并构建

在服务器上构建，避免 Windows 本地构建的原生模块（argon2/sharp）与 Linux 不兼容：

```bash
cd /opt/webinfo
sudo -u webinfo pnpm install
sudo -u webinfo pnpm exec nuxi prepare  # 生成 .nuxt/tsconfig.json，prisma generate 依赖它
sudo -u webinfo pnpm db:generate  # 生成 Prisma Client 到 generated/prisma
sudo -u webinfo pnpm db:deploy    # 执行数据库迁移
sudo -u webinfo pnpm db:seed      # 初始化站点默认数据（幂等，可重复执行）
sudo -u webinfo pnpm build        # 产物在 .output/
```

> 若 `webinfo` 用户没有 corepack/pnpm，先以 root 执行 `corepack enable`，再重跑上述命令，最后 `chown -R webinfo:webinfo /opt/webinfo`。

### 4.5 创建管理员账号

```bash
cd /opt/webinfo
sudo -u webinfo pnpm admin:create   # 按提示输入邮箱、姓名、密码
```

## 5. 配置 systemd 守护进程

创建 `/etc/systemd/system/webinfo.service`：

```ini
[Unit]
Description=Nuxt webinfo app
After=network.target mysql.service

[Service]
Type=simple
User=webinfo
Group=webinfo
WorkingDirectory=/opt/webinfo
Environment=NODE_ENV=production
Environment=HOST=127.0.0.1
Environment=PORT=3000
EnvironmentFile=/opt/webinfo/.env
ExecStart=/usr/bin/node .output/server/index.mjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

启动并验证：

```bash
systemctl daemon-reload
systemctl enable --now webinfo
systemctl status webinfo
curl -I http://127.0.0.1:3000    # 应返回 200
```

查看日志：`journalctl -u webinfo -f`

## 6. 安装 Nginx 并配置反向代理

```bash
apt -y install nginx
systemctl enable --now nginx
```

创建 `/etc/nginx/sites-available/webinfo`：

```nginx
# www 跳转到根域名（301，利于 SEO 集中权重）
server {
    listen 80;
    server_name www.your-domain.com;
    return 301 https://your-domain.com$request_uri;
}

server {
    listen 80;
    server_name your-domain.com;

    client_max_body_size 10m;   # 后台上传限制为 5 MiB，留有余量

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用并检查：

```bash
ln -s /etc/nginx/sites-available/webinfo /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

此时访问 `http://your-domain.com` 应能看到站点（HTTP）。

> 说明：图片等媒体文件由应用自身的 `/media/:name` 路由读取并带缓存头，无需在 Nginx 配置额外静态目录。

## 7. 申请 HTTPS 证书（Let's Encrypt）

```bash
apt -y install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
```

按提示输入邮箱、同意条款。certbot 会自动修改 Nginx 配置加入 443 端口和证书路径，并设置 HTTP 跳转 HTTPS；www 的 server 块也会加上 443（保留 301 跳转到根域名）。

验证续期（证书 90 天有效，certbot 通过 systemd timer 自动续期）：

```bash
systemctl status certbot.timer
certbot renew --dry-run
```

至此访问 `https://your-domain.com` 即为完整的 HTTPS 站点。

## 8. 日常运维

### 更新部署

```bash
cd /opt/webinfo
sudo -u webinfo git pull
sudo -u webinfo pnpm install
sudo -u webinfo pnpm db:deploy
sudo -u webinfo pnpm build
systemctl restart webinfo
```

### 日志

```bash
journalctl -u webinfo -f          # 应用日志
tail -f /var/log/nginx/error.log  # Nginx 错误日志
```

### 备份

数据库 + 上传文件：

```bash
# 数据库
mysqldump -u root -p webinfo | gzip > /backup/webinfo-$(date +%F).sql.gz
# 上传文件
tar -czf /backup/uploads-$(date +%F).tar.gz -C /opt/webinfo storage/uploads
```

建议加入 crontab 每日执行，并将 `/backup` 同步到异地存储。

### 恢复

```bash
gunzip < /backup/webinfo-XXXX-XX-XX.sql.gz | mysql -u root -p webinfo
tar -xzf /backup/uploads-XXXX-XX-XX.tar.gz -C /opt/webinfo
systemctl restart webinfo
```

## 故障排查速查

| 现象 | 排查方向 |
|---|---|
| 安装包报 `has no installation candidate` | 软件源缺失，见 1.1 重建 `/etc/apt/sources.list.d/debian.sources` 后 `apt update` |
| MySQL 安装时报 `Killed` / 退出码 137 | 内存不足被 OOM 杀掉，见 1.3 加 Swap，然后 `dpkg --configure mysql-community-server` 重试；若报数据目录已存在，先 `rm -rf /var/lib/mysql/*` 再重试 |
| `apt update` 报 `EXPKEYSIG B7B3B788A8D3785C` | MySQL 仓库 GPG 密钥过期所致，用 `curl -fsSL https://repo.mysql.com/RPM-GPG-KEY-mysql-2025` 下载新密钥，替换 `cat /etc/apt/sources.list.d/mysql.list` 中 `signed-by=` 指向的密钥文件后重新 `apt update` |
| 502 Bad Gateway | `systemctl status webinfo` 应用是否运行；`curl -I http://127.0.0.1:3000` |
| 证书申请失败 | 域名是否已解析到本机；UFW 及云安全组是否放行 80 端口 |
| 迁移失败 | `DATABASE_URL` 是否正确；`mysql -u webinfo -p webinfo` 能否登录 |
| 上传失败 | `client_max_body_size` 是否生效（`nginx -t` 后 reload）；`storage/uploads` 目录权限是否归 `webinfo` 用户 |
