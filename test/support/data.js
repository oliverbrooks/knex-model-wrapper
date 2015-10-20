var db = require("./db");

exports.prepData = function prepData () {
  return db.schema.dropTableIfExists("users").then(function () {
    return db.schema.createTable("users", function(t) {
      t.increments("id").primary();
      t.string("email").unique();
      t.string("password");
    });
  });
};

exports.insertUser = function insertUser (data) {
  return db("users").insert(data).returning("*");
};
