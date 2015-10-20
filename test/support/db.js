var knex = require("knex");
var knexConfig = require("../../knexfile");
var db = knex(knexConfig.test);

module.exports = db;
