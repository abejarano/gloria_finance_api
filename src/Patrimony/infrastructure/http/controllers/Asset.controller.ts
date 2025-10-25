import { Response } from "express"
import domainResponse from "@/Shared/helpers/domainResponse"
import {
  CreateAssetRequest,
  ListAssetsRequest,
  UpdateAssetRequest,
  GetAssetRequest,
  InventoryReportRequest,
} from "../../../domain"
import {
  CreateAsset,
  ListAssets,
  UpdateAsset,
  GetAsset,
  GenerateInventoryReport,
} from "../../../applications"
import { AssetMongoRepository } from "../../persistence/AssetMongoRepository"
import { HttpStatus } from "@/Shared/domain"
import { HandlebarsHTMLAdapter, PuppeteerAdapter } from "@/Shared/adapter"
import { NoOpStorage } from "@/Shared/infrastructure"

const repository = AssetMongoRepository.getInstance()
const pdfGenerator = new PuppeteerAdapter(
  new HandlebarsHTMLAdapter(),
  NoOpStorage.getInstance()
)

export const createAssetController = async (
  request: CreateAssetRequest,
  res: Response
) => {
  try {
    const result = await new CreateAsset(repository).execute(request)

    res.status(HttpStatus.CREATED).send(result)
  } catch (error) {
    domainResponse(error, res)
  }
}

export const listAssetsController = async (
  request: ListAssetsRequest,
  res: Response
) => {
  try {
    const result = await new ListAssets(repository).execute(request)

    res.status(HttpStatus.OK).send(result)
  } catch (error) {
    domainResponse(error, res)
  }
}

export const getAssetController = async (
  request: GetAssetRequest,
  res: Response
) => {
  try {
    const result = await new GetAsset(repository).execute(request)

    res.status(HttpStatus.OK).send(result)
  } catch (error) {
    domainResponse(error, res)
  }
}

export const updateAssetController = async (
  request: UpdateAssetRequest,
  res: Response
) => {
  try {
    const result = await new UpdateAsset(repository).execute(request)

    res.status(HttpStatus.OK).send(result)
  } catch (error) {
    domainResponse(error, res)
  }
}

export const generateInventoryReportController = async (
  request: InventoryReportRequest,
  res: Response
) => {
  try {
    const result = await new GenerateInventoryReport(
      repository,
      pdfGenerator
    ).execute(request)

    res.status(HttpStatus.OK).send(result)
  } catch (error) {
    domainResponse(error, res)
  }
}
