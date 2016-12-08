var expect = require("expect.js");
var db = require("../support/db");
var models = require("../support/models");
var Model = require("../../lib/model");

describe("new Model(config, modelDefinition)", function () {

  it("should throw if not given a config", function () {
    expect(Model).withArgs().to.throwError(function (err) {
      expect(err.message).to.eql("ModelGenerator instance required");
    });
  });

  it("should throw if not given a modelDefinition", function () {
    expect(Model).withArgs(models.generator).to.throwError(function (err) {
      expect(err.message).to.eql("modelDefinition required");
    });
  });

  it("should configure the model constructor with minimum args", function () {
    var modelDefinition = {
      schema: {},
      tableName: "users"
    };

    expect(Model).withArgs(models.generator, modelDefinition).to.not.throwError();
  });

  it("should configure the model with a schema", function () {
    var model = new Model(models.generator, {
      tableName: "users",
      schema: {
        id: {
          type: "string"
        },
        email: {
          type: "string"
        }
      }
    });

    expect(model.schema).to.be.an("object").and.to.have.keys("id", "email");
  });

  it("should configure the model with methods", function () {
    var model = new Model(models.generator, {
      tableName: "users",
      schema: {
        id: {
          type: "string"
        },
        email: {
          type: "string"
        }
      },
      insertAUser: function () {
        return this.insert({
          email: "fish"
        });
      }
    });

    expect(model).to.be.an("object").and.to.have.keys("insertAUser");
    expect(model.insertAUser).to.be.a("function");

    model.insertAUser().then(function (user) {
      expect(user).to.be.an("object");
      expect(user.email).to.equal("fish");
    });
  });
});
