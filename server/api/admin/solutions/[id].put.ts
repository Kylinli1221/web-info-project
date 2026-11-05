import { defineEventHandler } from 'h3'
import type { Prisma } from '../../../../generated/prisma/client'
import { solutionUpdateSchema } from '../../../../shared/schemas/content'
import { idParam, publicationData, parseAdminBody } from '../../../utils/admin-content'
import { notFound } from '../../../utils/content'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const input = await parseAdminBody(event, solutionUpdateSchema)
    const id = idParam(event)
    const existing = await prisma.solution.findUnique({ where: { id }, select: { publishedAt: true } })
    if (!existing) notFound()
    return await prisma.solution.update({
      where: { id },
      data: publicationData(input, existing.publishedAt) as unknown as Prisma.SolutionUpdateInput,
    })
  } catch (error) {
    handleApiError(error)
  }
})
