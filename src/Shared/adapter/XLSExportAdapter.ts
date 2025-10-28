import { IXLSExportAdapter, ReportFile } from "@/Shared/domain"
import { join } from "path"
import { tmpdir } from "os"
import { promises as fs } from "fs"

const CSV_SEPARATOR = ";"

/**
 * Implementing the Excel Export Adapter
 */
export class XLSExportAdapter implements IXLSExportAdapter {
  async export(
    rows: any[],
    header: string[],
    sheetName: string
  ): Promise<ReportFile> {
    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${(value ?? "").toString().replace(/"/g, '""')}"`)
          .join(CSV_SEPARATOR)
      )
      .join("\n")

    const timestamp = Date.now()
    const filename = `${sheetName}-${timestamp}.csv`
    const tempFilePath = join(
      tmpdir(),
      `${timestamp}-${Math.random().toString(16).slice(2)}.csv`
    )

    await fs.writeFile(tempFilePath, csv, "utf-8")

    return {
      filename,
      path: tempFilePath,
    }
  }
}
