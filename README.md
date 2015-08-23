# Knex Model Wrapper

A lightweight functional wrapper using knex to model data.

## Objectives

* Provide helpers for data retrieval and saving without magic
* Export plain old JavaScript objects to extend easily
* Promise based for future proofing (generators/async-await etc)
* Throw errors which are easy to handle

## Usage

### db.js

Export a function returning a configured knex object

```js
var knex = require("knex");

var db;

exports.connection = function connection () {
  if (!db) {
    throw "No db";
  } else {
    return db;
  }
};

exports.connect = function connect (opts) {
  db = knex(opts);
  return db;
};

```

### models.js

Configure the models

```js
var Model = require("knex-model-wrapper");
var db = require("./db");

exports.User = Model({
  tableName: "users",
  db: db.connection,
  schema: {
    id: {
      type: "number"
    },
    email: {
      type: "email",
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
var db = require("./db");
var models = require("./models");
db.connect();

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


## Tests

A postgreSQL database is a pre-requisite for running the tests. Create a database and configure it in the knexfile. To generate a knexfile run `npm run setup-tests`.

Test are run using mocha `./node_modules/.bin/mocha` or the npm test script `npm test`.
