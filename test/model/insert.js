var expect = require("expect.js");
var data = require("../support/data");
var models = require("../support/models");

describe("model", function () {
  before(function () {
    return data.prepData();
  });

  describe("insert", function () {
    it("should insert a document", function () {
      var testAttrs = {
        email: "insert@test.com",
        password: "fishfishfish"
      };
      return models.User
        .insert(testAttrs)
        .then(function (user) {
          expect(user).to.be.a("object");
          expect(user).to.have.keys(["id", "email", "password"]);
          expect(user.email).to.equal(testAttrs.email);
          expect(user.password).to.equal(testAttrs.password);
          expect(user.id).to.not.be(undefined);
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
      return data.insertUser(testAttrs).then(function () {
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
});
