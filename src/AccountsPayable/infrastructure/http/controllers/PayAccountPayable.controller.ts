import domainResponse from "@/Shared/helpers/domainResponse"
import { Response } from "express"
import { PayAccountPayableRequest } from "@/AccountsPayable/domain"
import { QueueService } from "@/Shared/infrastructure"
import { AvailabilityAccountMongoRepository } from "@/Financial/infrastructure/persistence"
import { HttpStatus } from "@/Shared/domain"
import { PayAccountPayable } from "@/AccountsPayable/applications/PayAccountPayable"
import { AccountsPayableMongoRepository } from "@/AccountsPayable/infrastructure/persistence/AccountsPayableMongoRepository"
import {
  FinancialConceptMongoRepository,
  FinancialConfigurationMongoRepository,
} from "@/FinanceConfig/infrastructure/presistence"

/**
 * @function PayAccountPayableController
 * @description Handles the payment of an account payable
 *
 * @param req
 * @param res
 *
 * @returns {Promise<void>} - Promise that resolves when the operation is completed
 */
export const PayAccountPayableController = async (
  req: PayAccountPayableRequest,
  res: Response
): Promise<void> => {
  try {
    await new PayAccountPayable(
      AvailabilityAccountMongoRepository.getInstance(),
      AccountsPayableMongoRepository.getInstance(),
      QueueService.getInstance(),
      FinancialConceptMongoRepository.getInstance(),
      FinancialConfigurationMongoRepository.getInstance()
    ).execute(req)

    res
      .status(HttpStatus.OK)
      .json({ message: "Account payable paid successfully" })
  } catch (e) {
    domainResponse(e, res)
  }
}
