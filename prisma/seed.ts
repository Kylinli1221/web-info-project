import 'dotenv/config'
import { PublishStatus } from '../generated/prisma/client'
import { prisma } from '../server/utils/prisma'

const text = (zh: string, en: string) => ({ zh, en })
const publishedAt = new Date('2026-10-01T00:00:00.000Z')

const siteSetting = {
  id: 1,
  logoLightUrl: null,
  logoDarkUrl: null,
  faviconUrl: null,
  siteName: text('诺川科技', 'NEXORA'),
  contactEmail: 'hello@nexora.example',
  phone: '+86 400-800-2026',
  address: text('中国上海市浦东新区示例路 88 号', '88 Example Road, Pudong New Area, Shanghai, China'),
  socialLinks: [],
  seo: {
    title: text('诺川科技｜软件与数字技术', 'NEXORA | Software & Digital Technology'),
    description: text(
      '诺川科技以人工智能、数据智能和云原生技术，为企业提供可靠的软件产品与数字化转型服务。',
      'NEXORA delivers dependable software products and digital transformation services through AI, data intelligence, and cloud-native technology.',
    ),
    keywords: text(
      '软件开发,人工智能,数据智能,云原生,数字化转型',
      'software development,artificial intelligence,data intelligence,cloud native,digital transformation',
    ),
  },
  footer: {
    copyright: text('© 2026 诺川科技。保留所有权利。', '© 2026 NEXORA. All rights reserved.'),
    icpNumber: '',
    icpUrl: '',
    publicSecurityNumber: '',
    publicSecurityUrl: '',
    links: [],
  },
}

const navigationItems = [
  { id: 'navigation-home', label: text('首页', 'Home'), url: '/', sortOrder: 0, visible: true },
  { id: 'navigation-solutions', label: text('解决方案', 'Solutions'), url: '/solutions', sortOrder: 10, visible: true },
  { id: 'navigation-cases', label: text('客户案例', 'Case Studies'), url: '/cases', sortOrder: 20, visible: true },
  { id: 'navigation-news', label: text('新闻动态', 'News'), url: '/news', sortOrder: 30, visible: true },
  { id: 'navigation-about', label: text('关于我们', 'About'), url: '/about', sortOrder: 40, visible: true },
  { id: 'navigation-contact', label: text('联系我们', 'Contact'), url: '/contact', sortOrder: 50, visible: true },
]

