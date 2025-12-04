import { DomainException } from "@/Shared/domain"

export class UserDisabled extends DomainException {
  message: string
  name = "USER_DISABLED"

  constructor(email: string) {
    super()
    this.message = `User with email ${email} fue deshabilitado en la plataforma.`
  }
}
