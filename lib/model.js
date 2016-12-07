var Bluebird = require("bluebird");
var errors = require("./errors");
var lodash = require("lodash");

function generateHooks (hooks) {
  hooks = hooks || {};
  return {
    all: hooks.all || [],
    delete: hooks.delete || [],
    deleteMany: hooks.deleteMany || [],
    insert: hooks.insert || [],
    insertMany: hooks.insertMany || [],
    update: hooks.update || [],
    updateMany: hooks.updateMany || []
  };
}

/**
 * Model instance
 * @param    {Object}   options             options to build model with
 * @property {Function} config.db           function returning a knex db object
 * @property {Object}   options.afterHooks  object describing various hooks such as insert, update, delete
 * @property {Object}   options.beforeHooks object describing various hooks such as insert, update, delete
 * @property {Function} options.preValidate function which takes and returns model data
 * @property {Object}   config.baseSchema   a schema which all models can inherit from
 * @property {Object}   options.schema      hannibal schema for validation
 * @property {String}   options.modelName   name of model
 * @property {String}   options.tableName   name of sql table to use
 * @returns  {Object}   model object for fetching saving and validating data
 */
function Model (options) {
  if (!options.tableName) {
    throw new Error("options.tableName required");
  }
  if (!options.modelName) {
    throw new Error("options.modelName required");
  }
  if (!options.schema) {
    throw new Error("options.schema required");
  }
  if (!options.db) {
    throw new Error("options.db required");
  }
  if (!options.schema) {
    throw new Error("options.schema required");
  }

  this.afterHooks = generateHooks(options.afterHooks);
  this.beforeHooks = generateHooks(options.beforeHooks);
  this.db = options.db;
  this.modelName = options.modelName;
  this.schema = options.schema;
  this.tableName = options.tableName;

  this.validator = options.hannibal.create({
    type: "object",
    schema: options.schema
  });
}

Model.prototype.before = function addBeforeHook (action, hook) {
  if (this.beforeHooks[action]) {
    this.beforeHooks[action].push(hook);
  }
};

Model.prototype.after = function addAfterHook (action, hook) {
  if (this.afterHooks[action]) {
    this.afterHooks[action].push(hook);
  }
};

/**
 * Return the 'id' of the object, this is the 'id' here but will change in
 * future to be a uuid.
 *
 * @param {Object} data data to get id from
 * @returns {Integer}  id
 */
Model.prototype.id = function (data) {
  if (!isNaN(parseInt(data, 10))) {
    return parseInt(data, 10);
  } else if (data && !isNaN(parseInt(data.id, 10))) {
    return parseInt(data.id, 10);
  } else {
    return null;
  }
};

/**
 * Gets the fields defined in the schema
 * @returns {Array} of field names
 */
Model.prototype.fields = function () {
  return Object.keys(this.schema);
};

/**
 * Pick only the model fields from the object supplied
 * @param {Object} obj   data object to pick from
 * @returns {Obj} of picked attributes
 */
Model.prototype.pickFields = function (obj) {
  return lodash.pick(obj, this.fields());
};

/**
 * Validate the model
 * @param {Object} data   object to validate
 * @param {Object} opts   additional validation options
 * @param {Boolean} opts.throwOnErr throw an error on fail rather than returning falsey
 * @param {String} action throw an error on fail rather than returning falsey
 * @returns {Object} valid fields
 */
Model.prototype.validate = function validateData (data, opts, action) {
  opts = this._setDefaultOpts(opts);

  return Bluebird.bind(this)
  .then(function () {
    return this._processData(data, opts, action);
  })
  .then(function (_data) {
    var form = this.validator(_data);

    // This should fail hard when 'throwOnErr' is passed. This is passed for
    // all internal operations, so for instance 'create' will assume that
    // validation has been performed prior to the call, and does it as a double
    // validation check (incase we forgot to validate input)
    if(!form.isValid) {
      if(opts.throwOnErr) {
        throw new errors.ValidationError("invalid model attributes " + this.tableName, form.error, _data);
      }
    }

    return form.data;
  })
  .bind(this);
};

/**
 * Insert a new record into db
 *
 * @param {Object}      attrs    data to save
 * @param {Object}      opts     insert options
 * @returns {knex.query} knex query builder
 */
