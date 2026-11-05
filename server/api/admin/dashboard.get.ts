import { defineEventHandler } from 'h3'
import { PublishStatus } from '../../../generated/prisma/client'
import { handleApiError } from '../../utils/http'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  try {
    const [
      solutionsPublished,
      solutionsDraft,
      casesPublished,
      casesDraft,
      newsPublished,
      newsDraft,
      unreadMessages,
      latestMessages,
    ] = await Promise.all([
      prisma.solution.count({ where: { status: PublishStatus.PUBLISHED } }),
      prisma.solution.count({ where: { status: PublishStatus.DRAFT } }),
      prisma.caseStudy.count({ where: { status: PublishStatus.PUBLISHED } }),
      prisma.caseStudy.count({ where: { status: PublishStatus.DRAFT } }),
      prisma.newsPost.count({ where: { status: PublishStatus.PUBLISHED } }),
      prisma.newsPost.count({ where: { status: PublishStatus.DRAFT } }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          company: true,
          message: true,
          locale: true,
          isRead: true,
          createdAt: true,
        },
      }),
    ])

    return {
      counts: {
        solutions: { published: solutionsPublished, draft: solutionsDraft },
        cases: { published: casesPublished, draft: casesDraft },
        news: { published: newsPublished, draft: newsDraft },
        unreadMessages,
      },
      latestMessages,
    }
  } catch (error) {
    handleApiError(error)
  }
})
