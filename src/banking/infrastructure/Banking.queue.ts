import { IDefinitionQueue } from "@/Shared/domain"
import { MovementBankRecord } from "@/banking/applications"
import {
  BankMongoRepository,
  MovementBankMongoRepository,
} from "@/banking/infrastructure/persistence"

export const BankingQueue = (): IDefinitionQueue[] => [
  {
    useClass: MovementBankRecord,
    inject: [
      MovementBankMongoRepository.getInstance(),
      BankMongoRepository.getInstance(),
    ],
  },
]