const homeSections = [
  {
    type: 'hero',
    sortOrder: 0,
    visible: true,
    content: {
      eyebrow: text('软件与数字技术', 'SOFTWARE & DIGITAL TECHNOLOGY'),
      headline: text('以技术，驱动下一代增长', 'Technology for your next era of growth'),
      summary: text(
        '从智能平台到云原生基础设施，我们将工程能力转化为可持续的业务价值。',
        'From intelligent platforms to cloud-native infrastructure, we turn engineering excellence into lasting business value.',
      ),
      primaryAction: { label: text('探索解决方案', 'Explore solutions'), url: '/solutions' },
      secondaryAction: { label: text('预约技术咨询', 'Talk to an engineer'), url: '/contact' },
    },
  },
  {
    type: 'capabilities',
    sortOrder: 10,
    visible: true,
    content: {
      title: text('覆盖数字化全周期的工程能力', 'Engineering across the digital lifecycle'),
      summary: text(
        '策略、设计、研发与运营协同推进，让复杂系统稳定落地。',
        'Strategy, design, engineering, and operations work together to make complex systems dependable.',
      ),
      items: [
        {
          icon: 'sparkles',
          title: text('智能应用研发', 'Intelligent application engineering'),
          summary: text('将模型能力融入真实业务流程。', 'Embed model capabilities into real business workflows.'),
        },
        {
          icon: 'database',
          title: text('数据平台治理', 'Data platform and governance'),
          summary: text('构建可信、可观测的数据资产。', 'Build trusted, observable data assets.'),
        },
        {
          icon: 'cloud',
          title: text('云原生现代化', 'Cloud-native modernization'),
          summary: text('提升系统弹性与交付效率。', 'Improve resilience and delivery velocity.'),
        },
        {
          icon: 'shield',
          title: text('安全与质量保障', 'Security and quality assurance'),
          summary: text('把安全与质量嵌入每次交付。', 'Build security and quality into every release.'),
        },
      ],
    },
  },
  {
    type: 'metrics',
    sortOrder: 20,
    visible: true,
    content: {
      title: text('用可衡量的结果建立信任', 'Trust built on measurable outcomes'),
      summary: text('演示数据展示项目的典型成效维度。', 'Demo metrics illustrate typical project outcomes.'),
      items: [
        { value: '120+', label: text('交付项目', 'Projects delivered') },
        { value: '99.95%', label: text('平台可用性目标', 'Platform availability target') },
        { value: '40%', label: text('平均交付效率提升', 'Average delivery efficiency gain') },
        { value: '24/7', label: text('关键系统保障', 'Critical system support') },
      ],
    },
  },
  {
    type: 'solutions',
    sortOrder: 30,
    visible: true,
    content: {
      eyebrow: text('核心解决方案', 'CORE SOLUTIONS'),
      title: text('从业务挑战到可运行的系统', 'From business challenges to working systems'),
      summary: text('模块化能力可以独立采用，也可以组合为完整的数字化平台。', 'Adopt modular capabilities independently or combine them into a complete digital platform.'),
      action: { label: text('查看全部方案', 'View all solutions'), url: '/solutions' },
    },
  },
  {
    type: 'cases',
    sortOrder: 40,
    visible: true,
    content: {
      eyebrow: text('客户实践', 'CUSTOMER STORIES'),
      title: text('真实场景中的数字化成果', 'Digital outcomes in real-world scenarios'),
      summary: text('了解跨行业团队如何借助软件与数据实现持续改进。', 'See how teams across industries use software and data to improve continuously.'),
      action: { label: text('浏览客户案例', 'Browse case studies'), url: '/cases' },
    },
  },
  {
    type: 'news',
    sortOrder: 50,
    visible: true,
    content: {
      eyebrow: text('洞察与动态', 'INSIGHTS & NEWS'),
      title: text('分享工程实践与技术判断', 'Engineering practice and technology perspectives'),
      summary: text('获取产品动态、架构经验与数字化实践方法。', 'Follow product updates, architecture lessons, and digital delivery practices.'),
      action: { label: text('阅读全部新闻', 'Read all news'), url: '/news' },
    },
  },
  {
    type: 'about',
    sortOrder: 60,
    visible: true,
    content: {
      eyebrow: text('关于诺川', 'ABOUT NEXORA'),
      title: text('与长期主义者，共建可靠技术', 'Building dependable technology for the long term'),
      summary: text(
        '诺川科技是一支专注软件产品与数字工程的团队，坚持以清晰目标、开放协作和可验证结果服务客户。',
        'NEXORA is a software product and digital engineering team focused on clear goals, open collaboration, and verifiable outcomes.',
      ),
      content: text(
        '我们将业务理解与工程实践放在同一套交付体系中，从 discovery 到持续运营，与客户团队共同建设可演进的技术能力。',
        'We unite business understanding and engineering practice in one delivery system, working with client teams from discovery through continuous operations to build technology that can evolve.',
      ),
      action: { label: text('了解我们的团队', 'Meet our team'), url: '/about' },
    },
  },
  {
    type: 'contact',
    sortOrder: 70,
    visible: true,
    content: {
      eyebrow: text('开始合作', 'START A CONVERSATION'),
      title: text('让下一个技术目标清晰落地', 'Turn your next technology goal into a clear delivery plan'),
      summary: text('告诉我们你的业务场景与挑战，我们将安排合适的工程师与你沟通。', 'Tell us about your business context and challenges, and the right engineer will get in touch.'),
      email: 'hello@nexora.example',
      phone: '+86 400-800-2026',
      address: text('中国上海市浦东新区示例路 88 号', '88 Example Road, Pudong New Area, Shanghai, China'),
      action: { label: text('联系我们', 'Contact us'), url: '/contact' },
    },
  },
]

