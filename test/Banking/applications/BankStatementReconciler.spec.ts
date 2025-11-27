import { BankStatementReconciler } from "@/Banking/applications/BankStatementReconciler"
import {
  Bank,
  BankStatement,
  BankStatementDirection,
  BankStatementStatus,
  IBankStatementRepository,
} from "@/Banking/domain"
import {
  FinanceRecord,
  ConceptType,
  FinancialRecordSource,
  FinancialRecordStatus,
  FinancialRecordType,
  StatementCategory,
} from "@/Financial/domain"
import { IFinancialRecordRepository } from "@/Financial/domain/interfaces"
import { IQueueService } from "@/Shared/domain"

const createBank = () =>
  Bank.fromPrimitives({
    bankId: "bank-1",
    name: "Test Bank",
    tag: "TB",
    churchId: "church-1",
    accountType: "CHECKING",
    active: true,
    addressInstancePayment: "",
    bankInstruction: "",
  })

const createStatement = (overrides: Partial<ReturnType<BankStatement["toPrimitives"]>> = {}) => {
  const bank = createBank()

  return BankStatement.create({
    bank,
    availabilityAccount: {
      accountName: "Main",
      availabilityAccountId: "availability-1",
    },
    bankRefId: "ref-1",
    postedAt: overrides.postedAt ?? new Date("2024-05-10T12:00:00Z"),
    amount: overrides.amount ?? 100,
    description: "Payment",
    direction: overrides.direction ?? BankStatementDirection.INCOME,
    fitId: overrides.fitId ?? "fit-1",
    hash: overrides.hash ?? "hash-1",
    month: 5,
    year: 2024,
    raw: {},
  })
}

const createFinancialRecord = (
  overrides: Partial<ReturnType<FinanceRecord["toPrimitives"]>> & {
    availabilityAccountId?: string
  } = {}
) =>
  FinanceRecord.fromPrimitives({
    id: "fr-db-id",
    financialRecordId: overrides.financialRecordId ?? "fr-1",
    financialConcept: overrides.financialConcept ?? {
      id: "concept-db-id",
      financialConceptId: "concept-1",
      name: "Income concept",
      description: "",
      active: true,
      type: ConceptType.INCOME,
      statementCategory: StatementCategory.OPEX,
      createdAt: new Date(),
      churchId: "church-1",
    },
    churchId: overrides.churchId ?? "church-1",
    amount: overrides.amount ?? 100,
    date: overrides.date ?? new Date("2024-05-10T00:00:00Z"),
    type: overrides.type ?? FinancialRecordType.INCOME,
    availabilityAccount:
      overrides.availabilityAccount ?? {
        availabilityAccountId:
          overrides.availabilityAccountId ?? "availability-1",
        accountName: "Main",
        accountType: "CHECKING" as any,
      },
    description: "Income",
    source: FinancialRecordSource.AUTO,
    status: overrides.status ?? FinancialRecordStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

describe("BankStatementReconciler", () => {
  const bankStatementRepository = {
    updateStatus: jest.fn(),
  } as unknown as jest.Mocked<IBankStatementRepository>

  const financialRecordRepository = {
    one: jest.fn(),
  } as unknown as jest.Mocked<IFinancialRecordRepository>

  const queueService = {
    dispatch: jest.fn(),
  } as jest.Mocked<IQueueService>

  const reconciler = new BankStatementReconciler(
    bankStatementRepository,
    financialRecordRepository,
    queueService
  )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("reconciles a matching bank statement automatically", async () => {
    const statement = createStatement()
    const record = createFinancialRecord()
    financialRecordRepository.one.mockResolvedValueOnce(record)

    const result = await reconciler.execute(statement)

    expect(result).toEqual({ matched: true, financialRecordId: "fr-1" })
    expect(statement.getReconciliationStatus()).toBe(
      BankStatementStatus.RECONCILED
    )
    expect(statement.getFinancialRecordId()).toBe("fr-1")
    expect(bankStatementRepository.updateStatus).toHaveBeenCalledWith(
      statement.getBankStatementId(),
      BankStatementStatus.RECONCILED,
      "fr-1"
    )
    expect(financialRecordRepository.one).toHaveBeenCalledWith(
      expect.objectContaining({
        churchId: "church-1",
        amount: 100,
        "availabilityAccount.availabilityAccountId": "availability-1",
      })
    )
    expect(queueService.dispatch).toHaveBeenCalled()
  })

  it("marks statement as unmatched when no compatible record is found", async () => {
    const statement = createStatement({
      postedAt: new Date("2024-05-10T00:00:00Z"),
      amount: 150,
    })
    financialRecordRepository.one.mockResolvedValueOnce(undefined)

    const result = await reconciler.execute(statement)

    expect(result).toEqual({ matched: false })
    expect(statement.getReconciliationStatus()).toBe(
      BankStatementStatus.UNMATCHED
    )
    expect(statement.getFinancialRecordId()).toBeUndefined()
    expect(bankStatementRepository.updateStatus).toHaveBeenCalledWith(
      statement.getBankStatementId(),
      BankStatementStatus.UNMATCHED
    )
    expect(queueService.dispatch).not.toHaveBeenCalled()
  })
})
