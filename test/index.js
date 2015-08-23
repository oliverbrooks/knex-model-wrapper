process.env.NODE_ENV = "test";

var db = require("./db");
var models = require("./models");
var knexConfig = require("./knexfile");
var test = require("tape");

test("knex-model-wrapper", function (t) {
  db.connect(knexConfig.test).then(function() {
    var testAttrs = {
      email: "example&test.com",
      password: "fishfishfish"
    };
    return models.User.insert(testAttrs).then(function (users) {
      t.equal(users[0].email, testAttrs.email, "email should be equal");
      t.equal(users[0].password, testAttrs.password, "password should be equal");
      t.ok(users[0].id, "id should be present");
    });

  });

});
