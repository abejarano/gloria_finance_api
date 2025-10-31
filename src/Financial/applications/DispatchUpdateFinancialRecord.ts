import { IQueueService, QueueName } from "@/Shared/domain"
import { FinancialRecordUpdateQueue } from "../domain"
import { Logger } from "@/Shared/adapter"

export class DispatchUpdateFinancialRecord {
  private logger = Logger(DispatchUpdateFinancialRecord.name)

  constructor(private readonly queueService: IQueueService) {}

  execute(financialRecord: FinancialRecordUpdateQueue) {
    this.logger.info(`DispatchUpdateFinancialRecord`, financialRecord)

    this.queueService.dispatch(QueueName.UpdateFinancialRecord, financialRecord)
  }
}
