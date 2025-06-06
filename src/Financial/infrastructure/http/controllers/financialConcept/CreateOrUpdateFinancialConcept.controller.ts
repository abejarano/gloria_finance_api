import { FinancialConceptRequest } from "@/Financial/domain"
import { Response } from "express"
import domainResponse from "@/Shared/helpers/domainResponse"
import { CreateOrUpdateFinancialConcept } from "@/Financial/applications"
import { FinancialConceptMongoRepository } from "@/Financial/infrastructure/persistence"
import { ChurchMongoRepository } from "@/Church/infrastructure"
import { HttpStatus } from "@/Shared/domain"

export const CreateOrUpdateFinancialConceptController = async (
  req: FinancialConceptRequest,
  res: Response
) => {
  try {
    await new CreateOrUpdateFinancialConcept(
      FinancialConceptMongoRepository.getInstance(),
      ChurchMongoRepository.getInstance()
    ).execute(req)

    res.status(HttpStatus.CREATED).send({
      message: "Financial concept created or updated successfully",
    })
  } catch (error) {
    domainResponse(error, res)
  }
}
