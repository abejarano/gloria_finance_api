import {
  type IMemberRepository,
  type Member,
  MemberNotFound,
} from "../../domain"

import { Logger } from "@/Shared/adapter"

export class FindMemberById {
  private logger = Logger(FindMemberById.name)

  constructor(private readonly memberRepository: IMemberRepository) {}

  async execute(memberId: string | undefined): Promise<Member> {
    this.logger.info(`search member by id: ${memberId}`)

    if (!memberId) {
      this.logger.error(`Member ID is required`)
      throw new MemberNotFound()
    }

    const member = await this.memberRepository.one({ memberId })

    if (!member) {
      this.logger.error(`Member not found`)
      throw new MemberNotFound()
    }
    this.logger.info(`Member found: ${member.getName()}`)

    return member
  }
}
