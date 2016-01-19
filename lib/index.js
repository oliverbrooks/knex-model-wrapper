var lodash = require("lodash");
var Hannibal = require("hannibal");
var Bluebird = require("bluebird");
var errors = require("./errors");
var validators = require("./validators");
var transforms = require("./transforms");

/**
 * Return Boolean whether given 'thing' is an Object
 * @param {Object} thing    thing to check if it is an object
 * @returns {undefined} void
 */
function isObject (thing) {
  if (Object.prototype.toString.call(thing) !== "[object Object]") {
    throw new errors.DataError("item being inserted into the database is not an object", thing);
  }
  return thing;
}

/**
 * Handle errors from queries
 * @param {Error} err     error being thrown by postgres
 * @returns {undefined} void
 */
function handleError (err) {
  // If it is a constraint error we want to throw as invalidInput
  if (err.table && err.constraint) {
    throw new errors.ConflictError(err.message, {
      err: err
    }, {
      table: err.table,
      details: err.detail
    });
  } else {
    throw err;
  }
}

/**
 * Model constructor to configure models
 * @param  {Object}   config             config to build model with
 * @param  {Function} config.db          function returning a knex db object
 * @param  {Object}   config.baseSchema  a schema which all models can inherit from
 * @param  {Object}   config.validators  object containing Hannibal validators
 * @param  {Object}   config.transforms  object containing Hannibal transforms
 * @returns {Object} model object for fetching saving and validating data
 */
