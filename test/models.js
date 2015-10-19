var Model = require("../");
var db = require("./db");

exports.User = Model({
  tableName: "users",
  db: db.connection,
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
