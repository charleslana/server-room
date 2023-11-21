export default class HandlerError {
  public readonly error?: boolean;
  public readonly message: string;
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    this.error = true;
    this.message = message;
    this.statusCode = statusCode;
  }
}
