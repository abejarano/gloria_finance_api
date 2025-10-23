export type AccountPayableDocumentStatus =
  | "ISSUED"
  | "NOT_ISSUED"
  | "NOT_REQUIRED"

export type AccountPayableDocumentFiscalNote = {
  number?: string
  series?: string
  issueDate?: Date
}

export type AccountPayableDocumentFiscalNoteInput = {
  number?: string
  series?: string
  issueDate?: string | Date
}

export type AccountPayableDocumentEvidenceType =
  | "RECEIPT"
  | "CONTRACT"
  | "DECLARATION"
  | "OTHER"

export type AccountPayableDocumentEvidence = {
  type: AccountPayableDocumentEvidenceType
  identifier?: string
  issuedAt?: Date
  description?: string
}

export type AccountPayableDocumentEvidenceInput = {
  type?: string
  identifier?: string
  issuedAt?: string | Date
  description?: string
}

export type AccountPayableDocument = {
  status: AccountPayableDocumentStatus
  fiscalNote?: AccountPayableDocumentFiscalNote
  justification?: string
  evidence?: AccountPayableDocumentEvidence
}

export type AccountPayableDocumentInput = {
  status?: AccountPayableDocumentStatus | string
  fiscalNote?: AccountPayableDocumentFiscalNoteInput
  justification?: string
  evidence?: AccountPayableDocumentEvidenceInput
}
