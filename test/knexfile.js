// Update with your config settings.
module.exports = {
  test: {
    client: "pg",
    dialect: "postgres",
    connection: process.env.PG_CONNECTION || "postgres://postgres:@127.0.0.1:5432/knex_model_wrapper_test"
  }
};
