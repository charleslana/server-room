import { Response } from 'express';

export default class HandlerSuccess {
  public readonly error: boolean;
  public readonly message: string;
  public readonly statusCode: number;

  constructor(message: string, statusCode = 200) {
    this.error = false;
    this.message = message;
    this.statusCode = statusCode;
  }

  toJSON(response: Response) {
    return response.status(this.statusCode).json({
      error: this.error,
      message: this.message,
    });
  }
}
