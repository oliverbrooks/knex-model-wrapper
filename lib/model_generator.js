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
 * @param  {Object}   config.hannibal    a custom hannibal instance
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
  this.hannibal = config.hannibal || new Hannibal({
    transforms: transforms,
    validators: validators
  });
}

/**
 * Build a model from the given options.
 * @param    {Object}   modelDefinition             modelDefinition to build model with
 * @property {Object}   modelDefinition.schema      hannibal schema for validation
 * @property {String}   modelDefinition.modelName   name of model
 * @property {String}   modelDefinition.tableName   name of sql table to use
 * @property {Object}   modelDefinition.afterHooks  object describing various hooks such as insert, update, delete
 * @property {Object}   modelDefinition.beforeHooks object describing various hooks such as insert, update, delete
 * @property {Function} modelDefinition.preValidate function which takes and returns model data
 * @returns  {Object}   model object for fetching saving and validating data
 */
ModelGenerator.prototype.create = function createModel (modelDefinition) {
  return new Model(this, modelDefinition);
};

module.exports = ModelGenerator;
