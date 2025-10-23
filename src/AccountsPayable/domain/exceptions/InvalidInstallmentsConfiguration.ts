import { DomainException } from "@/Shared/domain"

export class InvalidInstallmentsConfiguration extends DomainException {
  name = "INVALID_INSTALLMENTS_CONFIGURATION"
  message =
    "Installments must be provided with amounts that match the payable total within the allowed tolerance."

  constructor(message?: string) {
    super()
    if (message) {
      this.message = message
    }
  }
}
