import { AmountValue } from "@/Shared/domain"

export type PayAccountReceivableRequest = {
  accountReceivableId: string
  installmentId: string
  financialTransactionId: string
  availabilityAccountId: string
  churchId: string
  amount: AmountValue
  file?: any
  voucher?: string
}
