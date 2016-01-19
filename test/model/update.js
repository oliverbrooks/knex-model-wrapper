var expect = require("expect.js");
var data = require("../support/data");
var models = require("../support/models");


describe("model", function () {
  before(function () {
    return data.prepData();
  });

  describe("update", function () {
    var users;

    before(function () {
      var testAttrs = {
        email: "toUpdate@test.com",
        password: "fishfishfish"
      };
      return data.insertUser(testAttrs).then(function (_users) {
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
        .then(function (updatedUser) {
          expect(updatedUser.email).to.equal(newAttrs.email);
          expect(updatedUser.password).to.equal(newAttrs.password);
          expect(updatedUser.id).to.equal(users[0].id);
        });
    });

    it("should throw an error on validation error", function () {
      var testAttrs = {
        email: null
      };
      models.User
        .insert(testAttrs)
        .exec()
        .then(function () {
          expect().fail("shouldn't get here!");
        })
        .catch(function (err) {
          expect(err).to.be.a(Error);
          expect(err.message).to.match(/invalid model attributes/);
          expect(err.errors).to.have.keys("email");
        });
    });
  });
});
