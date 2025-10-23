import { Logger } from "@/Shared/adapter"

type RollbackAction = () => Promise<void> | void

export class UnitOfWork {
  private readonly rollbackActions: RollbackAction[] = []
  private readonly logger = Logger(UnitOfWork.name)

  register(action: RollbackAction): void {
    this.rollbackActions.push(action)
  }

  async rollback(): Promise<void> {
    while (this.rollbackActions.length) {
      const action = this.rollbackActions.pop()
      if (!action) {
        continue
      }

      try {
        await action()
      } catch (error) {
        this.logger.error("Rollback action failed", error)
      }
    }
  }

  async commit(): Promise<void> {
    this.rollbackActions.length = 0
  }
}
