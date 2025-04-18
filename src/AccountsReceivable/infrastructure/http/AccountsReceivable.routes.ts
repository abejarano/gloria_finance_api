import { Router } from "express"

import { PermissionMiddleware } from "@/Shared/infrastructure"
import {
  CreateAccountReceivableController,
  ListAccountReceivableController,
  PayAccountReceivableController,
} from "@/AccountsReceivable/infrastructure/http/controllers"
import { FilterAccountReceivableRequest } from "@/AccountsReceivable/domain"
import PayAccountReceivableValidator from "@/AccountsReceivable/infrastructure/http/validators/PayAccountReceivable.validator"
import { AmountValue } from "@/Shared/domain"
import CreateAccountReceivableValidator from "@/AccountsReceivable/infrastructure/http/validators/CreateAccountReceivable.validator"

const accountsReceivableRoutes = Router()

accountsReceivableRoutes.post(
  "/",
  [PermissionMiddleware, CreateAccountReceivableValidator],
  async (req, res) => {
    await CreateAccountReceivableController(
      { ...req.body, churchId: req["user"].churchId },
      res
    )
  }
)

accountsReceivableRoutes.get("", PermissionMiddleware, async (req, res) => {
  await ListAccountReceivableController(
    {
      ...(req.query as unknown as FilterAccountReceivableRequest),
      churchId: req["user"].churchId,
    },
    res
  )
})

accountsReceivableRoutes.post(
  "/pay",
  [PermissionMiddleware, PayAccountReceivableValidator],
  async (req, res) => {
    const installmentId = req.body.installmentId
    let installmentIds: string[] = []

    if (installmentId.includes(",")) {
      installmentIds = installmentId.split(",")
    } else {
      installmentIds = [installmentId]
    }

    await PayAccountReceivableController(
      {
        ...req.body,
        churchId: req["user"].churchId,
        installmentIds,
        amount: AmountValue.create(req.body.amount),
        file: req?.files?.file,
      },
      res
    )
  }
)

export default accountsReceivableRoutes
