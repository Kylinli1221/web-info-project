import { defineEventHandler, setResponseStatus } from 'h3'
import type { Prisma } from '../../../../generated/prisma/client'
import { newsCreateSchema } from '../../../../shared/schemas/content'
import { publicationData, parseAdminBody } from '../../../utils/admin-content'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const input = await parseAdminBody(event, newsCreateSchema)
    const record = await prisma.newsPost.create({
      data: publicationData(input) as unknown as Prisma.NewsPostCreateInput,
    })
    setResponseStatus(event, 201)
    return record
  } catch (error) {
    handleApiError(error)
  }
})
