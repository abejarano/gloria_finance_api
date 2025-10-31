import { Logger } from "@/Shared/adapter"
import { IFinancialYearRepository } from "@/ConsolidatedFinancial/domain"
import { IFinancialRecordRepository } from "@/Financial/domain/interfaces"
import { IQueue, IQueueService, IStorageService } from "@/Shared/domain"
import {
  ConceptType,
  FinanceRecord,
  FinancialRecordQueueRequest,
  TypeOperationMoney,
} from "@/Financial/domain"
import { UnitOfWork } from "@/Shared/helpers"
import {
  DispatchUpdateAvailabilityAccountBalance,
  DispatchUpdateCostCenterMaster,
} from "@/Financial/applications"
import { FinancialMonthValidator } from "@/ConsolidatedFinancial/applications"

export class FinancialRecordCreate implements IQueue {
  private logger = Logger(FinancialRecordCreate.name)

  constructor(
    private readonly financialYearRepository: IFinancialYearRepository,
    private readonly financialRecordRepository: IFinancialRecordRepository,
    private readonly store: IStorageService,
    private readonly queueService: IQueueService
  ) {}

  async handle(args: FinancialRecordQueueRequest): Promise<void> {
    await new FinancialMonthValidator(this.financialYearRepository).validate({
      churchId: args.churchId,
    })

    const unitOfWork = new UnitOfWork()

    let voucher: string = undefined
    if (args.file) {
      voucher = await this.store.uploadFile(args.file)

      unitOfWork.registerRollbackActions(async () => {
        if (voucher) await this.store.deleteFile(voucher)
      })
    }

    if (args.availabilityAccount) {
      unitOfWork.execPostCommit(async () => {
        new DispatchUpdateAvailabilityAccountBalance(this.queueService).execute(
          {
            availabilityAccount: args.availabilityAccount,
            amount: args.amount,
            concept: args.financialConcept.getName(),
            operationType:
              args.financialConcept.getType() === ConceptType.INCOME
                ? TypeOperationMoney.MONEY_IN
                : TypeOperationMoney.MONEY_OUT,
            createdAt: args.date,
          }
        )
      })
    }

    if (args.costCenter) {
      unitOfWork.execPostCommit(async () => {
        new DispatchUpdateCostCenterMaster(this.queueService).execute({
          churchId: args.churchId,
          amount: args.amount,
          costCenterId: args.costCenter.getCostCenterId(),
        })
      })
    }

    try {
      const financialRecord = FinanceRecord.create({
        financialConcept: args.financialConcept,
        churchId: args.churchId,
        amount: args.amount,
        date: new Date(args.date),
        availabilityAccount: args.availabilityAccount,
        description: args.description,
        voucher,
        costCenter: args.costCenter,
        type: args.financialRecordType,
        status: args.status,
        source: args.source,
        createdBy: args.createdBy,
      })

      await this.financialRecordRepository.upsert(financialRecord)

      await unitOfWork.commit()
    } catch (e) {
      await unitOfWork.rollback()
      throw e
    }
  }
}
