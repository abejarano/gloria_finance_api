import { Response } from "express"
import { BaseReportRequest } from "../../../domain"
import { FinanceRecordMongoRepository } from "../../../../Financial/infrastructure"
import { DRE } from "../../../applications"
import domainResponse from "../../../../Shared/helpers/domainResponse"
import { ChurchMongoRepository } from "../../../../Church/infrastructure"
import { DREMongoRepository } from "@/Reports/infrastructure/persistence/DREMongoRepository"

/**
 * DREController
 *
 * @description Generates a DRE (Demonstração do Resultado do Exercício - Income Statement)
 * report for the specified church, month, and year. The report includes:
 * - Receita Bruta (Gross Revenue)
 * - Receita Líquida (Net Revenue)
 * - Custos Diretos (Direct Costs/COGS)
 * - Resultado Bruto (Gross Profit)
 * - Despesas Operacionais (Operating Expenses)
 * - Resultado Operacional (Operating Result)
 * - Resultados Extraordinários (Extraordinary Results)
 * - Resultado Líquido (Net Result)
 *
 * The report only includes financial records with:
 * - status = CLEARED or RECONCILED
 * - affectsResult = true in the financial concept
 * - date within the specified month/year
 *
 * @param {BaseReportRequest} req - The request object with filtering parameters (churchId, year, month).
 * @param {Response} res - The response object.
 *
 * @returns {Promise<void>} - A promise that resolves when the request has been processed.
 *
 * @throws {Error} - If the request is invalid or an error occurs.
 *
 * @example
 * // Request
 * GET /reports/finance/dre?churchId=123&year=2024&month=5
 *
 * // Response
 * {
 *   "grossRevenue": 3117.05,
 *   "netRevenue": 3117.05,
 *   "directCosts": 0,
 *   "grossProfit": 3117.05,
 *   "operationalExpenses": 101.5,
 *   "operationalResult": 3015.55,
 *   "extraordinaryResults": 0,
 *   "netResult": 3015.55
 * }
 */
export const DREController = async (
  req: BaseReportRequest & { month: number },
  res: Response
): Promise<void> => {
  try {
    const result = await new DRE(
      FinanceRecordMongoRepository.getInstance(),
      DREMongoRepository.getInstance(),
      ChurchMongoRepository.getInstance()
    ).execute(req)

    res.status(200).json(result)
  } catch (e) {
    domainResponse(e, res)
  }
}
