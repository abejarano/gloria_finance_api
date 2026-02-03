import { type IFinancialRecordRepository } from "@/Financial/domain/interfaces"
import { type IChurchRepository } from "@/Church/domain"
import { FindChurchById } from "@/Church/applications"
import type { BaseReportRequest } from "../domain"
import {
  DREMaster,
  type DREResponse,
  type IDRERepository,
} from "@/Reports/domain"
import { Logger } from "@/Shared/adapter/CustomLogger"
import { StatementCategory } from "@/Financial/domain"

export class DRE {
  private logger = Logger("DRE")

  constructor(
    private readonly financialRecordRepository: IFinancialRecordRepository,
    private readonly DRERepository: IDRERepository,
    private readonly churchRepository: IChurchRepository
  ) {}

  async execute(
    params: BaseReportRequest & { month: number }
  ): Promise<DREResponse> {
    this.logger.info(`Starting DRE Report`, params)

    let dre = await this.DRERepository.one({ ...params })

    if (dre) {
      this.logger.info(`DRE Report found in repository`, params)
      return dre.toResponseAPI()
    }

    await new FindChurchById(this.churchRepository).execute(params.churchId)

    dre = await this.generateDRE(params)

    return dre.toResponseAPI()
  }

  async generateDRE(params: BaseReportRequest): Promise<DREMaster> {
    const statementByCategory =
      await this.financialRecordRepository.fetchStatementCategories(params)

    this.logger.info(
      `Statement categories fetched: ${JSON.stringify(statementByCategory)}`
    )

    type DREAccumulator = {
      grossRevenue: number
      directCosts: number
      operationalExpenses: number
      ministryTransfers: number
      extraordinaryResults: number
      capexInvestments: number
    }

    const createAccumulator = (): DREAccumulator => ({
      grossRevenue: 0,
      directCosts: 0,
      operationalExpenses: 0,
      ministryTransfers: 0,
      extraordinaryResults: 0,
      capexInvestments: 0,
    })

    const applyCategory = (
      accumulator: DREAccumulator,
      category: StatementCategory,
      income: number,
      expenses: number
    ) => {
      const net = income - expenses

      switch (category) {
        case StatementCategory.REVENUE:
          accumulator.grossRevenue += net
          break
        case StatementCategory.COGS:
          accumulator.directCosts += expenses - income
          break
        case StatementCategory.OPEX:
          accumulator.operationalExpenses += expenses - income
          break
        case StatementCategory.MINISTRY_TRANSFERS:
          accumulator.ministryTransfers += expenses - income
          break
        case StatementCategory.CAPEX:
          accumulator.capexInvestments += expenses
          break
        case StatementCategory.OTHER:
          accumulator.extraordinaryResults += net
          break
        default:
          accumulator.extraordinaryResults += net
          break
      }
    }

    const buildSummary = (accumulator: DREAccumulator) => {
      const netRevenue = accumulator.grossRevenue
      const grossProfit = netRevenue - accumulator.directCosts
      const operationalResult =
        grossProfit -
        accumulator.operationalExpenses -
        accumulator.ministryTransfers
      const netResult =
        operationalResult +
        accumulator.extraordinaryResults -
        accumulator.capexInvestments

      return {
        grossRevenue: accumulator.grossRevenue,
        netRevenue,
        directCosts: accumulator.directCosts,
        grossProfit,
        operationalExpenses: accumulator.operationalExpenses,
        ministryTransfers: accumulator.ministryTransfers,
        capexInvestments: accumulator.capexInvestments,
        extraordinaryResults: accumulator.extraordinaryResults,
        operationalResult,
        netResult,
      }
    }

    const dreBySymbol = new Map<string, DREAccumulator>()

    for (const summary of statementByCategory) {
      const income = summary.income ?? 0
      const expenses = summary.expenses ?? 0
      const symbol = summary.symbol ?? "R$"

      const symbolAccumulator = dreBySymbol.get(symbol) ?? createAccumulator()
      applyCategory(symbolAccumulator, summary.category, income, expenses)
      dreBySymbol.set(symbol, symbolAccumulator)
    }

    const totalsBySymbol = Array.from(dreBySymbol.entries())
      .map(([symbol, accumulator]) => ({
        symbol,
        ...buildSummary(accumulator),
      }))
      .sort((a, b) => b.grossRevenue - a.grossRevenue)

    const globalAccumulator = createAccumulator()
    for (const item of totalsBySymbol) {
      globalAccumulator.grossRevenue += item.grossRevenue
      globalAccumulator.directCosts += item.directCosts
      globalAccumulator.operationalExpenses += item.operationalExpenses
      globalAccumulator.ministryTransfers += item.ministryTransfers
      globalAccumulator.capexInvestments += item.capexInvestments
      globalAccumulator.extraordinaryResults += item.extraordinaryResults
    }

    const globalSummary = buildSummary(globalAccumulator)

    return DREMaster.create({
      churchId: params.churchId,
      month: params.month!,
      year: params.year,
      dre: {
        ...globalSummary,
        totalsBySymbol,
      },
    })
  }

  async generateAndSaveDRE(params: BaseReportRequest): Promise<void> {
    this.logger.info(`Generating and saving DRE Report`, params)

    const dre = await this.generateDRE(params)

    await this.DRERepository.upsert(dre)
    this.logger.info(`DRE Report saved`)
  }
}
