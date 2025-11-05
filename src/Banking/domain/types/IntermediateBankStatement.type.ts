import { Bank, BankStatementDirection } from "@/Banking/domain"

export type IntermediateBankStatement = {
  bank: Bank
  bankRefId: string
  accountName: string
  postedAt: Date
  amount: number
  description: string
  direction: BankStatementDirection
  fitId: string
  hash: string
  month: number
  year: number
  raw?: Record<string, unknown>
}
