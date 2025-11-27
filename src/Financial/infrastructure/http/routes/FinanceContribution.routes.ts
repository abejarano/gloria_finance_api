import { Router } from "express"
import { Can, PermissionMiddleware } from "@/Shared/infrastructure"
import {
  listOnlineContributionsController,
  UpdateContributionStatusController,
} from "../controllers/OnlineContribution.controller"
import {
  FilterContributionsRequest,
  OnlineContributionsStatus,
} from "../../../domain"

const financeContribution = Router()

financeContribution.get(
  "/",
  PermissionMiddleware,
  Can("financial_records", ["list_contributions", "adm_contributions"]),
  async (req, res) => {
    let filter = {
      ...(req.query as unknown as FilterContributionsRequest),
    }

    if (req.auth.isSuperuser && filter.churchId === undefined) {
      delete filter.churchId
    } else {
      filter.churchId = req.auth.churchId
    }

    await listOnlineContributionsController(filter, res)
  }
)

financeContribution.patch(
  "/:contributionId/status/:status",
  PermissionMiddleware,
  Can("financial_records", "adm_contributions"),
  async (req, res) => {
    await UpdateContributionStatusController(
      req.params.contributionId,
      req.params.status as OnlineContributionsStatus,
      req.auth.name,
      res
    )
  }
)

export default financeContribution
