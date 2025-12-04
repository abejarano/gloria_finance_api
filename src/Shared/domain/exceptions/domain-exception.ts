export abstract class DomainException implements Error {
  abstract message: string
  abstract name: string

  data?: []

  getMessage(): string {
    return this.message
  }

  getErrorCode() {
    return this.name
  }

  getData(): [] {
    return this.data
  }
}
