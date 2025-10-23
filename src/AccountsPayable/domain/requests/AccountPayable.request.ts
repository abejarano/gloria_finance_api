import { AccountPayableTaxMetadata } from "../types/AccountPayableTax.type"
import { AccountPayableDocumentInput } from "../types/AccountPayableDocument.type"

export type AccountPayableRequest = {
  supplierId: string
  churchId: string
  description: string
  installments: {
    amount: number
    dueDate: Date
  }[]
  taxes?: {
    taxType: string
    percentage: number
    amount?: number
  }[]
  taxMetadata?: AccountPayableTaxMetadata
  fiscalDocument?: AccountPayableDocumentInput
}
