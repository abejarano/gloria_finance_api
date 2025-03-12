import { BankNotFound } from "../../domain"
import { IFinancialConfigurationRepository } from "../../domain/interfaces"
import { Logger } from "../../../Shared/adapter"

export class FinBankByBankId {
  private logger = Logger("FinBankByBankId")

  constructor(
    private readonly financialConfigurationRepository: IFinancialConfigurationRepository
  ) {}

  async execute(bankId: string) {
    this.logger.info(`Finding bank by bankId: ${bankId}`)

    const bank =
      await this.financialConfigurationRepository.findBankByBankId(bankId)

    if (!bank) {
      this.logger.error(`Bank not found: ${bankId}`)
      throw new BankNotFound()
    }

    this.logger.info(`Bank found: `, bank)
    return bank
  }
}
