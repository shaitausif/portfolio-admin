import { NextResponse } from "next/server";

class ApiError extends Error {
  statusCode: number;
  message: string;
  errors: { [key: string]: string }[] = [];
  data: any;
  success: boolean;

  constructor(
    statusCode: number,
    message = "Something went wrong",
    errors: any[] = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Centralized error handler for API routes.
 * Returns a proper NextResponse based on whether the error is a known ApiError or an unexpected one.
 */
function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        errors: error.errors,
        data: null,
        statusCode: error.statusCode,
      },
      { status: error.statusCode }
    );
  }
  console.error(error instanceof Error ? error.message : error);
  return NextResponse.json(
    {
      success: false,
      message: "Something went wrong",
      data: null,
      statusCode: 500,
    },
    { status: 500 }
  );
}

export { ApiError, handleApiError };
