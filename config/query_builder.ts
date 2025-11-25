import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { DatabaseQueryBuilderContract } from '@adonisjs/lucid/types/querybuilder'
interface QueryOptions {
  search?: string
  searchColumns?: string[]
  filters?: Record<string, any>
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

// union type untuk mendukung Model.query() dan db.from()/db.query()
type AnyQueryBuilder = ModelQueryBuilderContract<any> | DatabaseQueryBuilderContract<any>

export function applyQueryOptions<T extends AnyQueryBuilder>(query: T, options: QueryOptions): T {
  const { search, searchColumns = [], filters = {}, sortBy, sortDir = 'asc' } = options

  // 🔍 Global search
  if (search && searchColumns.length) {
    // callback q kita tipetkan any untuk menghindari mismatch signature
    query.where((q: any) => {
      searchColumns.forEach((col, index) => {
        if (index === 0) {
          q.where(col, 'ilike', `%${search}%`)
        } else {
          q.orWhere(col, 'ilike', `%${search}%`)
        }
      })
    })
  }

  // 🎯 Filters
  Object.keys(filters).forEach((col) => {
    const val = filters[col]
    if (val !== undefined && val !== null && val !== '') {
      query.where(col, val)
    }
  })

  // ↕ Sorting
  if (sortBy) {
    query.orderBy(sortBy, sortDir)
  }

  return query
}
