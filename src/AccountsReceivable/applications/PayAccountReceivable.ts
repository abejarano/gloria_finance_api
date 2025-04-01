import { Logger } from "@/Shared/adapter"
import {
  AccountReceivable,
  AccountReceivablePaid,
  IAccountsReceivableRepository,
  InstallmentNotFound,
  InstallmentsStatus,
  PayAccountReceivableNotFound,
  PayAccountReceivableRequest,
} from "@/AccountsReceivable/domain"

export class PayAccountReceivable {
  private logger = Logger("PayAccountReceivable")

  constructor(
    private readonly accountReceivableRepository: IAccountsReceivableRepository
  ) {}

  async execute(req: PayAccountReceivableRequest) {
    this.logger.info(`Start Pay Account Receivable`, req)

    const accountReceivable: AccountReceivable =
      await this.accountReceivableRepository.one(req.accountReceivableId)
    if (!accountReceivable) {
      this.logger.debug(`Account Receivable not found`)
      throw new PayAccountReceivableNotFound()
    }

    const installment = accountReceivable.getInstallment(req.installmentId)

    if (!installment) {
      this.logger.debug(`Installment ${req.installmentId} not found`)
      throw new InstallmentNotFound(req.installmentId)
    }

    if (installment.status === InstallmentsStatus.PAID) {
      this.logger.debug(`Installment ${req.installmentId} already paid`)
      throw new AccountReceivablePaid()
    }

    if (installment.status === InstallmentsStatus.PENDING) {
      installment.status =
        req.amount.getValue() === installment.amount
          ? InstallmentsStatus.PAID
          : InstallmentsStatus.PARTIAL
    } else if (installment.status === InstallmentsStatus.PARTIAL) {
      this.logger.info(
        `Installment ${req.installmentId} is was partial payment`
      )

      installment.status =
        req.amount.getValue() === installment.amountPending
          ? InstallmentsStatus.PAID
          : InstallmentsStatus.PARTIAL
    }

    installment.amountPaid = req.amount.getValue()
    installment.amountPending = installment.amount - req.amount.getValue()
    installment.financialTransactionId = req.financialTransactionId

    this.logger.info(`Installment ${req.installmentId} updated`, installment)

    accountReceivable.updateAmount(req.amount)

    this.logger.info(
      `Account Receivable ${req.accountReceivableId} updated, amount pending ${accountReceivable.getAmountPending()} 
      status ${accountReceivable.getStatus()}`
    )

    await this.accountReceivableRepository.upsert(accountReceivable)

    this.logger.info(`Finish Pay Account Receivable`)
  }
}
