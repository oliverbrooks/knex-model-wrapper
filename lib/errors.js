// http://dailyjs.com/2014/01/30/exception-error/
var util = require("util");

/**
 * Error thrown if a generic datalayer error occurs
 * @param {String}   message      error message
 * @param {Error}    errors       any error details
 * @param {Object}   data         the data being validated
 * @returns {undefined} void
 */
function DataError (message, errors, data) {
  Error.apply(this, arguments);
  this.name = "KnexModelWrapper:DataError";
  this.message = message + " " + JSON.stringify(errors);
  this.httpCode = 400;
  this.errors = errors;
  this.data = data;
  return this;
}

util.inherits(DataError, Error);

DataError.prototype.toJSON = function () {
  return {
    "@type": this.name,
    message: this.message,
    errors: this.errors,
    data: this.data
  };
};

/**
 * Error thrown if data doesn't validate
 * @param {String}   message      error message
 * @param {Error}    errors       any thrown error objects
 * @param {Object}   data         the data being validated
 * @returns {undefined} void
 */
function ValidationError () {
  DataError.apply(this, arguments);
  this.name = "KnexModelWrapper:ValidationError";
  this.httpCode = 400;
  return this;
}
util.inherits(ValidationError, DataError);

/**
 * Error thrown if knex has a data conflict such as a unique index
 * @param {String}   message      error message
 * @param {Error}    errors       any thrown error objects
 * @param {Object}   data         the data being validated
 * @returns {undefined} void
 */
function ConflictError () {
  DataError.apply(this, arguments);
  this.name = "KnexModelWrapper:ConflictError";
  this.httpCode = 409;
  return this;
}
util.inherits(ConflictError, DataError);

module.exports = {
  DataError: DataError,
  ValidationError: ValidationError,
  ConflictError: ConflictError
};
