import { Logger } from "@/Shared/adapter"
import {
  AccountPayable,
  AccountPayableRequest,
  IAccountPayableRepository,
  ISupplierRepository,
} from "@/AccountsPayable/domain"
import { SupplierNotFound } from "@/AccountsPayable/domain/exceptions/SupplierNotFound"
import { IFinancialConceptRepository } from "@/Financial/domain/interfaces"
import { DispatchFinancialRecordCreate } from "@/Financial/applications"
import { IQueueService } from "@/Shared/domain"
import { DateBR } from "@/Shared/helpers"
import {
  FinancialRecordSource,
  FinancialRecordStatus,
  FinancialRecordType,
} from "@/Financial/domain"

export class CreateAccountPayable {
  private logger = Logger(CreateAccountPayable.name)

  constructor(
    private readonly accountPayableRepository: IAccountPayableRepository,
    private readonly supplierRepository: ISupplierRepository,
    private readonly financialConceptRepository: IFinancialConceptRepository,
    private readonly queueService: IQueueService
  ) {}

  async execute(args: AccountPayableRequest) {
    this.logger.info(`Start Create Account Payable`, args)

    const supplier = await this.supplierRepository.one({
      supplierId: args.supplierId,
    })

    if (!supplier) {
      throw new SupplierNotFound()
    }

    const accountPayable = AccountPayable.create({
      ...args,
      supplier: {
        supplierId: supplier.getSupplierId(),
        supplierType: supplier.getType(),
        supplierDNI: supplier.getDNI(),
        name: supplier.getName(),
        phone: supplier.getPhone(),
      },
    })

    await this.accountPayableRepository.upsert(accountPayable)

    const concept = await this.financialConceptRepository.one({
      name: "Contas a Pagar",
      churchId: args.churchId,
    })

    new DispatchFinancialRecordCreate(this.queueService).execute({
      churchId: args.churchId,
      date: DateBR(),
      createdBy: args.createdBy,
      financialRecordType: FinancialRecordType.OUTGO,
      source: FinancialRecordSource.AUTO,
      status: FinancialRecordStatus.PENDING,
      amount: args.amountTotal,
      financialConcept: concept,
      description: `Conta a Pagar criada: ${accountPayable.getDescription()}`,
      reference: {
        reference: accountPayable.getAccountPayableId(),
        type: "AccountPayable",
      },
    })

    this.logger.info(`CreateAccountPayable finish`)
  }
}
