var expect = require("expect.js");
var data = require("../support/data");
var models = require("../support/models");


describe("model", function () {
  before(function () {
    return data.prepData();
  });

  describe("getMany", function () {
    var users;

    before(function () {
      var testAttrs = [
        {
          email: "insert21@test.com",
          password: "fishfishfish"
        },
        {
          email: "insert22@test.com",
          password: "dogdogdog"
        }
      ];
      return data.insertUser(testAttrs).then(function (_users) {
        users = _users;
      });
    });

    it("should delete a document", function () {
      return models.User
        .getMany(users.map(function (i) { return i.id; }))
        .then(function (foundUsers) {
          expect(foundUsers).to.have.length(2);
          expect(foundUsers[0]).to.have.keys(["id", "email", "password"]);
          expect(foundUsers[0].id).to.equal(users[0].id);
          expect(foundUsers[0].email).to.equal(users[0].email);
          expect(foundUsers[0].password).to.equal(users[0].password);
          expect(foundUsers[1]).to.have.keys(["id", "email", "password"]);
          expect(foundUsers[1].id).to.equal(users[1].id);
          expect(foundUsers[1].email).to.equal(users[1].email);
          expect(foundUsers[1].password).to.equal(users[1].password);
        });
    });
  });
});
