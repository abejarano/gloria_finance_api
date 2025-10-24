import { AssetStatus } from "../enums/AssetStatus.enum"

export type AssetListFilters = {
  congregationId?: string
  category?: string
  status?: AssetStatus
}
