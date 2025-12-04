import { DomainException } from "@/Shared/domain"

export class AssetNotFoundException extends DomainException {
  name = "ASSET_NOT_FOUND"
  message = "O bem patrimonial informado não foi encontrado."
}
