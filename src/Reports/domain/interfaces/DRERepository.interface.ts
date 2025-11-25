import { DREMaster } from "@/Reports/domain/DREMaster"

export interface IDRERepository {
  upsert(dre: DREMaster): Promise<void>

  one(params: {
    churchId: string
    month: number
    year: number
  }): Promise<DREMaster | undefined>
}
