export class ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;

  constructor(
    success: boolean,
    message: string,
    data?: T,
    statusCode: number = 200,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  static success<T>(
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
  ): ApiResponse<T> {
    return new ApiResponse(true, message, data, statusCode);
  }

  static error<T>(
    message: string = 'Error',
    statusCode: number = 400,
    data?: T,
  ): ApiResponse<T> {
    return new ApiResponse(false, message, data, statusCode);
  }
}