const solutions = [
  {
    slug: 'ai-platform',
    title: text('企业级 AI 应用平台', 'Enterprise AI Application Platform'),
    summary: text(
      '将知识库、模型编排与业务工作流整合为安全、可评估的企业智能平台。',
      'Unify knowledge bases, model orchestration, and business workflows in a secure, measurable enterprise AI platform.',
    ),
    content: text(
      '## 让 AI 真正进入业务流程\n\n平台连接企业知识、模型服务与现有业务系统，通过权限控制、效果评估和运行观测，帮助团队从试点走向规模化应用。\n\n### 交付内容\n\n- 场景梳理与价值评估\n- 知识检索与模型编排\n- 业务系统集成与运营看板',
      '## Put AI to work in real operations\n\nThe platform connects enterprise knowledge, model services, and existing business systems. Access control, evaluation, and observability help teams move from pilots to production at scale.\n\n### What we deliver\n\n- Use-case discovery and value assessment\n- Knowledge retrieval and model orchestration\n- Business integration and operational dashboards',
    ),
    features: {
      zh: ['多模型统一接入与路由', '企业知识检索增强生成', '提示词与效果评估管理', '细粒度权限与审计'],
      en: ['Unified multi-model access and routing', 'Retrieval-augmented enterprise knowledge', 'Prompt and evaluation management', 'Fine-grained access control and audit trails'],
    },
    icon: 'sparkles',
    coverUrl: null,
    sortOrder: 0,
    status: PublishStatus.PUBLISHED,
    publishedAt,
  },
  {
    slug: 'data-intelligence',
    title: text('数据智能与决策平台', 'Data Intelligence and Decision Platform'),
    summary: text(
      '打通数据采集、治理、指标与分析链路，让业务决策建立在一致可信的数据之上。',
      'Connect data ingestion, governance, metrics, and analytics so decisions rely on consistent, trusted data.',
    ),
    content: text(
      '## 从分散数据到统一指标\n\n我们围绕业务语义设计数据平台，建立可追溯的数据链路和统一指标体系，并通过自助分析让数据服务日常决策。\n\n### 交付内容\n\n- 数据架构与治理体系\n- 实时和离线数据管道\n- 指标平台与决策驾驶舱',
      '## From fragmented data to shared metrics\n\nWe design data platforms around business semantics, establish traceable pipelines and consistent metrics, and bring data into daily decisions through self-service analytics.\n\n### What we deliver\n\n- Data architecture and governance\n- Real-time and batch data pipelines\n- Metrics platforms and decision dashboards',
    ),
    features: {
      zh: ['多源数据集成', '数据质量与血缘管理', '统一指标体系', '自助分析与可视化'],
      en: ['Multi-source data integration', 'Data quality and lineage management', 'A shared metrics framework', 'Self-service analytics and visualization'],
    },
    icon: 'database',
    coverUrl: null,
    sortOrder: 10,
    status: PublishStatus.PUBLISHED,
    publishedAt,
  },
  {
    slug: 'cloud-native',
    title: text('云原生应用现代化', 'Cloud-Native Application Modernization'),
    summary: text(
      '通过架构治理、容器平台和工程效能实践，提升核心系统的弹性、可观测性与交付速度。',
      'Improve the resilience, observability, and delivery speed of core systems through architecture, container platforms, and engineering excellence.',
    ),
    content: text(
      '## 以业务连续性推进现代化\n\n我们先识别系统约束与演进路径，再逐步实施服务治理、云原生基础设施和自动化交付，避免一次性重写带来的风险。\n\n### 交付内容\n\n- 架构评估与演进路线\n- 容器平台与可观测性\n- CI/CD 与可靠性工程',
      '## Modernize without disrupting the business\n\nWe identify system constraints and an evolution path before introducing service governance, cloud-native infrastructure, and automated delivery incrementally—without the risk of a big-bang rewrite.\n\n### What we deliver\n\n- Architecture assessment and roadmaps\n- Container platforms and observability\n- CI/CD and reliability engineering',
    ),
    features: {
      zh: ['应用架构评估与改造', 'Kubernetes 平台建设', '全链路可观测性', '自动化交付与弹性治理'],
      en: ['Application architecture assessment and modernization', 'Kubernetes platform engineering', 'End-to-end observability', 'Automated delivery and resilience governance'],
    },
    icon: 'cloud',
    coverUrl: null,
    sortOrder: 20,
    status: PublishStatus.PUBLISHED,
    publishedAt,
  },
]

