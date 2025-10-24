import { Logger } from "@/Shared/adapter"
import {
  IAssetRepository,
  ListAssetsRequest,
} from "../domain"
import { mapAssetToResponse } from "./mappers/AssetResponse.mapper"

export class ListAssets {
  private readonly logger = Logger(ListAssets.name)

  constructor(private readonly repository: IAssetRepository) {}

  async execute(request: ListAssetsRequest) {
    this.logger.info("Listing patrimony assets", request)

    const perPage = Math.max(Number(request.perPage ?? 20), 1)
    const page = Math.max(Number(request.page ?? 1), 1)

    const result = await this.repository.list({
      congregationId: request.congregationId,
      category: request.category,
      status: request.status,
      search: request.search,
      page,
      perPage,
    })

    return {
      ...result,
      results: result.results.map(mapAssetToResponse),
    }
  }
}
