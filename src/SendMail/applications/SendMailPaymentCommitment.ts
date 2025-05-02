import { Logger } from "@/Shared/adapter"
import { IQueueService, QueueName } from "@/Shared/domain"
import { TemplateEmail } from "@/SendMail/enum/templateEmail.enum"
import { Installment } from "@/AccountsPayable/domain"

export class SendMailPaymentCommitment {
  private logger = Logger(SendMailPaymentCommitment.name)

  constructor(private readonly queueService: IQueueService) {}

  execute(params: {
    symbol: string
    amount: number
    installments: Installment[]
    concept: string
    dueDate: string
    token: string
    debtor: {
      name: string
      email: string
    }
    church: {
      name: string
    }
  }) {
    this.queueService.dispatch(QueueName.SendMail, {
      to: params.debtor.email,
      subject: "Compromisso de Pagamento",
      template: TemplateEmail.PaymentCommitment,
      clientName: params.debtor.name,
      context: {
        ...params,
      },
    })
  }
}
