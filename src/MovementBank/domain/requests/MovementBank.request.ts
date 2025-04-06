import { TypeBankingOperation } from "@/MovementBank/domain"

export type MovementBankRequest = {
  amount: number
  bankingOperation: TypeBankingOperation
  concept: string
  bankId: string
  createdAt?: Date
}
