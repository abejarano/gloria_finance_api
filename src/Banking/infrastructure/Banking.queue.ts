import { IDefinitionQueue } from "@/Shared/domain"
import {
  BankStatementReconciler,
  MovementBankRecordJob,
} from "@/Banking/applications"
import {
  BankMongoRepository,
  BankStatementMongoRepository,
  MovementBankMongoRepository,
} from "@/Banking/infrastructure/persistence"
import { ImportBankStatementJob } from "@/Banking/infrastructure/jobs/ImportBankStatement.job"
import { BankStatementParserFactory } from "@/Banking/infrastructure/parsers/BankStatementParserFactory"
import { QueueService } from "@/Shared/infrastructure"
import { IFinancialRecordRepository } from "@/Financial/domain/interfaces"

type BankingQueueDeps = {
  financialRecordRepository: IFinancialRecordRepository
}

export const BankingQueue = ({
  financialRecordRepository,
}: BankingQueueDeps): IDefinitionQueue[] => [
  {
    useClass: MovementBankRecordJob,
    inject: [
      MovementBankMongoRepository.getInstance(),
      BankMongoRepository.getInstance(),
    ],
  },
  {
    useClass: ImportBankStatementJob,
    inject: [
      BankStatementParserFactory.getInstance(),
      BankStatementMongoRepository.getInstance(),
      new BankStatementReconciler(
        BankStatementMongoRepository.getInstance(),
        financialRecordRepository,
        QueueService.getInstance()
      ),
      QueueService.getInstance(),
    ],
  },
]