Model.prototype.insert = function insertDocument (attrs, opts) {
  opts = opts || {};

  return Bluebird.bind(this)
  .then(function () {
    return this.isObject(attrs);
  })
  .then(function (_attrs) {
    return this.validate(_attrs, opts, "insert");
  })
  .then(function (_attrs) {
    return this._runBeforeHooks("insert", _attrs);
  })
  .then(function () {
    return this.db(this.tableName)
      .insert(attrs)
      .returning("*")
      .then(function (items) {
        return items[0];
      });
  })
  .then(function (data) {
    return this._runAfterHooks("insert", data);
  })
  .catch(this.handleError);
};

/**
 * Insert a new record into db
 *
 * @param {Object}      attrs    data to save
 * @param {Object}      opts     insert options
 * @returns {knex.query} knex query builder
 */
Model.prototype.insertMany = function insertDocuments (attrs, opts) {
  opts = opts || {};

  attrs = [].concat(attrs);

  lodash.forEach(attrs, this.isObject);
  if (attrs.length < 1) {
    throw new errors.DataError("trying to insert nothing into the database", attrs);
  }

  return Bluebird.bind(this)
  .then(function () {
    return Bluebird.map(attrs, function (item) {
      return this.validate(item, opts, "insert");
    }.bind(this));
  })
  .then(function (_attrs) {
    return this._runBeforeHooks("insertMany", _attrs);
  })
  .then(function (_attrs) {
    return this.db(this.tableName)
      .insert(_attrs)
      .returning("*");
  })
  .then(function (_data) {
    return this._runAfterHooks("insertMany", _data);
  })
  .catch(this.handleError);
};

/**
 * Update a record in the db
 *
 * @param {Object}  record  record to update
 * @param {Object}  attrs   data to update with
 * @param {Object}  opts    update options
 * @returns {knex.query} knex query builder
 */
Model.prototype.update = function updateDocument (record, attrs, opts) {
  attrs = attrs || {};
  opts = opts || {};

  this.isObject(record);
  this.isObject(attrs);

  return Bluebird.bind(this)
  .then(function () {
    var data = lodash.assign(record, attrs);
    return this.validate(data, opts, "update");
  })
  .then(function (_attrs) {
    return this._runBeforeHooks("update", _attrs);
  })
  .then(function (data) {
    return this.db(this.tableName)
      .where({id: this.id(data)})
      .update(data)
      // NOTE: Safety we should never update more than one row here
      .limit(1)
      .returning("*")
      .then(function (res) {
        return res[0];
      });
  })
  .then(function (data) {
    return this._runAfterHooks("update", data);
  })
  .catch(this.handleError);
};

/**
 * Delete a model
 *
 * @param {Thing} data      with id to fetch
 * @returns {knex.query} knex query builder
 */
Model.prototype.delete = function deleteDocument (data) {
  return Bluebird.bind(this)
  .then(function () {
    return this._runBeforeHooks("delete", data);
  })
  .then(function (_data) {
    return this.db(this.tableName)
    .where({
      id: this.id(_data)
    })
    .delete()
    .limit(1);
  })
  .then(function (_data) {
    return this._runAfterHooks("delete", _data);
  });
};

/**
 * Delete a many models
 *
 * @param {Thing} data      with id to fetch
 * @returns {knex.query} knex query builder
 */
Model.prototype.deleteMany = function deleteDocuments (data) {
  return Bluebird.bind(this)
  .then(function () {
    return this._runBeforeHooks("deleteMany", data);
  })
  .then(function (_data) {
    var itemIds = lodash.map(_data, this.id);
    return this.db(this.tableName)
      .whereIn("id", itemIds)
      .delete()
      .limit(itemIds.length);
  })
  .then(function (_data) {
    return this._runAfterHooks("deleteMany", _data);
  });
};

/**
 * Get a model by id
 *
 * @param {Integer}  id   ids of model to fetch
 * @returns {knex.query} knex query builder
 */
Model.prototype.get = function getDocument (id) {
  return this.db(this.tableName)
  .first(this.tableName + ".*")
  .where("" + this.tableName + ".id", "=", id);
};

/**
 * Get a model by id
 *
 * @param {Array}  ids   ids of model to fetch
 * @returns {knex.query} knex query builder
 */
