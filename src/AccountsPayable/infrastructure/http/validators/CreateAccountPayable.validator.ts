import { NextFunction, Request, Response } from "express"
import { Validator } from "node-input-validator"
import { HttpStatus } from "@/Shared/domain"
import { Logger } from "@/Shared/adapter"

export default async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body
  const logger = Logger("CreateAccountPayableValidator")

  logger.info(`Validating`, payload)

  const rule: Record<string, string> = {
    supplierId: "required|string",
    description: "required|string",
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
      "taxMetadata.exemptionReason": "string",
      "taxMetadata.cstCode": "string",
      "taxMetadata.cfop": "string",
      "taxMetadata.observation": "string",
    })
  } else {
    rule.taxMetadata = "sometimes|object"
  }

  Object.assign(rule, {
    fiscalDocument: "sometimes|object",
    "fiscalDocument.status": "sometimes|string|in:ISSUED,NOT_ISSUED,NOT_REQUIRED",
    "fiscalDocument.justification": "sometimes|string",
    "fiscalDocument.fiscalNote": "sometimes|object",
    "fiscalDocument.fiscalNote.number": "sometimes|string",
    "fiscalDocument.fiscalNote.series": "sometimes|string",
    "fiscalDocument.fiscalNote.issueDate": "sometimes|date",
    "fiscalDocument.evidence": "sometimes|object",
    "fiscalDocument.evidence.type":
      "sometimes|string|in:RECEIPT,CONTRACT,DECLARATION,OTHER",
    "fiscalDocument.evidence.identifier": "sometimes|string",
    "fiscalDocument.evidence.description": "sometimes|string",
    "fiscalDocument.evidence.issuedAt": "sometimes|date",
  })

  const v = new Validator(payload, rule)
  const matched = await v.check()
  if (!matched) {
    return res.status(HttpStatus.UNPROCESSABLE_ENTITY).send(v.errors)
  }

  next()
}
