import { Response } from "express"
import { FilterFinanceRecordRequest } from "@/Financial/domain"
import { ExportFinanceRecordToExcel } from "../../../applications"
import { FinanceRecordMongoRepository } from "../../persistence"
import domainResponse from "../../../../Shared/helpers/domainResponse"
import { Logger, XLSExportAdapter } from "@/Shared/adapter"
import { promises as fs } from "fs"

/**
 * ExportFinanceRecordToExcelController
 *
 * @description Exporta a Excel un listado de registros financieros filtrados según los criterios proporcionados.
 *
 * @param {FilterFinanceRecordRequest} req - Los criterios de filtro.
 * @param {Response} res - El objeto respuesta.
 *
 * @returns {Promise<void>} - Una promesa que se resuelve cuando la solicitud ha sido procesada.
 *
 * @throws {Error} - Si la solicitud es inválida o ocurre un error.
 *
 * @example
 * // Request
 * GET /finance-records/export?churchId=123&startDate=2022-01-01&endDate=2022-12-31
 */
export const ExportFinanceRecordToExcelController = async (
  req: FilterFinanceRecordRequest,
  res: Response
): Promise<void> => {
  const logger = Logger("ExportFinanceRecordToExcelController")
  try {
    logger.info("Iniciando exportación a Excel", req)

    // Ejecutar el caso de uso con el adaptador
    const file = await new ExportFinanceRecordToExcel(
      FinanceRecordMongoRepository.getInstance(),
      new XLSExportAdapter()
    ).execute(req)

    const { path, filename } = file

    res.download(path, filename, (error) => {
      fs.unlink(path).catch(() => undefined)

      if (error && !res.headersSent) {
        domainResponse(error, res)
      }
    })

    logger.info("Exportación finalizada con éxito")
  } catch (e) {
    logger.error("Error al exportar a Excel", e)
    domainResponse(e, res)
  }
}
