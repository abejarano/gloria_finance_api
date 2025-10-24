import { Asset } from "../../domain/Asset"
import {
  AssetListFilters,
  AssetListResult,
  AssetModel,
  IAssetRepository,
} from "../../domain"
import { MongoRepository } from "@abejarano/ts-mongodb-criteria"
import { Filter } from "mongodb"

export class AssetMongoRepository
  extends MongoRepository<Asset>
  implements IAssetRepository
{
  private static instance: AssetMongoRepository

  static getInstance(): AssetMongoRepository {
    if (!AssetMongoRepository.instance) {
      AssetMongoRepository.instance = new AssetMongoRepository()
    }

    return AssetMongoRepository.instance
  }

  collectionName(): string {
    return "patrimony_assets"
  }

  async create(asset: Asset): Promise<void> {
    await this.persist(asset.getId(), asset)
  }

  async update(asset: Asset): Promise<void> {
    await this.persist(asset.getId(), asset)
  }

  async list({
    page,
    perPage,
    search,
    ...filters
  }: AssetListFilters & {
    page: number
    perPage: number
    search?: string
  }): Promise<AssetListResult> {
    const collection = await this.collection()
    const query = this.buildQuery(filters, search)

    const skip = (Math.max(page, 1) - 1) * perPage

    const documents = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .toArray()

    const count = await collection.countDocuments(query)

    const results = documents.map((doc) => this.mapToModel(doc))

    const hasNext = skip + results.length < count

    return {
      results,
      count,
      nextPag: hasNext ? page + 1 : null,
      page,
      perPage,
    }
  }

  async findById(assetId: string): Promise<Asset | null> {
    const collection = await this.collection()
    const document = await collection.findOne({ assetId })

    if (!document) {
      return null
    }

    return Asset.fromPrimitives(this.mapToPrimitives(document))
  }

  async findByCode(code: string): Promise<Asset | null> {
    const collection = await this.collection()
    const document = await collection.findOne({ code })

    if (!document) {
      return null
    }

    return Asset.fromPrimitives(this.mapToPrimitives(document))
  }

  async count(filters?: AssetListFilters): Promise<number> {
    const collection = await this.collection()

    return await collection.countDocuments(this.buildQuery(filters))
  }

  async search(filters?: AssetListFilters): Promise<AssetModel[]> {
    const collection = await this.collection()
    const query = this.buildQuery(filters)
    const documents = await collection
      .find(query)
      .sort({ name: 1 })
      .toArray()

    return documents.map((doc) => this.mapToModel(doc))
  }

  private buildQuery(filters?: AssetListFilters, search?: string): Filter<any> {
    const query: Filter<any> = {}

    if (filters?.congregationId) {
      query.congregationId = filters.congregationId
    }

    if (filters?.category) {
      query.category = filters.category
    }

    if (filters?.status) {
      query.status = filters.status
    }

    if (search) {
      const regex = new RegExp(search, "i")
      query.$or = [
        { name: regex },
        { code: regex },
        { responsibleId: regex },
        { location: regex },
      ]
    }

    return query
  }

  private mapToModel(document: any): AssetModel {
    const attachments = (document.attachments ?? []).map((attachment) => ({
      ...attachment,
      uploadedAt: attachment.uploadedAt
        ? new Date(attachment.uploadedAt)
        : new Date(),
    }))

    const history = (document.history ?? []).map((entry) => ({
      ...entry,
      performedAt: entry.performedAt ? new Date(entry.performedAt) : new Date(),
    }))

    return {
      id: document._id?.toString(),
      assetId: document.assetId,
      code: document.code,
      name: document.name,
      category: document.category,
      acquisitionDate: document.acquisitionDate
        ? new Date(document.acquisitionDate)
        : new Date(),
      value: Number(document.value ?? 0),
      congregationId: document.congregationId,
      location: document.location,
      responsibleId: document.responsibleId,
      status: document.status,
      attachments,
      history,
      inventoryCheckedAt: document.inventoryCheckedAt
        ? new Date(document.inventoryCheckedAt)
        : null,
      inventoryCheckedBy: document.inventoryCheckedBy ?? null,
      createdAt: document.createdAt ? new Date(document.createdAt) : new Date(),
      updatedAt: document.updatedAt ? new Date(document.updatedAt) : new Date(),
    }
  }

  private mapToPrimitives(document: any) {
    return {
      ...this.mapToModel(document),
    }
  }
}
