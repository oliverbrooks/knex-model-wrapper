# Knex Model Wrapper

A lightweight functional wrapper using knex to model data.

## Objectives

* Provide helpers for data retrieval and saving without magic
* Export POJSO to make easily extensible

## Usage

### db.js

Export a function returning a configured knex object

```js
import knex from "knex";

let db;

export function connection () {
  if (!db) {
    throw "No db"
  } else {
    return db;
  }
}

export function connect (opts) {
  db = knex(opts);
  return db;
}
```

### models.js

Configure the models

```js
import Model from "knex-model-wrapper";
import db from "./db";

export const User = Model({
  tableName: "users",
  db: db.connection,
  schema: {
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

export const Post = Model({
  tableName: "posts",
  db: db,
  schema: {
    userId: {
      type: "number",
      filters: "toInt",
      required: true
    },
    text: {
      type: "string"
    }
  }
});
```

### use.js

Use the models to do cool stuff

```js
import db from "./db";
import models from "./models";

db.connect().then(function (db) {
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
