import { IQueueService, QueueName } from "@/Shared/domain"
import { FinancialRecordQueueRequest } from "../domain"
import { Logger } from "@/Shared/adapter"

export class DispatchFinancialRecordCreate {
  private logger = Logger("DispatchFinancialRecord")

  constructor(private readonly queueService: IQueueService) {}

  execute(financialRecord: FinancialRecordQueueRequest) {
    this.logger.info(`DispatchFinancialRecord`, financialRecord)

    this.queueService.dispatch(QueueName.FinancialRecordCreate, financialRecord)
  }
}