Model.prototype.getMany = function getDocuments (ids) {
  return this.db(this.tableName)
    .select(this.tableName + ".*")
    .whereIn("" + this.tableName + ".id", [].concat(ids));
};

/**
 * Select helper
 *
 * @returns {knex.query} knex query builder
 */
Model.prototype.select = function selectQuery () {
  var _db = this.db(this.tableName);
  return _db.select.apply(_db, arguments);
};

/**
 * First helper
 *
 * @returns {knex.query} knex query builder
 */
Model.prototype.first = function selectQuery () {
  var _db = this.db(this.tableName);
  return _db.first.apply(_db, arguments);
};

/**
 * Count helper
 *
 * @returns {knex.query} knex query builderx.query}
 */
Model.prototype.count = function countQuery () {
  var _db = this.db(this.tableName);
  return _db.count.apply(_db, arguments);
};

/**
 * Is this a new model?
 *
 * @param {Object}   data       to treat as a model
 * @returns {knex.query} knex query builder
 */
Model.prototype.isNew = function isDocumentNew (data) {
  this.isObject(data);
  return data.hasOwnProperty("id") && data.id > 0;
};

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
Model.prototype._setDefaultOpts = function setDefaultActionOptions (opts) {
  opts = opts || {};
  opts.throwOnErr = opts.throwOnErr === false ? false : true;
  opts.preValidate = opts.preValidate === false ? false : true;
  opts.validate = opts.validate === false ? false : true;
  opts.safe = opts.safe === false ? false : true;
  return opts;
};

/**
 * process incoming data based on options
 *
 * @private
 * @param {Object}    data             data to process
 * @param {Object}    opts             options object
 * @param {Boolean}   opts.throwErr    if true throw
 * @param {Boolean}   opts.preValidate if true run any preValidate function defined on the model
 * @param {Boolean}   opts.safe        if true only allow specified attrs to db
 * @param {String} action throw an error on fail rather than returning falsey
 * @returns {Object} processed data
 *
 */
Model.prototype._processData = function (data, opts, action) {

  return new Bluebird(function(resolve) {
    if (opts.preValidate && this.preValidate) {
      resolve(this.preValidate(data, action));
    } else {
      resolve(data);
    }
  })
  .bind(this)
  .then(function (_data) {
    if (opts.safe) {
      return this.pickFields(_data);
    } else {
      return data;
    }
  });
};

/**
 * Run any named hooks and return the original data
 * @param {String} action   name of hook such as insert, update
 * @param {Object} data     data to pass to hooks
 * @returns {Object} data
 */
Model.prototype._runAfterHooks = function executeAfterHooks (action, data) {
  if (this.afterHooks[action]) {
    return this._runHooks(this.afterHooks[action], data);
  } else {
    return data;
  }
};

/**
 * Run any named hooks and return the original data
 * @param {String} action   name of hook such as insert, update
 * @param {Object} data     data to pass to hooks
 * @returns {Object} data
 */
Model.prototype._runBeforeHooks = function executeBeforeHooks (action, data) {
  if (this.beforeHooks[action]) {
    return this._runHooks(this.beforeHooks[action], data);
  } else {
    return data;
  }
};

/**
 * Run any given hooks and return the original data
 * @param {Array} hooks     array of functions (hooks) to run
 * @param {Object} data     data to pass to hooks
 * @returns {Object} data
 */
Model.prototype._runHooks = function runHooks (hooks, data) {
  if (hooks) {
    return Bluebird.map(hooks, function (hook) {
      return hook.apply(this, data);
    })
    .bind(this)
    .then(function () {
      return data;
    });
  } else {
    return data;
  }
};


/**
 * Return Boolean whether given 'thing' is an Object
 * @param {Object} thing    thing to check if it is an object
 * @returns {undefined} void
 */
Model.prototype.isObject = function isObject (thing) {
  if (Object.prototype.toString.call(thing) !== "[object Object]") {
    throw new errors.DataError("item being inserted into the database is not an object", thing);
  }
  return thing;
};

/**
 * Handle errors from queries
 * @param {Error} err     error being thrown by postgres
 * @returns {undefined} void
 */
Model.prototype.handleError = function handleError (err) {
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
};

module.exports = Model;
