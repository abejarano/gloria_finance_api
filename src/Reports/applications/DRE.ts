import { IFinancialRecordRepository } from "@/Financial/domain/interfaces"
import { IChurchRepository } from "@/Church/domain"
import { FindChurchById } from "@/Church/applications"
import { BaseReportRequest } from "../domain"
import { DREResponse } from "../domain/responses/DRE.response"
import { Logger } from "@/Shared/adapter/CustomLogger"
import { StatementCategory } from "@/Financial/domain"

export class DRE {
  private logger = Logger("DRE")

  constructor(
    private readonly financialRecordRepository: IFinancialRecordRepository,
    private readonly churchRepository: IChurchRepository
  ) {}

  async execute(params: BaseReportRequest): Promise<DREResponse> {
    this.logger.info(`Starting DRE Report`, params)

    // Validate that the church exists
    await new FindChurchById(this.churchRepository).execute(params.churchId)

    // Fetch statement categories with affectsResult filter
    const statementByCategory =
      await this.financialRecordRepository.fetchStatementCategories(params)

    this.logger.info(
      `Statement categories fetched: ${JSON.stringify(statementByCategory)}`
    )

    // Initialize all DRE line items
    let receitaBruta = 0
    let custosDiretos = 0
    let despesasOperacionais = 0
    let resultadosExtraordinarios = 0

    // Process each category and map to DRE line items
    for (const summary of statementByCategory) {
      const net = summary.income - summary.expenses

      switch (summary.category) {
        case StatementCategory.REVENUE:
          // REVENUE → Receita (gross revenue)
          // Income increases revenue, expenses reduce it
          receitaBruta += net
          break

        case StatementCategory.COGS:
          // COGS → Custos Diretos (cost of goods sold)
          // Expenses increase costs, income reduces them (returns/refunds)
          custosDiretos += summary.expenses - summary.income
          break

        case StatementCategory.OPEX:
          // OPEX → Despesas Operacionais (operating expenses)
          // Expenses increase operating costs, income reduces them (reimbursements)
          despesasOperacionais += summary.expenses - summary.income
          break

        case StatementCategory.CAPEX:
          // CAPEX → Does not affect DRE (capital expenditures)
          // Intentionally excluded from income statement
          break

        case StatementCategory.OTHER:
          // OTHER → Resultados Extraordinários (extraordinary results)
          // Net result of extraordinary income and expenses
          resultadosExtraordinarios += net
          break

        default:
          this.logger.warn(
            `Unknown statement category: ${summary.category}, treating as OTHER`
          )
          resultadosExtraordinarios += net
          break
      }
    }

    // Calculate DRE totals following accounting order
    const receitaLiquida = receitaBruta
    const resultadoBruto = receitaLiquida - custosDiretos
    const resultadoOperacional = resultadoBruto - despesasOperacionais
    const resultadoLiquido = resultadoOperacional + resultadosExtraordinarios

    return {
      receitaBruta,
      receitaLiquida,
      custosDiretos,
      resultadoBruto,
      despesasOperacionais,
      resultadoOperacional,
      resultadosExtraordinarios,
      resultadoLiquido,
    }
  }
}
