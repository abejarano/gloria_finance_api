import { AssetModel } from "../models/Asset.model"

export type AssetListResult = {
  results: AssetModel[]
  count: number
  nextPag: number | null
  page: number
  perPage: number
}
