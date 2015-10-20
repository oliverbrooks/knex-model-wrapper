module.exports = {
  /**
   * If given an number, string or object it finds the id and returns it
   * @param {Number|String|Object}  idOrObject    item to get the id from
   * @returns {Number} id
   */
  ensureId: function (idOrObject) {
    if (idOrObject === null || idOrObject === undefined) {
      return idOrObject;
    } else if (idOrObject.hasOwnProperty("id") && parseInt(idOrObject.id, 10)) {
      return parseInt(idOrObject.id, 10);
    } else {
      return parseInt(idOrObject, 10);
    }
  },
  /**
   * set value to the current time (useful for updated at)
   * @returns {Date} the current date
   */
  newDate: function () {
    return new Date();
  }
};
