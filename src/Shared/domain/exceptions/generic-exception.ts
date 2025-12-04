import { DomainException } from "./domain-exception"

export class GenericException extends DomainException {
  message: string
  name = "generic_exception"

  constructor(message: string) {
    super()
    this.message = message
  }
}
