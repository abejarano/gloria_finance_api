import { Router } from "express"
import financialConfigurationRoute from "./FinancialConfiguration.routes"
import financeContribution from "./FinanceContribution.routes"
import financialRecordRoutes from "./FinancialRecord.routes"
import financialConceptRoutes from "./FinancialConcept.routes"
import consolidatedFinancialRoutes from "@/ConsolidatedFinancial/infrastructure/http/routes"
import bankRoute from "@/banking/infrastructure/http/routes/Bank.routes"

const financialRouter = Router()

financialRouter.use("/configuration", financialConfigurationRoute)
financialRouter.use("/configuration/bank", bankRoute)
financialRouter.use("/configuration/financial-concepts", financialConceptRoutes)
financialRouter.use("/contributions", financeContribution)
financialRouter.use("/financial-record", financialRecordRoutes)
financialRouter.use("/consolidate", consolidatedFinancialRoutes)

export default financialRouter
