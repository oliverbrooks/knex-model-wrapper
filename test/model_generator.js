var expect = require("expect.js");
var ModelGenerator = require("../");
var db = require("./support/db");
var Hannibal = require("hannibal");


describe("new ModelGenerator(config)", function () {

  it("should throw if not given a config", function () {
    expect(ModelGenerator).withArgs().to.throwError(function (err) {
      expect(err.message).to.eql("Configuration required");
    });
  });

  it("should configure the model constructor with minimum args", function () {
    expect(ModelGenerator).withArgs({
      db: db
    }).to.not.throwError();

    var model = new ModelGenerator({
      db: db
    });

    expect(model.db).to.be.a("function").and.to.equal(db);
    expect(model.hannibal).to.be.an("object");
    expect(model.baseSchema).to.be.an("object");
  });

  it("should configure the model constructor with a baseSchema", function () {
    var model = new ModelGenerator({
      db: db,
      baseSchema: {
        id: {
          type: "string"
        }
      }
    });

    expect(model.db).to.be.a("function");
    expect(model.baseSchema).to.be.an("object").and.to.have.keys("id");
  });

  it("should configure the model constructor with a hannibal instance", function () {
    var hannibal = new Hannibal();
    var model = new ModelGenerator({
      db: db,
      hannibal: hannibal
    });

    expect(model.db).to.be.a("function");
    expect(model.hannibal).to.be.an("object").and.to.equal(hannibal);
  });
});
