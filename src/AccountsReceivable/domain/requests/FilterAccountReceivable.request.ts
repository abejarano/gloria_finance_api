import { AccountsReceivableStatus } from "@/AccountsReceivable/domain"
import { ListParams } from "@/Shared/domain"

export type FilterAccountReceivableRequest = {
  status?: AccountsReceivableStatus
} & ListParams
