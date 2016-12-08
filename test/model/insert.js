var expect = require("expect.js");
var data = require("../support/data");
var models = require("../support/models");

describe("model", function () {
  beforeEach(function () {
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

      models.User
        .insert(testAttrs)
        .then(function () {
          expect().fail("shouldn't get here!");
        })
        .catch(function (err) {
          expect(err).to.be.a(Error);
          expect(err.message).to.match(/invalid model attributes/);
          expect(err.errors).to.have.keys("password");
        });
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

    describe("beforeHooks", function () {
      it("should trigger a before insert hook", function () {
        var User = models.generator.create(models.userSchema);

        var didRun = false;
        User.before("insert", function (_data) {
          expect(_data).to.be.an("object");
          expect(_data.email).to.be.a("string");
          expect(_data.password).to.be.a("string");
          didRun = true;
        });

        var testAttrs = {
          email: "insert@test.com",
          password: "fishfishfish"
        };
        return User.insert(testAttrs)
        .then(function () {
          expect(didRun).to.be(true);
        });
      });

      it("should trigger the before all hook", function () {
        var User = models.generator.create(models.userSchema);

        var didRun = false;
        User.before("all", function (_data) {
          expect(_data).to.be.an("object");
          expect(_data.email).to.be.a("string");
          expect(_data.password).to.be.a("string");
          didRun = true;
        });

        var testAttrs = {
          email: "insert@test.com",
          password: "fishfishfish"
        };
        return User.insert(testAttrs)
        .then(function () {
          expect(didRun).to.be(true);
        });
      });
    });

    describe("afterHooks", function () {
      it("should trigger an after insert hook", function () {
        var User = models.generator.create(models.userSchema);

        var didRun = false;
        User.after("insert", function (_data) {
          expect(_data).to.be.an("object");
          expect(_data.email).to.be.a("string");
          expect(_data.password).to.be.a("string");
          didRun = true;
        });

        var testAttrs = {
          email: "insert@test.com",
          password: "fishfishfish"
        };
        return User.insert(testAttrs)
        .then(function () {
          expect(didRun).to.be(true);
        });
      });

      it("should trigger the after all hook", function () {
        var User = models.generator.create(models.userSchema);

        var didRun = false;
        User.after("all", function (_data) {
          expect(_data).to.be.an("object");
          expect(_data.email).to.be.a("string");
          expect(_data.password).to.be.a("string");
          didRun = true;
        });

        var testAttrs = {
          email: "insert@test.com",
          password: "fishfishfish"
        };
        return User.insert(testAttrs)
        .then(function () {
          expect(didRun).to.be(true);
        });
      });
    });
  });
});
