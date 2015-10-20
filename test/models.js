var Model = require("../");
var db = require("./db");
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
      required: true,
      validators: {
        email: true
      }
    },
    password: {
      type: "string",
      required: true
    }
  }
});