const cases = [
  {
    slug: 'smart-manufacturing-quality',
    title: text('制造集团智能质量追溯平台', 'Intelligent Quality Traceability for a Manufacturing Group'),
    summary: text(
      '统一多工厂质量数据与追溯链路，缩短异常定位时间并提升跨基地协同效率。',
      'Unified quality data and traceability across factories reduced investigation time and improved cross-site collaboration.',
    ),
    content: text(
      '## 挑战\n\n多个工厂使用不同的数据口径与质量系统，异常分析依赖人工汇总。\n\n## 方案\n\n诺川科技建立统一质量模型、实时数据管道与全流程追溯应用，并将关键指标接入运营看板。\n\n## 成效\n\n项目上线后，质量团队可以在同一平台完成异常定位、原因分析与改进跟踪。',
      '## Challenge\n\nFactories used different data definitions and quality systems, while incident analysis depended on manual consolidation.\n\n## Solution\n\nNEXORA established a shared quality model, real-time pipelines, and end-to-end traceability, with key metrics in operational dashboards.\n\n## Outcome\n\nQuality teams can now investigate anomalies, analyze root causes, and track improvements in one platform.',
    ),
    clientName: 'Demo Manufacturing Group',
    industry: 'manufacturing',
    results: {
      zh: [{ value: '-65%', label: '异常定位时间' }, { value: '12', label: '接入工厂数量' }, { value: '99.9%', label: '数据链路可用性' }],
      en: [{ value: '-65%', label: 'Time to locate anomalies' }, { value: '12', label: 'Connected factories' }, { value: '99.9%', label: 'Pipeline availability' }],
    },
    coverUrl: null,
    sortOrder: 0,
    status: PublishStatus.PUBLISHED,
    publishedAt,
  },
  {
    slug: 'retail-customer-intelligence',
    title: text('零售品牌客户数据与精准运营', 'Customer Intelligence for a Retail Brand'),
    summary: text(
      '构建统一客户视图和可解释的运营指标，支持跨渠道营销与服务协同。',
      'A unified customer view and explainable operational metrics enabled coordinated marketing and service across channels.',
    ),
    content: text(
      '## 挑战\n\n线上商城、门店和客服数据彼此割裂，营销活动难以形成一致评估。\n\n## 方案\n\n团队交付客户数据平台、统一身份规则和指标中心，并将分群能力接入现有营销工具。\n\n## 成效\n\n运营团队能够基于同一客户视图设计活动，并持续追踪转化与服务质量。',
      '## Challenge\n\nE-commerce, store, and service data were fragmented, making campaign performance difficult to evaluate consistently.\n\n## Solution\n\nThe team delivered a customer data platform, unified identity rules, and a metrics hub connected to existing marketing tools.\n\n## Outcome\n\nOperations teams can now design campaigns around one customer view and continuously track conversion and service quality.',
    ),
    clientName: 'Demo Retail Brand',
    industry: 'retail',
    results: {
      zh: [{ value: '8', label: '整合数据来源' }, { value: '+28%', label: '活动转化提升' }, { value: '1', label: '统一客户视图' }],
      en: [{ value: '8', label: 'Integrated data sources' }, { value: '+28%', label: 'Campaign conversion uplift' }, { value: '1', label: 'Unified customer view' }],
    },
    coverUrl: null,
    sortOrder: 10,
    status: PublishStatus.PUBLISHED,
    publishedAt,
  },
  {
    slug: 'logistics-cloud-modernization',
    title: text('物流企业核心系统云原生改造', 'Cloud-Native Modernization for a Logistics Provider'),
    summary: text(
      '在保障业务连续性的前提下完成核心系统分阶段改造，显著提升发布效率与高峰承载能力。',
      'Incremental modernization preserved business continuity while improving release velocity and peak capacity.',
    ),
    content: text(
      '## 挑战\n\n业务高峰期间系统扩容缓慢，传统发布流程需要较长停机窗口。\n\n## 方案\n\n诺川科技通过服务边界梳理、容器化改造、自动扩缩容与全链路观测，分阶段完成核心系统现代化。\n\n## 成效\n\n新平台支持更频繁的独立发布，并为高峰容量和故障定位提供统一数据。',
      '## Challenge\n\nSystems scaled slowly during demand peaks, and traditional releases required long maintenance windows.\n\n## Solution\n\nNEXORA modernized the core platform incrementally through service boundaries, containerization, autoscaling, and end-to-end observability.\n\n## Outcome\n\nThe new platform supports frequent independent releases and provides consistent data for peak capacity planning and incident diagnosis.',
    ),
    clientName: 'Demo Logistics Network',
    industry: 'logistics',
    results: {
      zh: [{ value: '-80%', label: '发布时间' }, { value: '3x', label: '高峰弹性容量' }, { value: '-50%', label: '故障恢复时间' }],
      en: [{ value: '-80%', label: 'Release time' }, { value: '3x', label: 'Peak elastic capacity' }, { value: '-50%', label: 'Recovery time' }],
    },
    coverUrl: null,
    sortOrder: 20,
    status: PublishStatus.PUBLISHED,
    publishedAt,
  },
]

