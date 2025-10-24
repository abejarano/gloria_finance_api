import { IAssetRepository } from "../interfaces/AssetRepository.interface"
import { AssetListFilters } from "../types/AssetListFilters.type"

const CODE_PREFIX = "BEM-"
const CODE_PAD_LENGTH = 6

export class AssetCodeGenerator {
  constructor(private readonly repository: IAssetRepository) {}

  async generate(): Promise<string> {
    let attempts = 0

    while (attempts < 5) {
      const total = await this.repository.count()
      const next = total + 1 + attempts
      const candidate = `${CODE_PREFIX}${next.toString().padStart(CODE_PAD_LENGTH, "0")}`

      const exists = await this.repository.findByCode(candidate)

      if (!exists) {
        return candidate
      }

      attempts += 1
    }

    const fallback = Date.now().toString()

    return `${CODE_PREFIX}${fallback.slice(-CODE_PAD_LENGTH).padStart(
      CODE_PAD_LENGTH,
      "0"
    )}`
  }

  static buildFilters(filter?: AssetListFilters): AssetListFilters {
    return {
      congregationId: filter?.congregationId,
      category: filter?.category,
      status: filter?.status,
    }
  }
}
