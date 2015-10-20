var expect = require("expect.js");
var Model = require("../");
var db = require("./support/db");


describe("new Model(config)", function () {

  it("should throw if not given a config", function () {
    expect(Model).withArgs().to.throwError(function (err) {
      expect(err.message).to.eql("Configuration required");
    });
  });

  it("should configure the model constructor with minimum args", function () {
    expect(Model).withArgs({
      db: db
    }).to.not.throwError();
  });

  it("should configure the model constructor", function () {
    var model = new Model({
      db: db,
      baseSchema: {
        id: {
          type: "string"
        }
      }
    });

    expect(model.db).to.be.a("function");
    expect(model.hannibal).to.be.an("object");
    expect(model.baseSchema).to.be.an("object").and.to.have.keys("id");
  });
});
