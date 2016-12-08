var ModelGenerator = require("../../");
var db = require("./db");
var modelGenerator = new ModelGenerator({
  db: db
});

// Export a pre-configured model generator
exports.generator = modelGenerator;

var userSchema = {
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
};

// export User model
exports.User = modelGenerator.create(userSchema);
exports.userSchema = userSchema;
