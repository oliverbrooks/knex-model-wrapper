const down = exports.down = function down (knex, Promise) {
  return Promise.join(
    knex.schema.dropTableIfExists("users"),
    knex.schema.dropTableIfExists("account")
  );
};

exports.up = function up (knex, Promise) {
  return Promise.join(
    down(knex, Promise),

    knex.schema.createTable("users", function(t) {
      t.increments("id").primary();
      t.string("email").unique();
      t.string("password");
    }),

    knex.schema.createTable("posts", function(t) {
      t.increments("id").primary();
      t.integer("userId", 10).references("users.id");
    })
  );
};
