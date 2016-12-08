var expect = require("expect.js");
var data = require("../support/data");
var models = require("../support/models");


describe("model", function () {
  before(function () {
    return data.prepData();
  });

  describe("delete", function () {
    var users;

    before(function () {
      var testAttrs = {
        email: "toDelete@test.com",
        password: "fishfishfish"
      };
      return data.insertUser(testAttrs).then(function (_users) {
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

    describe("beforeHooks", function () {
      it("should trigger a before delete hook", function () {
        var User = models.generator.create(models.userSchema);

        var didRun = false;
        User.before("delete", function (_data) {
          didRun = true;
        });

        var testAttrs = {
          email: "delete@test.com",
          password: "fishfishfish"
        };
        return User.delete(testAttrs)
        .then(function () {
          expect(didRun).to.be(true);
        });
      });

      it("should trigger the before all hook", function () {
        var User = models.generator.create(models.userSchema);

        var didRun = false;
        User.before("all", function (_data) {
          didRun = true;
        });

        var testAttrs = {
          email: "delete@test.com",
          password: "fishfishfish"
        };
        return User.delete(testAttrs)
        .then(function () {
          expect(didRun).to.be(true);
        });
      });
    });

    describe("afterHooks", function () {
      it("should trigger an after delete hook", function () {
        var User = models.generator.create(models.userSchema);

        var didRun = false;
        User.after("delete", function (_data, action) {
          didRun = true;
        });

        var testAttrs = {
          email: "delete@test.com",
          password: "fishfishfish"
        };
        return User.delete(testAttrs)
        .then(function () {
          expect(didRun).to.be(true);
        });
      });

      it("should trigger the after all hook", function () {
        var User = models.generator.create(models.userSchema);

        var didRun = false;
        User.after("all", function (_data) {
          didRun = true;
        });

        var testAttrs = {
          email: "delete@test.com",
          password: "fishfishfish"
        };
        return User.delete(testAttrs)
        .then(function () {
          expect(didRun).to.be(true);
        });
      });
    });
  });
});
