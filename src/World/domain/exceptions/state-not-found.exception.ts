import { DomainException } from "@/Shared/domain"

export class StateNotFound extends DomainException {
  message = "State not found"
  name = "STATE_NOT_FOUND"
}
