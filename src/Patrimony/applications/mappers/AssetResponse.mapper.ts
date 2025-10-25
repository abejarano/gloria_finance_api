import { Asset } from "../../domain/Asset"
import { AssetModel } from "../../domain/models/Asset.model"
import { AssetResponse } from "../../domain/responses/Asset.response"

export const mapAssetToResponse = (asset: Asset | AssetModel): AssetResponse => {
  const base = asset instanceof Asset
    ? { ...asset.toPrimitives(), id: asset.getId() ?? undefined }
    : asset

  return {
    ...base,
    documentsPending:
      !base.attachments || base.attachments.length === 0,
  }
}
