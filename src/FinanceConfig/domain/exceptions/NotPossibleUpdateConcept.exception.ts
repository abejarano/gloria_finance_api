import { DomainException } from "@/Shared/domain"

export class NotPossibleUpdateConcept extends DomainException {
  message: string =
    "The concept you want to update was created by the system. It is not possible to update it."
  name: string = "NOT_POSSIBLE_UPDATE_CONCEPT"
}
