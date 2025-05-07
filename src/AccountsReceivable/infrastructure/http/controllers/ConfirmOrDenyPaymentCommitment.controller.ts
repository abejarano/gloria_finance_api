import { Response } from "express"
import { ConfirmOrDenyPaymentCommitmentRequest } from "@/AccountsReceivable/domain"
import { ConfirmOrDenyPaymentCommitment } from "@/AccountsReceivable/applications"
import { AccountsReceivableMongoRepository } from "@/AccountsReceivable/infrastructure/persistence/AccountsReceivableMongoRepository"
import domainResponse from "@/Shared/helpers/domainResponse"

export const ConfirmOrDenyPaymentCommitmentController = async (
  req: ConfirmOrDenyPaymentCommitmentRequest,
  res: Response
) => {
  try {
    await new ConfirmOrDenyPaymentCommitment(
      AccountsReceivableMongoRepository.getInstance()
    ).execute(req)
  } catch (e) {
    domainResponse(e, res)
  }
}
