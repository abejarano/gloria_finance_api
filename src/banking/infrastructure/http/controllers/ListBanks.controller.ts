import { HttpStatus } from "@/Shared/domain"
import domainResponse from "@/Shared/helpers/domainResponse"
import { SearchBankByChurchId } from "@/banking/applications"
import { BankMongoRepository } from "@/banking/infrastructure/persistence"

export const listBankByChurchIdController = async (churchId: string, res) => {
  try {
    const bank = await new SearchBankByChurchId(
      BankMongoRepository.getInstance()
    ).execute(churchId)

    res.status(HttpStatus.OK).send(bank)
  } catch (e) {
    domainResponse(e, res)
  }
}
