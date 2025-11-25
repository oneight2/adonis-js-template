import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, beforeUpdate, column } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import { v4 as uuidv4 } from 'uuid'

export default class User extends compose(BaseModel, SoftDeletes) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  name?: string

  @column()
  email?: string

  @column()
  username?: string

  @column()
  nik?: string

  @column()
  npk?: string

  @column()
  department_id?: string

  @column()
  position_id?: string

  @column()
  division_id?: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  @column.dateTime({ columnName: 'deleted_at', serializeAs: null })
  declare deletedAt: DateTime | null

  @beforeCreate()
  public static async assignUuid(user: User) {
    user.id = uuidv4()
    user.updatedAt = null
  }

  @beforeUpdate()
  public static setUpdatedTimestamp(user: User) {
    user.updatedAt = DateTime.now()
  }
}
