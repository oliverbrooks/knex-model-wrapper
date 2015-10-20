# Knex Model Wrapper

![circleci](https://circleci.com/gh/oliverbrooks/knex-model-wrapper.png?style=shield)
![Dependency Status](https://david-dm.org/oliverbrooks/knex-model-wrapper.svg)
![Dev Dependency Status](https://david-dm.org/oliverbrooks/knex-model-wrapper/dev-status.svg)

A lightweight functional wrapper using knex to model data.

## Objectives

* Provide helpers for data retrieval and saving without magic
* Export plain old JavaScript objects to extend easily
* Promise based for future proofing (generators/async-await etc)
* Throw errors which are easy to handle

## Usage

### models.js

Configure the models

```js
var Model = require("knex-model-wrapper");
var db = require("knex")();
db.connect();

var model = new Model({
  db: db
});

exports.User = model.create({
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

### use.js

Use the models to do cool stuff

```js
var models = require("./models");

function createUser () {
  models.User.insert({
    email: "me@example.com",
    password: "a9789zf89209df3232" // hashed password :)
  }).then(function (users) {
    // do something with your user
  }).catch(function (err) {
    // do something with validation errors etc
  })
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

Test are run using mocha `./node_modules/.bin/mocha` or the npm test script `npm test`.
