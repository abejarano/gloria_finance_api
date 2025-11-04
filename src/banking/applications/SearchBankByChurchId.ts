import { IBankRepository } from "@/banking/domain"
import { Bank } from "@/banking/domain/Bank"

export class SearchBankByChurchId {
  constructor(private readonly bankRepository: IBankRepository) {}

  async execute(churchId: string): Promise<Bank[]> {
    return this.bankRepository.list(churchId)
  }
}
