var ModelGenerator = require("../../");
var db = require("./db");
var modelGenerator = new ModelGenerator({
  db: db
});

exports.User = modelGenerator.create({
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
