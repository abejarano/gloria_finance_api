import { Logger } from "@/Shared/adapter"
import { Validator } from "node-input-validator"
import { HttpStatus } from "@/Shared/domain"

export default async (req, res, next) => {
  const payload = req.query
  const logger = Logger("FinancialMonthValidator")

  logger.info(`Validando meses financieros`, payload)

  const rule = {
    year: "required|numeric",
  }

  const v = new Validator(payload, rule)

  const matched = await v.check()

  if (!matched) {
    return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send(v.errors)
  }

  next()
}
