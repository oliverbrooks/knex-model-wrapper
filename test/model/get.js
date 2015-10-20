var expect = require("expect.js");
var data = require("../support/data");
var models = require("../support/models");


describe("model", function () {
  before(function () {
    return data.prepData();
  });

  describe("get", function () {
    var users;

    before(function () {
      var testAttrs = {
        email: "get@test.com",
        password: "fishfishfish"
      };
      return data.insertUser(testAttrs).then(function (_users) {
        users = _users;
      });
    });

    it("should delete a document", function () {
      return models.User
        .get(users[0].id)
        .then(function (foundUser) {
          expect(foundUser).to.be.a("object");
          expect(foundUser).to.have.keys(["id", "email", "password"]);
          expect(foundUser.id).to.equal(users[0].id);
          expect(foundUser.email).to.equal(users[0].email);
          expect(foundUser.password).to.equal(users[0].password);
        });
    });
  });
});
