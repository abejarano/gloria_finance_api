import { Logger } from "@/Shared/adapter"
import { HttpStatus } from "@/Shared/domain"
import { Validator } from "node-input-validator"

export default async (req, res, next) => {
  const payload = req.body
  const logger = Logger("CustomerValidator")

  logger.info(`Validating customer`, payload)

  const rule = {
    "representative.name": "required|string",
    "representative.email": "required|email",
    "representative.phone": "required|string",
    "representative.rol": "required|string",
    name: "required|string",
    email: "required|email",
    phone: "required|string",
    "address.street": "required|string",
    "address.number": "required|string",
    "address.city": "required|string",
    "address.postalCode": "string",
    "address.country": "required|string",
    lang: "string|in:pt-BR,es,en",
  }

  const v = new Validator(payload, rule)

  const matched = await v.check()

  if (!matched) {
    return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send(v.errors)
  }

  next()
}
