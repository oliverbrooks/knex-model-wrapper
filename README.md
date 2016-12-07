# Knex Model Wrapper

![circleci](https://circleci.com/gh/oliverbrooks/knex-model-wrapper.png?style=shield)
![Dependency Status](https://david-dm.org/oliverbrooks/knex-model-wrapper.svg)
![Dev Dependency Status](https://david-dm.org/oliverbrooks/knex-model-wrapper/dev-status.svg)

## Objective

Create a simple data models backed by knex.

* Promise API for data operations (get, insert, update, delete)
* Validate data going into the db and throw clear errors
* Provide before and after hooks
* Export plain old JavaScript objects, no magic

## Usage

### Model definition

Configure the models with your knex connection.

```js
var ModelWrapper = require("knex-model-wrapper");
var db = require("knex")();
db.connect();

// Configure the ModelWrapper to generate models
var model = new ModelWrapper({
  db: db
});

// Create models
var User = model.create({
  tableName: "users",
  schema: {
    id: {
      type: "number"
    },
    email: {
      type: "string",
      required: true
    },
    password: {
      type: "string",
      required: true
    }
  }
});
```

### Using models

See `lib/index.js` for full list of functions.

```js

User.insert({
  email: "me@example.com",
  password: "a9789zf89209df3232" // hashed password :)
})
.then(function (user) {
  console.log(user); // {id: 5, email: "me@example.com", password: "a9789zf89209df3232"}
})
.catch(function (err) {
  // do something with validation errors etc
});

User.get(5).then(function (user) {
  console.log(user); // {id: 5, email: "me@example.com", password: "a9789zf89209df3232"}
});

User.update({id: 5}, {
  email: "me@test.com"
})
.then(function (user) {
  console.log(user); // {id: 5, email: "me@test.com", password: "a9789zf89209df3232"}
});

User.count()
.then(function (data) {
  console.log(data); // {count: 1}
});

User.delete(5)
.then(function (data) {
  console.log(data); // {deleted: 1}
});
```

### Using model hooks

Model hooks are triggered before and after an event such as `insert`, `update`, `delete`, `insertMany`, `deleteMany`.

Model hooks can be registered when creating the model or added afterwards.

```js
// Add a hook when creating the model
var User = model.create({
  tableName: "users",
  schema: {
    id: {
      type: "number"
    },
    email: {
      type: "string",
      required: true
    },
    password: {
      type: "string",
      required: true
    }
  },
  beforeHooks: {
    insert: [
      function myHook (attrs) {
        console.log(attrs);
      }
    ]
  }
});

// Add a hook after creating the model
User.before("insert", function (attrs) {
  console.log(attrs); // Do something with the attributes
})
```

## Pro Tips

knex-model-wrapper uses [knex](http://knexjs.org/) which can be accessed via the `db` key of models for building custom queries.

knex-model-wrapper uses [hannibal](https://www.npmjs.com/package/hannibal) to validate data and perform any transforms. This is exposed on the model instance as the `hannibal` key. Custom validators and transforms can be registered when instantiating the model object.

Schemas schemas can be composed together easily. For example if all your models have id, createdAt and updatedAt properties a schema can be defined for those base attributes and merged into all other schemas.

```
var baseSchema = {
  id: {
    type: "number"
  },
  createdAt: {
    type: "date",
    default: function () {
      return new Date();
    }
  },
  updatedAt: {
    type: "date",
    transforms: "newDate"
  }
};

var User = model.create({
  schema: Object.assign(baseSchema, {
    firstName: {
      type: "string"
    }
  })
});
```

## Tests

A postgreSQL database is a pre-requisite for running the tests. Create a database and configure it in the knexfile. To generate a knexfile run `npm run setup-tests`.

To set up the test db with default settings in psql:

```
create database knex_model_wrapper_test;
```

Test are run using mocha `./node_modules/.bin/mocha` or the npm test script `npm test`.
