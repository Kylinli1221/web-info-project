import { Prisma } from '../../generated/prisma/client'
import type { SettingsInput } from '../../shared/schemas/content'
import { prisma } from '../utils/prisma'

function settingsData(input: SettingsInput) {
  return {
    ...input,
    address: input.address === null ? Prisma.DbNull : input.address,
  } as unknown as Prisma.SiteSettingUncheckedUpdateInput
}

export const defaultSettings: SettingsInput = {
  logoLightUrl: null,
  logoDarkUrl: null,
  faviconUrl: null,
  siteName: { zh: 'NEXORA 诺川科技', en: 'NEXORA' },
  contactEmail: '',
  phone: null,
  address: { zh: '', en: '' },
  socialLinks: [],
  seo: {
    title: { zh: 'NEXORA 诺川科技｜软件与数字技术', en: 'NEXORA | Software and Digital Technology' },
    description: {
      zh: '以人工智能、数据智能和云原生技术，帮助企业构建面向未来的数字能力。',
      en: 'AI, data intelligence, and cloud-native technology for future-ready digital capabilities.',
    },
    keywords: { zh: '人工智能,数据智能,云原生,数字化', en: 'AI,data intelligence,cloud native,digital transformation' },
  },
  footer: {
    copyright: { zh: '© NEXORA 诺川科技。保留所有权利。', en: '© NEXORA. All rights reserved.' },
    icpNumber: '',
    icpUrl: '',
    publicSecurityNumber: '',
    publicSecurityUrl: '',
    links: [],
  },
}

export async function getOrCreateSettings() {
  return prisma.siteSetting.upsert({
    where: { id: 1 },
    create: { id: 1, ...settingsData(defaultSettings) } as Prisma.SiteSettingUncheckedCreateInput,
    update: {},
  })
}

export async function updateSettings(input: SettingsInput) {
  const data = settingsData(input)
  return prisma.siteSetting.upsert({
    where: { id: 1 },
    create: { id: 1, ...data } as Prisma.SiteSettingUncheckedCreateInput,
    update: data,
  })
}
