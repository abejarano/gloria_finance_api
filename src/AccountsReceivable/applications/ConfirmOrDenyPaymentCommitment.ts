import {
  AccountReceivableNotFound,
  ConfirmOrDenyPaymentCommitmentRequest,
  IAccountsReceivableRepository,
} from "@/AccountsReceivable/domain"
import { Logger } from "@/Shared/adapter"

export class ConfirmOrDenyPaymentCommitment {
  private logger = Logger(ConfirmOrDenyPaymentCommitment.name)

  constructor(
    private readonly accountReceivableRepository: IAccountsReceivableRepository
  ) {}

  async execute(req: ConfirmOrDenyPaymentCommitmentRequest): Promise<void> {
    this.logger.info(`Start Confirm Or Deny Payment Commitment`, req)

    const account = await this.accountReceivableRepository.one({
      token: req.token,
    })

    if (!account) {
      this.logger.debug(`Account Receivable not found`)
      throw new AccountReceivableNotFound()
    }

    account.accountAccepted(req.status === "ACCEPTED")

    await this.accountReceivableRepository.upsert(account)

    this.logger.info(`Confirm Or Deny Payment Commitment finish`)
  }
}
