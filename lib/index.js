var lodash = require("lodash");
var Hannibal = require("hannibal");
var validators = require("./validators");
var transforms = require("./transforms");
var Model = require("./model");

/**
 * Model constructor to configure models
 * @param  {Object}   config             config to build model with
 * @param  {Function} config.db          function returning a knex db object
 * @param  {Object}   config.baseSchema  a schema which all models can inherit from
 * @param  {Object}   config.validators  object containing Hannibal validators
 * @param  {Object}   config.transforms  object containing Hannibal transforms
 * @returns {Object} model object for fetching saving and validating data
 */
function ModelGenerator (config) {
  if (!config) {
    throw new Error("Configuration required");
  }
  if (!config.db) {
    throw new Error("db required");
  }
  this.db = config.db;
  this.baseSchema = config.baseSchema || {};
  this.hannibal = new Hannibal({
    transforms: transforms,
    validators: validators
  });
}

/**
 * Build a model from the given options.
 * @param  {Object}   options             options to build model with
 * @param  {String}   options.tableName   name of sql table to use
 * @param  {Object}   options.schema      hannibal schema for validation
 * @param  {String}   options.modelName   name of model
 * @param  {Function} options.preValidate function which takes and returns model data
 * @param  {Function} options.after       function which takes and returns model data
 * @returns {Object} model object for fetching saving and validating data
 */
ModelGenerator.prototype.create = function createModel (options) {
  var schema = lodash.assign({}, this.baseSchema, options.schema);

  return new Model({
    tableName: options.tableName,
    schema: schema,
    db: this.db,
    hannibal: this.hannibal,
    modelName: options.modelName || lodash.capitalize(options.tableName)
  });

};

module.exports = ModelGenerator;
