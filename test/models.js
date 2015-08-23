var Model = require("../");
var db = require("./db");

exports.User = Model({
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

exports.Post = Model({
  tableName: "posts",
  db: db.connection,
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
