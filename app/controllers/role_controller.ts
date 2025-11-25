import type { HttpContext } from '@adonisjs/core/http'
import RoleService from '#services/role_service'
import { createRoleValidator, updateRoleValidator } from '#validators/role_validator'
import Role from '#models/role'
import { applyQueryOptions } from '#config/query_builder'
import ApiResponse from '#config/api_response'

export default class RoleController {
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const query = Role.query()

    applyQueryOptions(query, {
      search: request.input('search'),
      searchColumns: ['name'],
      filters: request.input('filters', {}),
      sortBy: request.input('sortBy', 'created_at'),
      sortDir: request.input('sortDir', 'desc'),
    })

    const data = await RoleService.list(query, page, limit)
    return ApiResponse.paginate('roles fetched successfully', data)
  }

  async show({ params, response }: HttpContext) {
    const data = await RoleService.find(params.id)
    return ApiResponse.success('roles fetched successfully', data)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createRoleValidator)
    const data = await RoleService.create(payload.data as Role)
    return ApiResponse.success('roles created successfully', data)
  }

  async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateRoleValidator)
    const data = await RoleService.update(params.id, payload.data)
    return ApiResponse.success('roles updated successfully', data)
  }

  async destroy({ params, response }: HttpContext) {
    await RoleService.delete(params.id)
    return ApiResponse.success('roles deleted successfully')
  }
}
