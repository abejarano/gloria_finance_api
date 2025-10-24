import { Asset } from "../Asset"
import { AssetModel } from "../models/Asset.model"
import { AssetListFilters } from "../types/AssetListFilters.type"
import { AssetListResult } from "../types/AssetListResult.type"

export interface IAssetRepository {
  create(asset: Asset): Promise<void>
  update(asset: Asset): Promise<void>
  list(
    filters: AssetListFilters & { page: number; perPage: number; search?: string }
  ): Promise<AssetListResult>
  findById(assetId: string): Promise<Asset | null>
  findByCode(code: string): Promise<Asset | null>
  count(filters?: AssetListFilters): Promise<number>
  search(filters?: AssetListFilters): Promise<AssetModel[]>
}
