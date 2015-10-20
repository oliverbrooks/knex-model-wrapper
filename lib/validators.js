module.exports = {
  string: {
    email: function (value) {
      var emailRegex = /[a-zA-Z0-9!#$%&'*+\/=?\^_`{|}~\-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?\^_`{|}~\-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?/;
      if (!emailRegex.test(value)) {
        throw new Error("value '" + value + "' is not an email address");
      }
    },
    url: function (value) {
      var urlRegex = /^(http(s)?:\/\/)?([\w\-]+\.{1})*(([\w\-]*){1}(\.{1}[A-Za-z]{2,4}){1}){1}(\:{1}\d*)?([\?\/|\#]+[\@\~\;\+\'\#\,\.\%\-\/\&\?\=\w\$\s]*)*$/i;
      if (!urlRegex.test(value)) {
        throw new Error("value '" + value + "' is not a url");
      }
    }
  }
};