const newsPosts = [
  {
    slug: 'nexora-ai-platform-release',
    title: text('诺川企业级 AI 应用平台正式发布', 'NEXORA Launches Its Enterprise AI Application Platform'),
    summary: text(
      '新平台将知识检索、模型编排、评估与审计整合到统一的企业级工作流中。',
      'The new platform brings knowledge retrieval, model orchestration, evaluation, and audit into one enterprise workflow.',
    ),
    content: text(
      '## 从试点走向生产\n\n企业 AI 项目需要同时回答效果、安全与运营问题。诺川企业级 AI 应用平台围绕这三个目标提供统一能力。\n\n### 平台亮点\n\n- 支持多模型接入与统一路由\n- 提供知识库检索与引用追溯\n- 内置评估、权限和审计能力\n\n平台可与现有业务系统逐步集成，帮助团队以可验证的方式扩展智能应用。',
      '## From pilots to production\n\nEnterprise AI initiatives must address quality, security, and operations together. The NEXORA Enterprise AI Application Platform unifies these capabilities.\n\n### Platform highlights\n\n- Multi-model integration and unified routing\n- Knowledge retrieval with traceable citations\n- Built-in evaluation, access control, and audit\n\nThe platform integrates incrementally with existing business systems so teams can scale intelligent applications with evidence.',
    ),
    seo: {
      title: text('企业级 AI 应用平台发布｜诺川科技', 'Enterprise AI Platform Launch | NEXORA'),
      description: text('了解诺川企业级 AI 应用平台的模型、知识与评估能力。', 'Explore the model, knowledge, and evaluation capabilities of the NEXORA enterprise AI platform.'),
    },
    coverUrl: null,
    status: PublishStatus.PUBLISHED,
    publishedAt: new Date('2026-09-18T09:00:00.000Z'),
  },
  {
    slug: 'data-intelligence-playbook',
    title: text('数据智能实践：先统一指标，再建设驾驶舱', 'Data Intelligence in Practice: Align Metrics Before Building Dashboards'),
    summary: text(
      '一套可落地的指标治理方法，帮助团队避免“图表很多、答案不一致”的常见问题。',
      'A practical approach to metrics governance that helps teams avoid having many dashboards but inconsistent answers.',
    ),
    content: text(
      '## 为什么先看指标\n\n驾驶舱只是数据消费的入口。若指标定义、负责人和计算口径不一致，再精美的界面也无法建立信任。\n\n### 三个实施步骤\n\n1. 明确关键业务问题与决策动作。\n2. 为核心指标建立定义、口径和责任人。\n3. 用数据质量与血缘保障持续运行。\n\n当指标治理成为日常机制，数据分析才能真正支持组织协同。',
      '## Why metrics come first\n\nA dashboard is only an entry point for data consumption. Without consistent definitions, ownership, and calculations, even a polished interface cannot build trust.\n\n### Three implementation steps\n\n1. Identify the key business questions and decisions.\n2. Establish definitions, calculations, and owners for core metrics.\n3. Sustain operations with data quality and lineage.\n\nAnalytics supports organizational alignment only when metrics governance becomes a routine practice.',
    ),
    seo: {
      title: text('数据指标治理实践｜诺川科技', 'Data Metrics Governance Practices | NEXORA'),
      description: text('学习如何通过指标定义、责任与数据质量建立可信分析。', 'Learn how metric definitions, ownership, and data quality create trusted analytics.'),
    },
    coverUrl: null,
    status: PublishStatus.PUBLISHED,
    publishedAt: new Date('2026-08-28T09:00:00.000Z'),
  },
  {
    slug: 'cloud-native-modernization-guide',
    title: text('云原生现代化指南：用渐进式演进降低风险', 'A Guide to Cloud-Native Modernization Through Incremental Change'),
    summary: text(
      '从业务约束出发规划架构演进，避免一次性重写并持续验证每一步价值。',
      'Plan architecture evolution around business constraints, avoid a big-bang rewrite, and validate value at every step.',
    ),
    content: text(
      '## 现代化不是一次性搬迁\n\n成功的云原生项目通常从可观测性、交付流程和关键服务边界开始，而不是直接重写全部系统。\n\n### 推荐路径\n\n1. 建立业务与技术指标基线。\n2. 优先改造约束最强、收益最明确的环节。\n3. 通过自动化测试和渐进发布控制风险。\n\n持续度量和回滚能力，是每一次架构演进的必要保障。',
      '## Modernization is not a one-time migration\n\nSuccessful cloud-native programs usually begin with observability, delivery workflows, and critical service boundaries rather than rewriting the entire system.\n\n### A recommended path\n\n1. Establish business and technical baselines.\n2. Prioritize the most constrained areas with clear benefits.\n3. Control risk through automated testing and progressive delivery.\n\nContinuous measurement and rollback capability are essential safeguards for every architecture change.',
    ),
    seo: {
      title: text('云原生渐进式现代化指南｜诺川科技', 'Incremental Cloud-Native Modernization Guide | NEXORA'),
      description: text('了解如何以渐进方式提升系统弹性、观测与交付能力。', 'Learn how incremental modernization improves resilience, observability, and delivery.'),
    },
    coverUrl: null,
    status: PublishStatus.PUBLISHED,
    publishedAt: new Date('2026-08-08T09:00:00.000Z'),
  },
  {
    slug: 'draft-preview',
    title: text('草稿预览：智能运营新实践', 'Draft Preview: New Practices for Intelligent Operations'),
    summary: text(
      '这是一条用于验证草稿隔离的演示新闻，不应出现在公共列表或详情页。',
      'This demo post verifies draft isolation and must not appear in public lists or detail pages.',
    ),
    content: text(
      '## 内部草稿\n\n此内容仅用于后台编辑与发布流程验证。完成审核后，编辑可以补充正式正文并发布。',
      '## Internal draft\n\nThis content exists only to verify the admin editing and publishing workflow. Editors can complete and publish it after review.',
    ),
    seo: {
      title: text('智能运营新实践草稿｜诺川科技', 'Intelligent Operations Draft | NEXORA'),
      description: text('用于验证草稿隔离的中文演示内容。', 'English demo content used to verify draft isolation.'),
    },
    coverUrl: null,
    status: PublishStatus.DRAFT,
    publishedAt: null,
  },
]

async function main() {
  await prisma.siteSetting.upsert({
    where: { id: siteSetting.id },
    create: siteSetting,
    update: siteSetting,
  })

  for (const item of navigationItems) {
    await prisma.navigationItem.upsert({
      where: { id: item.id },
      create: item,
      update: item,
    })
  }

  for (const section of homeSections) {
    await prisma.homeSection.upsert({
      where: { type: section.type },
      create: section,
      update: section,
    })
  }

  for (const solution of solutions) {
    await prisma.solution.upsert({
      where: { slug: solution.slug },
      create: solution,
      update: solution,
    })
  }

  for (const caseStudy of cases) {
    await prisma.caseStudy.upsert({
      where: { slug: caseStudy.slug },
      create: caseStudy,
      update: caseStudy,
    })
  }

  for (const post of newsPosts) {
    await prisma.newsPost.upsert({
      where: { slug: post.slug },
      create: post,
      update: post,
    })
  }

  console.log('Seed complete: 8 home sections, 3 solutions, 3 cases, and 4 news posts.')
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Database seed failed')
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
