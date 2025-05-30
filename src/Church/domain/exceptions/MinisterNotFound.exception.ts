import { DomainException } from "@/Shared/domain"

export class MinisterNotFound extends DomainException {
  code = "MINISTER_NOT_FOUND"
  message = "The minister not found"
}
