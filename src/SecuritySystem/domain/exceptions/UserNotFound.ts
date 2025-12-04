import { DomainException } from "@/Shared/domain"

export class UserNotFound extends DomainException {
  message: string
  name = "USER_NOT_FOUND"

  constructor(email: string) {
    super()
    this.message = `User with email ${email} was not found in the system.`
  }
}
