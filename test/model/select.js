var expect = require("expect.js");
var data = require("../support/data");
var models = require("../support/models");


describe("model", function () {
  before(function () {
    return data.prepData();
  });

  describe("select", function () {
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
        .select()
        .where({id: users[0].id})
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
