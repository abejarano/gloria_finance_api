import { SupplierType } from "../enums/SupplierType"
import { Installments } from "@/Shared/domain"
import {
  AccountPayableTaxInput,
  AccountPayableTaxMetadata,
} from "../types/AccountPayableTax.type"
import { AccountPayableDocumentInput } from "../types/AccountPayableDocument.type"

export interface ICreateAccountPayable {
  supplier: {
    supplierId: string
    supplierType: SupplierType
    supplierDNI: string
    name: string
    phone: string
  }
  accountPayableId?: string
  churchId: string
  description: string
  amountTotal: number
  amountPaid?: number
  amountPending?: number
  installments?: Installments[]
  taxes?: AccountPayableTaxInput[]
  taxAmountTotal?: number
  taxMetadata?: AccountPayableTaxMetadata
  fiscalDocument?: AccountPayableDocumentInput
}
