var expect = require("expect.js");
var data = require("../support/data");
var models = require("../support/models");


describe("model", function () {
  before(function () {
    return data.prepData();
  });

  describe("deleteMany", function () {
    var users;

    before(function () {
      var testAttrs = [
        {
          email: "insert11@test.com",
          password: "fishfishfish"
        },
        {
          email: "insert12@test.com",
          password: "dogdogdog"
        }
      ];
      return data.insertUser(testAttrs).then(function (_users) {
        users = _users;
      });
    });

    it("should delete a document", function () {
      return models.User
        .deleteMany(users.map(function (i) { return i.id; }))
        .then(function (deleted) {
          expect(deleted).to.equal(2);
        });
    });
  });
});
