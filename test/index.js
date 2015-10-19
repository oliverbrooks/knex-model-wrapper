process.env.NODE_ENV = "test";

var db = require("./db");
var models = require("./models");
var expect = require("expect.js");

function prepData () {
  return db.schema.dropTableIfExists("users").then(function () {
    return db.schema.createTable("users", function(t) {
      t.increments("id").primary();
      t.string("email").unique();
      t.string("password");
    });
  });
}

function insertUser (data) {
  return db("users").insert(data).returning("*");
}

describe("knex-model-wrapper", function () {
  before(function () {
    return prepData();
  });

  describe("insert", function () {
    it("should insert a document", function () {
      var testAttrs = {
        email: "insert@test.com",
        password: "fishfishfish"
      };
      return models.User
        .insert(testAttrs)
        .then(function (users) {
          expect(users).to.have.length(1);
          expect(users[0]).to.have.keys(["id", "email", "password"]);
          expect(users[0].email).to.equal(testAttrs.email);
          expect(users[0].password).to.equal(testAttrs.password);
          expect(users[0].id).to.not.be(undefined);
        });
    });

    it("should insert multiple documents", function () {
      var testAttrs = [
        {
          email: "insert1@test.com",
          password: "fishfishfish"
        },
        {
          email: "insert2@test.com",
          password: "dogdogdog"
        }
      ];
      return models.User
        .insert(testAttrs)
        .then(function (users) {
          expect(users).to.have.length(2);
          expect(users[0]).to.have.keys(["id", "email", "password"]);
          expect(users[0].email).to.equal(testAttrs[0].email);
          expect(users[0].password).to.equal(testAttrs[0].password);
          expect(users[0].id).to.not.be(undefined);
          expect(users[1]).to.have.keys(["id", "email", "password"]);
          expect(users[1].email).to.equal(testAttrs[1].email);
          expect(users[1].password).to.equal(testAttrs[1].password);
          expect(users[1].id).to.not.be(undefined);
        });
    });

    it("should throw an error on validation error", function () {
      var testAttrs = {
        email: "insert@test.com"
      };
      try {
        models.User
          .insert(testAttrs)
          .exec()
          .then(function () {
            expect().fail("shouldn't get here!");
          });
      } catch (err) {
        expect(err).to.be.a(Error);
        expect(err.message).to.match(/invalid model attributes/);
        expect(err.errors).to.have.keys("password");
      }
    });

    it("should throw an error on constraint violation", function () {
      var testAttrs = {
        email: "duplicate@test.com",
        password: "fishfishfish"
      };
      return insertUser(testAttrs).then(function () {
        return models.User
          .insert(testAttrs)
          .then(function () {
            // Should throw not return
            expect(false).to.be(true);
          })
          .catch(function (err) {
            expect(err).to.be.an(Error);
          });
      });
    });
  });

  describe("update", function () {
    var users;

    before(function () {
      var testAttrs = {
        email: "toUpdate@test.com",
        password: "fishfishfish"
      };
      return insertUser(testAttrs).then(function (_users) {
        users = _users;
      });
    });

    it("should update a document", function () {
      var newAttrs = {
        email: "updated@example.com",
        password: "dogdogdog"
      };
      return models.User
        .update(users[0], newAttrs)
        .then(function (updatedUsers) {
          expect(updatedUsers[0].email).to.equal(newAttrs.email);
          expect(updatedUsers[0].password).to.equal(newAttrs.password);
          expect(updatedUsers[0].id).to.equal(users[0].id);
        });
    });

    it("should throw an error on validation error", function () {
      var testAttrs = {
        email: null
      };
      try {
        models.User
          .insert(testAttrs)
          .exec()
          .then(function () {
            expect().fail("shouldn't get here!");
          });
      } catch (err) {
        expect(err).to.be.a(Error);
        expect(err.message).to.match(/invalid model attributes/);
        expect(err.errors).to.have.keys("email");
      }
    });
  });

  describe("delete", function () {
    var users;

    before(function () {
      var testAttrs = {
        email: "toDelete@test.com",
        password: "fishfishfish"
      };
      return insertUser(testAttrs).then(function (_users) {
        users = _users;
      });
    });

    it("should delete a document", function () {
      return models.User
        .delete(users[0].id)
        .then(function (deleted) {
          expect(deleted).to.equal(1);
        });
    });
  });

  describe("get", function () {
    var users;

    before(function () {
      var testAttrs = {
        email: "get@test.com",
        password: "fishfishfish"
      };
      return models.User.insert(testAttrs).then(function (_users) {
        users = _users;
      });
    });

    it("should delete a document", function () {
      return models.User
        .get(users[0].id)
        .then(function (foundUsers) {
          expect(foundUsers).to.have.length(1);
          expect(foundUsers[0]).to.have.keys(["id", "email", "password"]);
          expect(foundUsers[0].id).to.equal(users[0].id);
          expect(foundUsers[0].email).to.equal(users[0].email);
          expect(foundUsers[0].password).to.equal(users[0].password);
        });
    });
  });
});
