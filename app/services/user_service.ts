import User from '#models/user'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class UserService {
  public static async list(
    query: ModelQueryBuilderContract<typeof User>,
    page: number,
    limit: number
  ) {
    return query.paginate(page, limit)
  }

  public static async create(payload: User) {
    return User.create(payload)
  }

  public static async find(id: string) {
    return User.findOrFail(id)
  }

  public static async update(id: string, payload: Partial<User>) {
    const data = await User.findOrFail(id)
    data.merge(payload)
    await data.save()
    return data
  }

  public static async delete(id: string) {
    const data = await User.findOrFail(id)
    await data.delete()
    return true
  }
}
