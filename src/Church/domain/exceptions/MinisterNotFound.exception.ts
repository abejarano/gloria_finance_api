import { DomainException } from "@/Shared/domain"

export class MinisterNotFound extends DomainException {
  name = "MINISTER_NOT_FOUND"
  message = "The minister not found"
}
