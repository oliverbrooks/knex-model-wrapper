export class DataError extends Error {
  constructor (message, errors, data) {
    super();
    this.message = message;
    this.httpCode = 400;
    this.errors = errors;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
  toJSON () {
    return {
      "@type": "data:error",
      message: this.message,
      errors: this.errors,
      data: this.data
    };
  }
}

export class ValidationError extends DataError {
  constructor (...args) {
    super(args);
    this.httpCode = 400;
    Error.captureStackTrace(this, this.constructor);
  }
  toJSON () {
    return {
      "@type": "data:validationError",
      message: this.message,
      errors: this.errors,
      data: this.data
    };
  }
}

export class ConflictError extends DataError {
  constructor (...args) {
    super(args);
    this.httpCode = 409;
    Error.captureStackTrace(this, this.constructor);
  }
  toJSON () {
    return {
      "@type": "data:conflictError",
      message: this.message,
      errors: this.errors,
      data: this.data
    };
  }
}