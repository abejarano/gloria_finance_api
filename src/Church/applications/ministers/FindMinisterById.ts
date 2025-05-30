import {
  IMinisterRepository,
  Minister,
  MinisterNotFound,
} from "@/Church/domain"
import { Logger } from "@/Shared/adapter"

export class FindMinisterById {
  private logger = Logger(FindMinisterById.name)

  constructor(private readonly ministerRepository: IMinisterRepository) {}

  async execute(ministerId: string): Promise<Minister> {
    this.logger.info(`Start Find Minister By Id ${ministerId}`)

    const minister = await this.ministerRepository.findById(ministerId)

    if (!minister) {
      this.logger.debug(`Minister not found`)
      throw new MinisterNotFound()
    }

    this.logger.info(`Minister found`, { ministerId, minister })
    return minister
  }
}
