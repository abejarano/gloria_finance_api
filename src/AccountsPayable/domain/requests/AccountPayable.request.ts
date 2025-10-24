import { AccountPayableTaxMetadata } from "@/AccountsPayable/domain"
import { AccountPayableTaxStatus } from "@/AccountsPayable/domain"
import { TaxDocumentType } from "@/AccountsPayable/domain"

export type AccountPayableRequest = {
  supplierId: string
  churchId: string
  description: string
  amountTotal?: number
  taxDocument: {
    type: TaxDocumentType
    number?: string
    date: Date
  }
  installments?: {
    amount: number
    dueDate: Date
  }[]
  taxes?: {
    taxType: string
    percentage: number
    amount?: number
    status?: AccountPayableTaxStatus
  }[]
  taxMetadata?: AccountPayableTaxMetadata
}
