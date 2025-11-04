import { Router } from "express"
import { PermissionMiddleware } from "@/Shared/infrastructure"
import { BankRequest } from "@/banking/domain"
import { CreateOrUpdateBankController } from "@/banking/infrastructure/http/controllers/CreateOrUpdateBank.controller"
import { FindBankByBankIdController } from "@/banking/infrastructure/http/controllers/SearchBank.controller"
import bankValidator from "@/banking/infrastructure/http/validators/Bank.validator"
import bankBRValidator from "@/banking/infrastructure/http/validators/BankBR.validator"
import { listBankByChurchIdController } from "@/banking/infrastructure/http/controllers/ListBanks.controller"

const bankRoute = Router()

//TODO sera necesario crear endpoint por pais para el registro de banco?
bankRoute.post(
  "/",
  [PermissionMiddleware, bankValidator, bankBRValidator],
  async (req, res) => {
    await CreateOrUpdateBankController(req.body as BankRequest, res)
  }
)

bankRoute.get("/data/:bankId", PermissionMiddleware, async (req, res) => {
  await FindBankByBankIdController(req.params.bankId, res)
})

bankRoute.get("/:churchId", PermissionMiddleware, async (req, res) => {
  await listBankByChurchIdController(req.params.churchId, res)
})

export default bankRoute
