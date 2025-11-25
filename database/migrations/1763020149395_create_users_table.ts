import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('name').notNullable()
      table.string('email').notNullable()
      table.string('username').nullable()
      table.string('nik').notNullable()
      table.string('npk').nullable()
      table.string('department_id').notNullable()
      table.string('position_id').notNullable()
      table.string('division_id').notNullable()
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at')
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
