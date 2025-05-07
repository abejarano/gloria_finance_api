export type ConfirmOrDenyPaymentCommitmentRequest = {
  token: string
  status: "ACCEPTED" | "DENIED"
}
