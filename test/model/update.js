var expect = require("expect.js");
var data = require("../support/data");
var models = require("../support/models");


describe("model", function () {
  beforeEach(function () {
    return data.prepData();
  });

  describe("update", function () {
    var users;

    beforeEach(function () {
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
        .then(function () {
          expect().fail("shouldn't get here!");
        })
        .catch(function (err) {
          expect(err).to.be.a(Error);
          expect(err.message).to.match(/invalid model attributes/);
          expect(err.errors).to.have.keys("email");
        });
    });

    describe("beforeHooks", function () {
      it("should trigger a before update hook", function () {
        var User = models.generator.create(models.userSchema);

        var didRun = false;
        User.before("update", function (_data) {
          expect(_data).to.be.an("object");
          expect(_data.email).to.be.a("string");
          expect(_data.password).to.be.a("string");
          didRun = true;
        });

        var newAttrs = {
          email: "update2@test.com",
          password: "fishfishfish"
        };

        return User.update(users[0], newAttrs)
        .then(function () {
          expect(didRun).to.be(true);
        });
      });

      it("should trigger a before all hook", function () {
        var User = models.generator.create(models.userSchema);

        var didRun = false;
        User.before("all", function (_data) {
          expect(_data).to.be.an("object");
          expect(_data.email).to.be.a("string");
          expect(_data.password).to.be.a("string");
          didRun = true;
        });

        var newAttrs = {
          email: "update2@test.com",
          password: "fishfishfish"
        };

        return User.update(users[0], newAttrs)
        .then(function () {
          expect(didRun).to.be(true);
        });
      });
    });

    describe("afterHooks", function () {
      it("should trigger an after update hook", function () {
        var User = models.generator.create(models.userSchema);

        var didRun = false;
        User.after("update", function (_data) {
          expect(_data).to.be.an("object");
          expect(_data.email).to.be.a("string");
          expect(_data.password).to.be.a("string");
          didRun = true;
        });

        var newAttrs = {
          email: "update3@test.com",
          password: "fishfishfish"
        };

        return User.update(users[0], newAttrs)
        .then(function () {
          expect(didRun).to.be(true);
        });
      });

      it("should trigger an after all hook", function () {
        var User = models.generator.create(models.userSchema);

        var didRun = false;
        User.after("all", function (_data) {
          expect(_data).to.be.an("object");
          expect(_data.email).to.be.a("string");
          expect(_data.password).to.be.a("string");
          didRun = true;
        });

        var newAttrs = {
          email: "update3@test.com",
          password: "fishfishfish"
        };

        return User.update(users[0], newAttrs)
        .then(function () {
          expect(didRun).to.be(true);
        });
      });
    });
  });
});
