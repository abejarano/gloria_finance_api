import { DomainException } from "@/Shared/domain"

export class ChurchNotFound extends DomainException {
  code = "CHURCH_NOT_FOUND"
  message = "The Church not found"
}
