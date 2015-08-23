var knex = require("knex");

var db;

exports.connection = function connection () {
  if (!db) {
    throw "No db";
  } else {
    return db;
  }
};

exports.connect = function connect (opts) {
  db = knex(opts);
  return db;
};
