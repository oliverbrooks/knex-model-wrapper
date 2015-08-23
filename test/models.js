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
      type: "email",
      required: true
    },
    password: {
      type: "string",
      required: true
    }
  }
});