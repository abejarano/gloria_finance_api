import { AssetStatus } from "../enums/AssetStatus.enum"

export type InventoryReportFormat = "csv" | "pdf"

export type InventoryReportRequest = {
  congregationId?: string
  category?: string
  status?: AssetStatus
  format: InventoryReportFormat
  performedBy: string
}
