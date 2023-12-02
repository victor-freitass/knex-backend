exports.up = function(knex) {
    return knex.schema.alterTable('users', table => {
        table.string('updatedAt')
    })
};

exports.down = function(knex) {
    return knex.schema.alterTable('users', table => {
        table.dropColumn('updatedAt')
    })
};
