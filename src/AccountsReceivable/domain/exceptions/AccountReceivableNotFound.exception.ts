import { DomainException } from "@/Shared/domain"

export class AccountReceivableNotFound extends DomainException {
  name = "ACCOUNT_RECEIVABLE_NOT_FOUND"
  message = "Account receivable not found"
}
