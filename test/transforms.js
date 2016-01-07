var expect = require("expect.js");
var transforms = require("../lib/transforms");

describe("transforms", function () {
  describe("ensureId", function () {
    it("should return a number if given a number", function () {
      var id = transforms.ensureId(5);
      expect(id).to.be.a("number").and.eql(5);
    });

    it("should return a negative number if given a negative number", function () {
      var id = transforms.ensureId(-5);
      expect(id).to.be.a("number").and.eql(-5);
    });

    it("should return a number if given a string", function () {
      var id = transforms.ensureId("5");
      expect(id).to.be.a("number").and.eql(5);
    });

    it("should return the id if an object is given with an id", function () {
      var id = transforms.ensureId({id: 5});
      expect(id).to.be.a("number").and.eql(5);
    });

    it("should return the id if an object is given with a string id", function () {
      var id = transforms.ensureId({id: "5"});
      expect(id).to.be.a("number").and.eql(5);
    });

    it("should return null if given", function () {
      var id = transforms.ensureId(null);
      expect(id).eql(null);
    });

    it("should return 0 if given 0", function () {
      var id = transforms.ensureId(0);
      expect(id).eql(0);
    });
  });

  describe("newDate", function () {
    it("should return new date if given an empty value", function () {
      var id = transforms.newDate();
      expect(id).to.be.a(Date);
    });

    it("should return new date if given a value", function () {
      var id = transforms.newDate(5);
      expect(id).to.be.a(Date);
    });
  });
});
