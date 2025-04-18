import { AccountPayableStatus } from "@/AccountsPayable/domain"
import { ListParams } from "@/Shared/domain"

export type FilterAccountPayableRequest = {
  status?: AccountPayableStatus
} & ListParams
