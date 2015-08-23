var lodash = require("lodash");
var schema = require("schemajs");
var errors = require("errors");

/**
 * add a filter to schemaJS so when an object is given instead of an RID it converts it to an RID
 * @param {Number|String|Object}  idOrObject    item to get the id from
 * @returns {Number} id
 */
schema.filters.ensureId = function(idOrObject) {
  if(idOrObject.hasOwnProperty("id")) {
    return idOrObject.id;
  } else {
    return idOrObject;
  }
};

/**
 * Return Boolean whether given 'thing' is an Object
 * @param {Object} thing    thing to check if it is an object
 * @returns {undefined} void
 */
function isObject (thing) {
  if (Object.prototype.toString.call(thing) !== "[object Object]") {
    throw new Error("item being inserted into the database is not an object", thing);
  }
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
 * Build a model from the given options.
 * @param  {Object}   options             options to build model with
 * @param  {Function} options.db          function returning a knex db object
 * @param  {String}   options.tableName   name of sql table to use
 * @param  {Object}   options.schema      schemajs schema for validation
 * @param  {String}   options.modelName   name of model
 * @param  {Function} options.preValidate function which takes and returns model data
 * @returns {Object} model object for fetching saving and validating data
 */
module.exports = function buildModel (options = {}) {
  if (!options.db) {
    throw new Error("db required");
  }
  if (!options.tableName) {
    throw new Error("tableName required");
  }
  if (!options.schema) {
    throw new Error("schema required");
  }

  const db = options.db;

  return lodash.assign({}, options, {
    tableName: options.tableName,
    schema: options.schema,
    modelName: options.modelName || options.tableName,

    /**
     * Return the 'id' of the object, this is the 'id' here but will change in
     * future to be a uuid.
     *
     * @param {Object} data data to get id from
     * @returns {Integer}  id
     */
    id: function(data) {
      if (parseInt(data, 10)) {
        return parseInt(data, 10);
      } else if (data && parseInt(data.id, 10)) {
        return parseInt(data.id, 10);
      } else {
        return null;
      }
    },

    /**
     * Gets the fields defined in the schema
     * @returns {Array} of field names
     */
    fields: function() {
      return Object.keys(this.schema);
    },

    /**
     * Pick only the model fields from the object supplied
     * @param {Object} obj   data object to pick from
     * @returns {Obj} of picked attributes
     */
    pickFields: function(obj) {
      return lodash.pick(obj, this.fields());
    },

    /**
     * Validate the model
     * @param {Object} data   object to validate
     * @param {Object} opts   additional validation options
     * @param {Boolean} opts.throwOnErr throw an error on fail rather than returning falsey
     * @returns {Object} valid fields
     */
    validate: function(data, opts = {}) {
      let output;
      opts = this._setDefaultOpts(opts);

      data = this._processData(data, opts);

      const form = schema
        .create(this.schema)
        .validate(data, {strict: true});

      // This should fail hard when 'throwOnErr' is passed. This is passed for
      // all internal operations, so for instance 'create' will assume that
      // validation has been performed prior to the call, and does it as a double
      // validation check (incase we forgot to validate input)
      if(!form.valid) {
        if(opts.throwOnErr) {
          throw new errors.ValidationError("invalid model attributes " + this.tableName, form.errors, data);
        }
      } else {
        output = form.data;
      }

      return output;

    },

    /**
     * Insert a new record into db
     *
     * @param {Object}      data     data to save
     * @returns {knex.query} knex query builder
     */
    insert: function(data, opts = {}) {

      if (!Array.isArray(data)){
        data = [data];
      }

      if (data.length < 1) {
        throw new errors.DataError("trying to insert nothing into the database", data);
      }

      data = data.map( item => {
        isObject(item);
        return this.validate(item, opts);
      });

      return db()
        .from(this.tableName)
        .insert(data)
        .returning("*")
        .catch(handleError);
    },

    /**
     * Update a record in the db
     *
     * @param {Object}  record  record to update
     * @param {Object}  attrs   data to update with
     * @returns {knex.query} knex query builder
     */
    update: function(record, attrs = {}, opts = {}) {
      isObject(record);
      isObject(attrs);
      let data = lodash.assign(record, attrs);

      data = this.validate(data, opts);

      return db().from(this.tableName)
        .where({id: this.id(data)})
        .update(data)
        .returning("*")
        // NOTE: Safety we should never update more than one row here
        .limit(1)
        .catch(handleError);
    },

    /**
     * Delete a model
     *
     * @param {Thing} data      with id to fetch
     * @returns {knex.query} knex query builder
     */
    delete: function(data) {
      if (Array.isArray(data)) {
        const itemIds = lodash.map(data, this.id);
        return db().from(this.tableName)
          .whereIn("id", itemIds)
          .delete()
          .limit(itemIds.length);

      } else {
        return db()
          .from(this.tableName)
          .where({id: this.id(data)})
          .delete()
          .limit(1);
      }
    },

    /**
     * Get a model by id
     *
     * @param {String}  id    id of model to fetch
     * @returns {knex.query} knex query builder
     */
    get: function(id) {
      return db()
        .from(this.tableName)
        .select(this.tableName + ".*")
        .where(`${this.tableName}.id`, id)
        .limit(1);
    },

    /**
     * Select helper
     *
     * @returns {knex.query} knex query builder
     */
    select: function() {
      const _db = db().from(this.tableName);
      return _db.select.apply(_db, arguments);
    },

    /**
     * Count helper
     *
     * @returns {knex.query} knex query builderx.query}
     */
    count: function() {
      const _db = db().from(this.tableName);
      return _db.count.apply(_db, arguments);
    },

    /**
     * Is this a new model?
     *
     * @param {Object}   data       to treat as a model
     * @returns {knex.query} knex query builder
     */
    isNew: function(data) {
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
    _setDefaultOpts: function (opts = {}) {
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
      if (opts.preValidate && this.preValidate) {
        data = this.preValidate(data);
      }

      if (opts.safe) {
        data = this.pickFields(data);
      }

      return data;
    }
  });

};
