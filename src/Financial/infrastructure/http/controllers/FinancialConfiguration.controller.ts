import domainResponse from "@/Shared/helpers/domainResponse"
import { ConceptType } from "@/Financial/domain"
import { FindFinancialConceptsByChurchIdAndTypeConcept } from "@/Financial/applications"
import { FinancialConceptMongoRepository } from "../../persistence"
import { HttpStatus } from "@/Shared/domain"
import { ChurchMongoRepository } from "@/Church/infrastructure"

export class FinancialConfigurationController {
  static async findFinancialConceptsByChurchIdAndTypeConcept(
    churchId: string,
    res,
    typeConcept?: ConceptType
  ) {
    try {
      const financial = await new FindFinancialConceptsByChurchIdAndTypeConcept(
        FinancialConceptMongoRepository.getInstance(),
        ChurchMongoRepository.getInstance()
      ).execute(churchId, typeConcept)

      res.status(HttpStatus.OK).send(financial)
    } catch (e) {
      domainResponse(e, res)
    }
  }
}
