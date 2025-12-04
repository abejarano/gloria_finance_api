import { DomainException } from "@/Shared/domain"

export class UserFound extends DomainException {
  message: string
  name = "user_exists"

  constructor(email: string) {
    super()
    this.message = `The email ${email} is already registered on the platform.`
  }
}
