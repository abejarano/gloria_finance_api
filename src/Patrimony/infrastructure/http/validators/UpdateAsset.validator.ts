import { Logger } from "@/Shared/adapter"
import { HttpStatus } from "@/Shared/domain"
import { AssetStatus } from "../../../domain"
import { Validator } from "node-input-validator"

const logger = Logger("UpdateAssetValidator")

export default async (req, res, next) => {
  const payload = req.body

  logger.info("Validating update asset payload", payload)

  const statusValues = Object.values(AssetStatus).join(",")

  const rules = {
    assetId: "required|string",
    name: "string",
    category: "string",
    value: "numeric",
    acquisitionDate: "dateFormat:YYYY-MM-DD",
    congregationId: "string",
    location: "string",
    responsibleId: "string",
    status: `in:${statusValues}`,
    attachments: "array",
    "attachments.*.name": "required|string",
    "attachments.*.url": "required|string",
    "attachments.*.mimetype": "required|string",
    "attachments.*.size": "required|integer",
  }

  const validator = new Validator(payload, rules)

  const matched = await validator.check()

  if (!matched) {
    return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send(validator.errors)
  }

  if (Array.isArray(payload.attachments) && payload.attachments.length > 3) {
    return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
      attachments: {
        message: "Limite máximo de 3 anexos por bem patrimonial.",
        rule: "max",
      },
    })
  }

  next()
}
