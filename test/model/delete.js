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
  });
});
