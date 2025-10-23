import { NextFunction, Request, Response } from "express"
import { Validator } from "node-input-validator"
import { HttpStatus } from "@/Shared/domain"
import { Logger } from "@/Shared/adapter"

export default async (req: Request, res: Response, next: NextFunction) => {
  const payload = { ...req.body }
  const logger = Logger("CreateAccountPayableValidator")

  logger.info(`Validating`, payload)

  if (payload.taxes === null) {
    payload.taxes = []
  }

  if (payload.taxMetadata === null) {
    payload.taxMetadata = undefined
  }

  const rule: Record<string, string> = {
    supplierId: "required|string",
    description: "required|string",
    amountTotal: "sometimes|numeric",
    installments: "required|array",
    "installments.*.amount": "required|numeric",
    "installments.*.dueDate": "required|date",
  }

  if (Array.isArray(payload.taxes)) {
    Object.assign(rule, {
      taxes: "array",
      "taxes.*.taxType": "required|string",
      "taxes.*.percentage": "required|numeric",
      "taxes.*.amount": "numeric",
    })
  } else {
    rule.taxes = "sometimes|array"
  }

  if (payload.taxMetadata) {
    Object.assign(rule, {
      taxMetadata: "object",
      "taxMetadata.status":
        "string|in:TAXED,EXEMPT,SUBSTITUTION,NOT_APPLICABLE",
      "taxMetadata.taxExempt": "boolean",
      "taxMetadata.exemptionReason": "string",
      "taxMetadata.cstCode": "string",
      "taxMetadata.cfop": "string",
      "taxMetadata.observation": "string",
    })
  } else {
    rule.taxMetadata = "sometimes|object"
  }

  const v = new Validator(payload, rule)
  const matched = await v.check()
  if (!matched) {
    return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send(v.errors)
  }

  if (!Array.isArray(payload.installments) || payload.installments.length === 0) {
    return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
      installments: {
        message:
          "At least one installment must be provided. Register invoices issued separately as individual accounts payable (scenario B).",
        rule: "minLength",
      },
    })
  }

  const hasTaxes = Array.isArray(payload.taxes) && payload.taxes.length > 0
  const taxExemptFlag = payload.taxMetadata?.taxExempt

  if (taxExemptFlag === true && hasTaxes) {
    return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
      taxes: {
        message: "Tax lines must be empty when taxMetadata.taxExempt is true.",
        rule: "forbidden_when_exempt",
      },
    })
  }

  if (taxExemptFlag === false && !hasTaxes) {
    return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send({
      taxes: {
        message:
          "Provide at least one tax line when the payable is not marked as tax-exempt.",
        rule: "required_when_taxable",
      },
    })
  }

  req.body.taxes = payload.taxes
  req.body.taxMetadata = payload.taxMetadata

  next()
}
