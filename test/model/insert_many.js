var expect = require("expect.js");
var data = require("../support/data");
var models = require("../support/models");

describe("model", function () {
  before(function () {
    return data.prepData();
  });

  describe("insertMany", function () {
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
        .insertMany(testAttrs)
        .then(function (users) {
          expect(users).to.be.an("array").and.to.have.length(2);
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
      var testAttrs = [
        {
          email: "insert1@test.com"
        },
        {
          email: "insert2@test.com",
          password: "dogdogdog"
        }
      ];

      models.User
        .insertMany(testAttrs)
        .then(function () {
          expect().fail("shouldn't get here!");
        })
        .catch(function (err) {
          expect(err).to.be.a(Error);
          expect(err.message).to.match(/invalid model attributes/);
          expect(err.errors).to.have.keys("password");
        });
    });
  });
});
