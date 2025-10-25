import { Logger, PuppeteerAdapter } from "@/Shared/adapter"
import {
  AssetStatusLabels,
  AssetResponse,
  IAssetRepository,
  InventoryReportRequest,
} from "../domain"
import { AssetCodeGenerator } from "../domain/services/AssetCodeGenerator"
import { mapAssetToResponse } from "./mappers/AssetResponse.mapper"
import { promises as fs } from "fs"

const CSV_SEPARATOR = ";"

type InventorySummary = {
  totalAssets: number
  totalValue: number
  byStatus: Record<string, number>
  documentsPending: number
}

export class GenerateInventoryReport {
  private readonly logger = Logger(GenerateInventoryReport.name)

  constructor(
    private readonly repository: IAssetRepository,
    private readonly pdfGenerator: PuppeteerAdapter
  ) {}

  async execute(request: InventoryReportRequest) {
    this.logger.info("Generating patrimony inventory report", request)

    const filters = AssetCodeGenerator.buildFilters({
      congregationId: request.congregationId,
      category: request.category,
      status: request.status,
    })

    const assets = await this.repository.search(filters)
    const responses = assets.map(mapAssetToResponse)

    const summary = this.buildSummary(responses)

    if (request.format === "csv") {
      return this.buildCsvResponse(responses, summary)
    }

    return await this.buildPdfResponse(responses, summary, request)
  }

  private buildSummary(assets: AssetResponse[]): InventorySummary {
    const totalValue = assets.reduce((acc, asset) => acc + Number(asset.value || 0), 0)

    const byStatus = assets.reduce<Record<string, number>>((acc, asset) => {
      acc[asset.status] = (acc[asset.status] ?? 0) + 1
      return acc
    }, {})

    const documentsPending = assets.filter((asset) => asset.documentsPending).length

    return {
      totalAssets: assets.length,
      totalValue,
      byStatus,
      documentsPending,
    }
  }

  private buildCsvResponse(
    assets: AssetResponse[],
    summary: InventorySummary
  ) {
    const header = [
      "Código",
      "Nome",
      "Categoria",
      "Status",
      "Valor",
      "Congregação",
      "Responsável",
      "Data de aquisição",
      "Localização",
      "Documentos pendentes",
    ]

    const rows = assets.map((asset) => [
      asset.code,
      asset.name,
      asset.category,
      AssetStatusLabels[asset.status],
      Number(asset.value ?? 0).toFixed(2),
      asset.congregationId,
      asset.responsibleId,
      new Date(asset.acquisitionDate).toISOString().slice(0, 10),
      asset.location,
      asset.documentsPending ? "Sim" : "Não",
    ])

    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${(value ?? "").toString().replace(/"/g, '""')}"`).join(CSV_SEPARATOR))
      .join("\n")

    return {
      format: "csv" as const,
      filename: `inventario-patrimonial-${Date.now()}.csv`,
      contentType: "text/csv",
      content: Buffer.from(csv, "utf-8").toString("base64"),
      summary,
    }
  }

  private async buildPdfResponse(
    assets: AssetResponse[],
    summary: InventorySummary,
    request: InventoryReportRequest
  ) {
    const templateData = {
      generatedAt: new Date().toISOString(),
      summary: {
        ...summary,
        totalValueFormatted: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(summary.totalValue),
      },
      filters: {
        congregationId: request.congregationId,
        category: request.category,
        status: request.status,
      },
      assets: assets.map((asset, index) => ({
        ...asset,
        index: index + 1,
        acquisitionDateFormatted: new Date(asset.acquisitionDate).toLocaleDateString("pt-BR"),
        statusLabel: AssetStatusLabels[asset.status],
        valueFormatted: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(asset.value ?? 0)),
      })),
    }

    const pdfPath = await this.pdfGenerator
      .htmlTemplate("patrimony/inventory-report", templateData)
      .toPDF(false)

    const content = await fs.readFile(pdfPath)
    await fs.unlink(pdfPath)

    return {
      format: "pdf" as const,
      filename: `inventario-patrimonial-${Date.now()}.pdf`,
      contentType: "application/pdf",
      content: content.toString("base64"),
      summary,
    }
  }
}