function Model (config) {
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
 * @returns {Object} model object for fetching saving and validating data
 */
Model.prototype.create = function createModel (options) {
  if (!options.tableName) {
    throw new Error("tableName required");
  }
  if (!options.schema) {
    throw new Error("schema required");
  }

  var db = this.db;

  var schema = lodash.assign({}, this.baseSchema, options.schema);

  var validator = this.hannibal.create({
    type: "object",
    schema: schema
  });

  return lodash.assign({}, options, {
    tableName: options.tableName,
    schema: schema,
    db: db,
    modelName: options.modelName || lodash.capitalize(options.tableName),

    /**
     * Return the 'id' of the object, this is the 'id' here but will change in
     * future to be a uuid.
     *
     * @param {Object} data data to get id from
     * @returns {Integer}  id
     */
    id: function (data) {
      if (!isNaN(parseInt(data, 10))) {
        return parseInt(data, 10);
      } else if (data && !isNaN(parseInt(data.id, 10))) {
        return parseInt(data.id, 10);
      } else {
        return null;
      }
    },

    /**
     * Gets the fields defined in the schema
     * @returns {Array} of field names
     */
    fields: function () {
      return Object.keys(this.schema);
    },

    /**
     * Pick only the model fields from the object supplied
     * @param {Object} obj   data object to pick from
     * @returns {Obj} of picked attributes
     */
    pickFields: function (obj) {
      return lodash.pick(obj, this.fields());
    },

    /**
     * Validate the model
     * @param {Object} data   object to validate
     * @param {Object} opts   additional validation options
     * @param {Boolean} opts.throwOnErr throw an error on fail rather than returning falsey
     * @returns {Object} valid fields
     */
    validate: function validateData (data, opts) {
      opts = opts || {};

      opts = this._setDefaultOpts(opts);

      return new Bluebird(function (resolve) {
        resolve(this._processData(data, opts));
      }.bind(this))
      .then(function (data) {
        var form = validator(data);

        // This should fail hard when 'throwOnErr' is passed. This is passed for
        // all internal operations, so for instance 'create' will assume that
        // validation has been performed prior to the call, and does it as a double
        // validation check (incase we forgot to validate input)
        if(!form.isValid) {
          if(opts.throwOnErr) {
            throw new errors.ValidationError("invalid model attributes " + this.tableName, form.error, data);
          }
        }

        return form.data;
      }.bind(this));
    },

    /**
     * Insert a new record into db
     *
     * @param {Object}      attrs    data to save
     * @param {Object}      opts     insert options
     * @returns {knex.query} knex query builder
     */
    insert: function insertDocument (attrs, opts) {
      opts = opts || {};

      return new Bluebird(function (resolve) {
        resolve(isObject(attrs));
      })
      .then(function (attrs) {
        return this.validate(attrs, opts)
      }.bind(this))
      .then(function (attrs) {
        return db(this.tableName)
          .insert(attrs)
          .returning("*")
          .then(function (items) {
            return items[0];
          })
      }.bind(this))
      .catch(handleError);
    },

    /**
     * Insert a new record into db
     *
     * @param {Object}      attrs    data to save
     * @param {Object}      opts     insert options
     * @returns {knex.query} knex query builder
     */
    insertMany: function insertDocuments (attrs, opts) {
      opts = opts || {};

      attrs = [].concat(attrs);

      return new Bluebird(function (resolve) {
        lodash.forEach(attrs, isObject);
        if (attrs.length < 1) {
          throw new errors.DataError("trying to insert nothing into the database", attrs);
        }
        resolve(attrs);
      })
      .then(function (attrs) {
        attrs = lodash.map(attrs, function (item) {
          return this.validate(item, opts);
        }.bind(this));

        return Bluebird.all(attrs)
      }.bind(this))
      .then(function (attrs) {

        return db(this.tableName)
          .insert(attrs)
          .returning("*")
      }.bind(this))
      .catch(handleError);
    },

    /**
     * Update a record in the db
     *
     * @param {Object}  record  record to update
     * @param {Object}  attrs   data to update with
     * @param {Object}  opts    update options
     * @returns {knex.query} knex query builder
     */
    update: function updateDocument (record, attrs, opts) {
      attrs = attrs || {};
      opts = opts || {};

      return new Bluebird(function (resolve) {
        isObject(record);
        isObject(attrs);
        resolve();
      })
      .then(function () {
        var data = lodash.assign(record, attrs);
        return this.validate(data, opts)
      }.bind(this))
      .then(function (data) {
        return db(this.tableName)
          .where({id: this.id(data)})
          .update(data)
          // NOTE: Safety we should never update more than one row here
          .limit(1)
          .returning("*")
          .then(function (res) {
            return res[0];
          })
      }.bind(this))
      .catch(handleError);
    },

    /**
     * Delete a model
     *
     * @param {Thing} data      with id to fetch
     * @returns {knex.query} knex query builder
     */
    delete: function deleteDocument (data) {
      return db(this.tableName)
        .where({id: this.id(data)})
        .delete()
        .limit(1);
    },

    /**
     * Delete a model
     *
     * @param {Thing} data      with id to fetch
     * @returns {knex.query} knex query builder
     */
    deleteMany: function deleteDocuments (data) {
      var itemIds = lodash.map(data, this.id);
      return db(this.tableName)
        .whereIn("id", itemIds)
        .delete()
        .limit(itemIds.length);
    },

    /**
     * Get a model by id
     *
     * @param {Integer}  id   ids of model to fetch
     * @returns {knex.query} knex query builder
     */
    get: function getDocument (id) {
      return db(this.tableName)
        .first(this.tableName + ".*")
        .where("" + this.tableName + ".id", "=", id);
    },

    /**
     * Get a model by id
     *
     * @param {Array}  ids   ids of model to fetch
     * @returns {knex.query} knex query builder
     */
    getMany: function getDocuments (ids) {
      return db(this.tableName)
        .select(this.tableName + ".*")
        .whereIn("" + this.tableName + ".id", [].concat(ids));
    },

    /**
     * Select helper
     *
     * @returns {knex.query} knex query builder
     */
    select: function selectQuery () {
      var _db = db(this.tableName);
      return _db.select.apply(_db, arguments);
    },

    /**
     * First helper
     *
     * @returns {knex.query} knex query builder
     */
    first: function selectQuery () {
      var _db = db(this.tableName);
      return _db.first.apply(_db, arguments);
    },

    /**
     * Count helper
     *
     * @returns {knex.query} knex query builderx.query}
     */
    count: function countQuery () {
      var _db = db(this.tableName);
      return _db.count.apply(_db, arguments);
    },

    /**
     * Is this a new model?
     *
     * @param {Object}   data       to treat as a model
     * @returns {knex.query} knex query builder
     */
    isNew: function isDocumentNew (data) {
      isObject(data);
      return data.hasOwnProperty("id") && data.id > 0;
    },

    /**
     * set the default options for inserting/updating a model
     *
     * @private
     * @param {Object}    opts options object
     * @param {Boolean}   opts.throwErr    if true throw
     * @param {Boolean}   opts.preValidate if true run any preValidate function defined on the model
     * @param {Boolean}   opts.safe        if true only allow specified attrs to db
     * @returns {Object}  default options
     *
     */
    _setDefaultOpts: function (opts) {
      opts = opts || {};
      opts.throwOnErr = opts.throwOnErr === false ? false : true;
      opts.preValidate = opts.preValidate === false ? false : true;
      opts.validate = opts.validate === false ? false : true;
      opts.safe = opts.safe === false ? false : true;
      return opts;
    },

    /**
     * process incoming data based on options
     *
     * @private
     * @param {Object}    data             data to process
     * @param {Object}    opts             options object
     * @param {Boolean}   opts.throwErr    if true throw
     * @param {Boolean}   opts.preValidate if true run any preValidate function defined on the model
     * @param {Boolean}   opts.safe        if true only allow specified attrs to db
     * @returns {Object} processed data
     *
     */
    _processData: function (data, opts) {

      return new Bluebird(function(resolve) {
        if (opts.preValidate && this.preValidate) {
          resolve(this.preValidate(data));
        } else {
          resolve(data);
        }
      }.bind(this))
      .then(function (data) {
        if (opts.safe) {
          return this.pickFields(data);
        } else {
          return data;
        }
      }.bind(this));
    }
  });

};

module.exports = Model;
