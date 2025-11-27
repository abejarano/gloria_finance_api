import {
  FilterContributionsRequest,
  OnlineContributions,
  OnlineContributionsStatus,
} from "../../../domain"
import domainResponse from "@/Shared/helpers/domainResponse"
import {
  ListContributions,
  UpdateContributionStatus,
} from "../../../applications"
import { HttpStatus } from "@/Shared/domain"
import { QueueService } from "@/Shared/infrastructure"
import MemberContributionsDTO from "../dto/MemberContributions.dto"
import {
  AvailabilityAccountMongoRepository,
  OnlineContributionsMongoRepository,
} from "../../persistence"
import { AccountsReceivableMongoRepository } from "@/AccountsReceivable/infrastructure/persistence/AccountsReceivableMongoRepository"
import { FinanceRecordMongoRepository } from "@/Financial/infrastructure/persistence/FinanceRecordMongoRepository"
import { Logger } from "@/Shared/adapter"
import { Response } from "express"
import { Paginate } from "@abejarano/ts-mongodb-criteria"

export const listOnlineContributionsController = async (
  request: FilterContributionsRequest,
  res: Response
) => {
  const logger = Logger("listOnlineContributionsController")
  logger.info(`Filtering online contributions with: `, request)

  try {
    const list: Paginate<OnlineContributions> = await new ListContributions(
      OnlineContributionsMongoRepository.getInstance()
    ).execute(request)

    res.status(HttpStatus.OK).send(await MemberContributionsDTO(list))
  } catch (e) {
    domainResponse(e, res)
  }
}

export const UpdateContributionStatusController = async (
  contributionId: string,
  status: OnlineContributionsStatus,
  createdBy: string,
  res: Response
) => {
  try {
    await new UpdateContributionStatus(
      OnlineContributionsMongoRepository.getInstance(),
      QueueService.getInstance(),
      FinanceRecordMongoRepository.getInstance(),
      AvailabilityAccountMongoRepository.getInstance(),
      AccountsReceivableMongoRepository.getInstance()
    ).execute(contributionId, status, createdBy)

    res.status(HttpStatus.OK).send({ message: "Contribution updated" })
  } catch (e) {
    domainResponse(e, res)
  }
}
