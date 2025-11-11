import { Response } from "express"
import * as fs from "fs"
import { BaseReportRequest } from "../../../domain"
import { DRE } from "../../../applications"
import domainResponse from "../../../../Shared/helpers/domainResponse"
import { FinanceRecordMongoRepository } from "@/Financial/infrastructure"
import { ChurchMongoRepository } from "@/Church/infrastructure"
import { HandlebarsHTMLAdapter, PuppeteerAdapter } from "@/Shared/adapter"
import { NoOpStorage } from "@/Shared/infrastructure"

/**
 * DREPdfController
 *
 * @description Generates a PDF version of the DRE (Demonstração do Resultado do Exercício)
 * report for the specified church, month, and year. Returns a downloadable PDF file.
 *
 * @param {BaseReportRequest} req - The request object with filtering parameters (churchId, year, month).
 * @param {Response} res - The response object.
 *
 * @returns {Promise<void>} - A promise that resolves when the PDF has been sent.
 *
 * @throws {Error} - If the request is invalid or an error occurs.
 *
 * @example
 * // Request
 * GET /reports/finance/dre/pdf?churchId=123&year=2024&month=5
 *
 * // Response
 * Content-Type: application/pdf
 * Content-Disposition: attachment; filename="dre-2024-5.pdf"
 * [PDF binary data]
 */
export const DREPdfController = async (
  req: BaseReportRequest,
  res: Response
): Promise<void> => {
  try {
    const dreReport = await new DRE(
      FinanceRecordMongoRepository.getInstance(),
      ChurchMongoRepository.getInstance()
    ).execute(req)

    const pdfPath = await new PuppeteerAdapter(
      new HandlebarsHTMLAdapter(),
      NoOpStorage.getInstance()
    )
      .htmlTemplate("dre_report", dreReport)
      .toPDF(false)

    const year = req.year
    const month = req.month
    const fileName = `dre-${year}${month ? `-${month}` : ""}.pdf`

    res.download(pdfPath, fileName, (error) => {
      fs.unlink(pdfPath, () => undefined)

      if (error && !res.headersSent) {
        domainResponse(error, res)
      }
    })
  } catch (error) {
    domainResponse(error, res)
  }
}
