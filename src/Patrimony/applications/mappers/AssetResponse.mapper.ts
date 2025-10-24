import { Asset } from "../../domain/Asset"
import { AssetModel } from "../../domain/models/Asset.model"
import { AssetResponse } from "../../domain/responses/Asset.response"

export const mapAssetToResponse = (asset: Asset | AssetModel): AssetResponse => {
  const plain =
    asset instanceof Asset ? asset.toPrimitives() : (asset as AssetModel)

  return {
    ...plain,
    documentsPending: !plain.attachments || plain.attachments.length === 0,
  }
}
