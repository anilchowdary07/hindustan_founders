// Migration to add messaging tables
exports.up = async function(knex) {
  // Create conversations table
  await knex.schema.createTable('conversations', (table) => {
    table.increments('id').primary();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create conversation participants table
  await knex.schema.createTable('conversation_participants', (table) => {
    table.increments('id').primary();
    table.integer('conversation_id').notNullable().references('id').inTable('conversations').onDelete('CASCADE');
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('joined_at').defaultTo(knex.fn.now());
    table.timestamp('left_at');
    
    // Add unique constraint to prevent duplicate participants
    table.unique(['conversation_id', 'user_id']);
  });

  // Create messages table
  await knex.schema.createTable('messages', (table) => {
    table.increments('id').primary();
    table.integer('conversation_id').notNullable().references('id').inTable('conversations').onDelete('CASCADE');
    table.integer('sender_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('content').notNullable();
    table.text('attachment_url');
    table.text('attachment_type');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.boolean('is_edited').defaultTo(false);
    table.boolean('is_deleted').defaultTo(false);
  });

  // Create message read status table
  await knex.schema.createTable('message_read_status', (table) => {
    table.increments('id').primary();
    table.integer('message_id').notNullable().references('id').inTable('messages').onDelete('CASCADE');
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at');
    
    // Add unique constraint to prevent duplicate read statuses
    table.unique(['message_id', 'user_id']);
  });

  // Add indexes for better performance
  await knex.schema.table('conversation_participants', (table) => {
    table.index('conversation_id');
    table.index('user_id');
  });

  await knex.schema.table('messages', (table) => {
    table.index('conversation_id');
    table.index('sender_id');
  });

  await knex.schema.table('message_read_status', (table) => {
    table.index('message_id');
    table.index('user_id');
  });
};

exports.down = async function(knex) {
  // Drop tables in reverse order to avoid foreign key constraints
  await knex.schema.dropTableIfExists('message_read_status');
  await knex.schema.dropTableIfExists('messages');
  await knex.schema.dropTableIfExists('conversation_participants');
  await knex.schema.dropTableIfExists('conversations');
};