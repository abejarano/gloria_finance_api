import { DomainException } from "@/Shared/domain"

export class MemberNotFound extends DomainException {
  name = "MEMBER_NOT_FOUND"
  message = "The member not found"
}
