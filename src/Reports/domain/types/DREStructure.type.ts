export type DRESummary = {
  grossRevenue: number
  netRevenue: number
  directCosts: number
  grossProfit: number
  operationalExpenses: number
  ministryTransfers: number
  capexInvestments: number
  extraordinaryResults: number
  operationalResult: number
  netResult: number
}

export type DRESummaryBySymbol = DRESummary & {
  symbol: string
}

export type DREStructure = {
  grossRevenue: number
  netRevenue: number
  directCosts: number
  grossProfit: number
  operationalExpenses: number
  ministryTransfers: number
  capexInvestments: number
  extraordinaryResults: number
  operationalResult: number
  netResult: number
  totalsBySymbol: DRESummaryBySymbol[]
}
