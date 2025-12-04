import { DomainException } from "@/Shared/domain"

export class MemberExist extends DomainException {
  name = "MEMBER_EXIST"
  message = "The member already exist"
}
