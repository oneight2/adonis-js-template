import Role from '#models/role'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class RoleService {
  public static async list(
    query: ModelQueryBuilderContract<typeof Role>,
    page: number,
    limit: number
  ) {
    return query.paginate(page, limit)
  }

  public static async create(payload: Role) {
    return Role.create(payload)
  }

  public static async find(id: string) {
    return Role.findOrFail(id)
  }

  public static async update(id: string, payload: Partial<Role>) {
    const data = await Role.findOrFail(id)
    data.merge(payload)
    await data.save()
    return data
  }

  public static async delete(id: string) {
    const data = await Role.findOrFail(id)
    await data.delete()
    return true
  }
}
