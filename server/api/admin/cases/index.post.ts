import { defineEventHandler, setResponseStatus } from 'h3'
import type { Prisma } from '../../../../generated/prisma/client'
import { caseCreateSchema } from '../../../../shared/schemas/content'
import { publicationData, parseAdminBody } from '../../../utils/admin-content'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const input = await parseAdminBody(event, caseCreateSchema)
    const record = await prisma.caseStudy.create({
      data: publicationData(input) as unknown as Prisma.CaseStudyCreateInput,
    })
    setResponseStatus(event, 201)
    return record
  } catch (error) {
    handleApiError(error)
  }
})
