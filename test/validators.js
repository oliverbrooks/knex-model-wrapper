var expect = require("expect.js");
var validators = require("../lib/validators");

describe("validators", function () {
  describe("string", function () {
    describe("email", function () {
      it("should not throw an error if given an email", function () {
        expect(validators.string.email).withArgs("test@example.com").to.not.throwError();
      });

      it("should throw an error if not given an email", function () {
        expect(validators.string.email).withArgs("example.com").to.throwError();
      });
    });

    describe("url", function () {
      it("should not throw an error if given a url", function () {
        expect(validators.string.url).withArgs("http://example.com").to.not.throwError();
      });

      it("should throw an error if not given a url", function () {
        expect(validators.string.url).withArgs("example").to.throwError();
      });
    });
  });
});
