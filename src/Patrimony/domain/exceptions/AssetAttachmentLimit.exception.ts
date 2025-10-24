import { DomainException } from "@/Shared/domain"

export class AssetAttachmentLimitException extends DomainException {
  code = "ASSET_ATTACHMENT_LIMIT"
  message = "O bem patrimonial excede o limite permitido de anexos."
}
