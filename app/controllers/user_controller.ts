import type { HttpContext } from '@adonisjs/core/http'
import UserService from '#services/user_service'
import { createUserValidator, updateUserValidator } from '#validators/user_validator'
import User from '#models/user'
import { applyQueryOptions } from '#config/query_builder'
import ApiResponse from '#config/api_response'

export default class UserController {
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const query = User.query()

    applyQueryOptions(query, {
      search: request.input('search'),
      searchColumns: ['name'],
      filters: request.input('filters', {}),
      sortBy: request.input('sortBy', 'created_at'),
      sortDir: request.input('sortDir', 'desc'),
    })

    const data = await UserService.list(query, page, limit)
    return ApiResponse.paginate('users fetched successfully', data)
  }

  async show({ params, response }: HttpContext) {
    const data = await UserService.find(params.id)
    return ApiResponse.success('users fetched successfully', data)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)
    const data = await UserService.create(payload.data as User)
    return ApiResponse.success('users created successfully', data)
  }

  async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateUserValidator)
    const data = await UserService.update(params.id, payload.data)
    return ApiResponse.success('users updated successfully', data)
  }

  async destroy({ params, response }: HttpContext) {
    await UserService.delete(params.id)
    return ApiResponse.success('users deleted successfully')
  }
}
