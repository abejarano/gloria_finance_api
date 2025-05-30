export enum ActionsPaymentCommitment {
  ACCEPTED = "ACCEPTED",
  DENIED = "DENIED",
}

export type ConfirmOrDenyPaymentCommitmentRequest = {
  token: string
  action: ActionsPaymentCommitment
}
