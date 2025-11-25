import { BaseCommand } from '@adonisjs/core/ace'
import { join } from 'node:path'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { readdirSync } from 'node:fs'
import { Argument } from '@adonisjs/core/types/ace'

export default class MakeCrud extends BaseCommand {
  static commandName = 'make:crud'
  static description =
    'Generate CRUD using existing migration. Usage: node ace make:crud <tableName> <modelName>'

  static args = [
    {
      name: 'tableName',
      argumentName: 'tableName',
      description: 'Table name (from existing migration)',
      type: 'string',
      required: true,
    },
    {
      name: 'modelName',
      argumentName: 'modelName',
      description: 'Model name (PascalCase)',
      type: 'string',
      required: true,
    },
  ] as unknown as Argument[]

  async run() {
    const tableName = (this as any).tableName || this.parsed.args[0]
    const modelName = (this as any).modelName || this.parsed.args[1]

    if (!tableName || !modelName) {
      this.logger.error('Usage: node ace make:crud <tableName> <modelName>')
      this.exitCode = 1
      return
    }

    // Find migration file for this table
    const migrationFile = this.findMigrationByTable(tableName)
    if (!migrationFile) {
      this.logger.error(`No migration found for table "${tableName}"`)
      this.exitCode = 1
      return
    }

    // Extract columns from migration
    const columns = this.extractColumnsFromMigration(migrationFile)
    this.logger.info(`Found columns: ${columns.map((c) => c.name).join(', ')}`)

    // Generate files
    const write = (path: string, content: string) => {
      const dir = dirname(path)
      try {
        mkdirSync(dir, { recursive: true })
      } catch (e) {
        // ignore
      }
      writeFileSync(path, content)
      this.logger.success(`created ${path}`)
    }

    const lower = tableName.toLowerCase()
    const plural = lower.endsWith('s') ? lower : lower + 's'

    // Generate Model with properties from migration
    write(`app/models/${modelName?.toLowerCase()}.ts`, this.generateModel(modelName, columns))

    // Generate Controller
    const controllerFileName: any = `${modelName.toLowerCase().replace(/ /g, '_')}_controller.ts`
    const controllerFilePath = `app/controllers/${controllerFileName}`

    // Generate Service
    write(
      `app/services/${modelName.toLowerCase()}_service.ts`,
      this.generateService(modelName, plural)
    )

    try {
      write(controllerFilePath, this.generateController(modelName, plural))
    } catch (error) {
      this.logger.error(`Failed to create ${controllerFileName}: ${error}`)
      return
    }

    // Generate Validator
    write(
      `app/validators/${modelName?.toLowerCase()}_validator.ts`,
      this.generateValidator(modelName, columns)
    )

    const importString = `\nconst ${this.capitalize(modelName)}Controller = () => import('#controllers/${modelName.toLowerCase()}_controller')\n`
    const routeString = `// CRUD ${this.capitalize(modelName)}
router
  .group(() => {
    router.get('/', [${this.capitalize(modelName)}Controller, 'index'])
    router.get('/:id', [${this.capitalize(modelName)}Controller, 'show'])
    router.post('/', [${this.capitalize(modelName)}Controller, 'store'])
    router.put('/:id', [${this.capitalize(modelName)}Controller, 'update'])
    router.delete('/:id', [${this.capitalize(modelName)}Controller, 'destroy'])
  })
  .prefix('${plural}')`

    const routesPath = 'start/routes.ts'
    let oldRoutes = readFileSync(routesPath, 'utf-8')
    const lastImportIndex = oldRoutes.lastIndexOf('import')
    if (lastImportIndex !== -1) {
      // cari baris enter setelah import terakhir
      const nextLineIndex = oldRoutes.indexOf('\n', lastImportIndex) + 1
      oldRoutes = oldRoutes.slice(0, nextLineIndex) + importString + oldRoutes.slice(nextLineIndex)
    }
    // lalu tambahkan route di akhir file
    write(routesPath, oldRoutes + routeString)

    this.logger.success(`create route for ${this.capitalize(modelName)} generated successfully!`)

    this.logger.success(`CRUD ${this.capitalize(modelName)} generated successfully!`)
  }

  /**
   * Find migration file by table name
   */
  private findMigrationByTable(tableName: string): string | null {
    try {
      const migrationsDir = 'database/migrations'
      const files = readdirSync(migrationsDir)
      const migrationFile = files.find((file) => file.includes(tableName))
      return migrationFile ? join(migrationsDir, migrationFile) : null
    } catch (e) {
      return null
    }
  }

  /**
   * Extract column names and types from migration schema
   */
  private extractColumnsFromMigration(
    migrationPath: string
  ): Array<{ name: string; type: string }> {
    const content = readFileSync(migrationPath, 'utf-8')

    // Parse table.* calls to find columns
    // Match patterns like: table.string('name'), table.integer('age'), etc.
    const columnRegex = /table\.(\w+)\(['"`]([^'"`]+)['"`](?:\s*,\s*\d+)?/g
    const columns: Array<{ name: string; type: string }> = []
    let match

    // Skip system columns (id, created_at, updated_at)
    const skipColumns = ['id', 'created_at', 'updated_at', 'deleted_at']

    while ((match = columnRegex.exec(content)) !== null) {
      const type = match[1]
      const name = match[2]

      if (!skipColumns.includes(name)) {
        columns.push({ name, type })
      }
    }

    return columns
  }

  private capitalize(word: string) {
    if (!word) return ''
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  }

  /**
   * Generate Model content with properties
   */
  private generateModel(modelName: string, columns: Array<{ name: string; type: string }>): string {
    const properties = columns
      .map(
        (col) => `  @column()
  ${col.name}?: ${this.tsTypeFromDbType(col.type)}`
      )
      .join('\n\n')

    return `import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, beforeUpdate, column } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import { v4 as uuidv4 } from 'uuid'

export default class ${this.capitalize(modelName)} extends compose(BaseModel, SoftDeletes) {
  @column({ isPrimary: true })
  declare id: string

${properties}

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at' })
  declare updatedAt: DateTime | null

  @column.dateTime({ columnName: 'deleted_at', serializeAs: null })
  declare deletedAt: DateTime | null

  @beforeCreate()
  public static async assignUuid(${modelName?.toLowerCase()}: ${this.capitalize(modelName)}) {
    ${modelName?.toLowerCase()}.id = uuidv4()
    ${modelName?.toLowerCase()}.updatedAt = null
  }

  @beforeUpdate()
  public static setUpdatedTimestamp(${modelName?.toLowerCase()}: ${this.capitalize(modelName)}) {
    ${modelName?.toLowerCase()}.updatedAt = DateTime.now()
  }
}
`
  }

  /**
   * Map database column types to TypeScript types
   */
  private tsTypeFromDbType(dbType: string): string {
    const typeMap: Record<string, string> = {
      string: 'string',
      text: 'string',
      integer: 'number',
      bigInteger: 'number',
      increments: 'number',
      boolean: 'boolean',
      decimal: 'number',
      float: 'number',
      date: 'string',
      time: 'string',
      datetime: 'DateTime',
      timestamp: 'DateTime',
      json: 'Record<string, any>',
      uuid: 'string',
    }
    return typeMap[dbType] || 'any'
  }

  /**
   * Generate Controller content
   */
  private generateController(modelName: string, plural: string): string {
    return `import type { HttpContext } from '@adonisjs/core/http'
import ${this.capitalize(modelName)}Service from '#services/${modelName.toLowerCase()}_service'
import { create${this.capitalize(modelName)}Validator, update${this.capitalize(modelName)}Validator } from '#validators/${modelName.toLowerCase()}_validator'
import ${this.capitalize(modelName)} from '#models/${modelName}'
import { applyQueryOptions } from '#config/query_builder'
import ApiResponse from '#config/api_response'

export default class ${this.capitalize(modelName)}Controller {
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)

    const query = ${this.capitalize(modelName)}.query()

    applyQueryOptions(query, {
      search: request.input('search'),
      searchColumns: ['name'],
      filters: request.input('filters', {}),
      sortBy: request.input('sortBy', 'created_at'),
      sortDir: request.input('sortDir', 'desc'),
    })

    const data = await ${this.capitalize(modelName)}Service.list(query, page, limit)
    return ApiResponse.paginate('${plural} fetched successfully', data)
  }

  async show({ params, response }: HttpContext) {
    const data = await ${this.capitalize(modelName)}Service.find(params.id)
    return ApiResponse.success('${plural} fetched successfully', data)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(create${this.capitalize(modelName)}Validator)
    const data = await ${this.capitalize(modelName)}Service.create(payload.data as ${this.capitalize(modelName)})
    return ApiResponse.success('${plural} created successfully', data)
  }

  async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(update${this.capitalize(modelName)}Validator)
    const data = await ${this.capitalize(modelName)}Service.update(params.id, payload.data)
    return ApiResponse.success('${plural} updated successfully', data)
  }

  async destroy({ params, response }: HttpContext) {
    await ${this.capitalize(modelName)}Service.delete(params.id)
    return ApiResponse.success('${plural} deleted successfully')
  }
}
`
  }

  /**
   * Generate Validator content
   */
  private generateValidator(modelName: string, columns: any[]): string {
    const createRules = this.generateRules(columns, false)
    const updateRules = this.generateRules(columns, true)

    return `import vine from '@vinejs/vine'

export const create${this.capitalize(modelName)}Validator = vine.compile(
  vine.object({
    data: vine.object({
${createRules}
    }),
  })
)

export const update${this.capitalize(modelName)}Validator = vine.compile(
  vine.object({
    data: vine.object({
${updateRules}
    }),
  })
)
`
  }

  /**
   * Generate Service content
   */
  private generateService(modelName: string, plural: string): string {
    return `import ${this.capitalize(modelName)} from '#models/${modelName}'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class ${this.capitalize(modelName)}Service {
  public static async list(
    query: ModelQueryBuilderContract<typeof ${this.capitalize(modelName)}>,
    page: number,
    limit: number
  ) {
    return query.paginate(page, limit)
  }

  public static async create(payload: ${this.capitalize(modelName)}) {
    return ${this.capitalize(modelName)}.create(payload)
  }

  public static async find(id: string) {
    return ${this.capitalize(modelName)}.findOrFail(id)
  }

  public static async update(id: string, payload: Partial<${this.capitalize(modelName)}>) {
    const data = await ${this.capitalize(modelName)}.findOrFail(id)
    data.merge(payload)
    await data.save()
    return data
  }

  public static async delete(id: string) {
    const data = await ${this.capitalize(modelName)}.findOrFail(id)
    await data.delete()
    return true
  }
}
`
  }

  private generateRules(columns: any[], isUpdate: boolean): string {
    return columns
      .filter((col) => !['id', 'created_at', 'updated_at', 'deleted_at'].includes(col.name))
      .map((col) => {
        const rule = this.mapColumnToVine(col, isUpdate)
        return `      ${col.name}: ${rule},`
      })
      .join('\n')
  }

  private mapColumnToVine(col: any, isUpdate: boolean): string {
    let rule = 'vine.string()'

    switch (col.type) {
      case 'int':
      case 'integer':
      case 'bigint':
        rule = 'vine.number()'
        break
      case 'boolean':
        rule = 'vine.boolean()'
        break
      case 'date':
      case 'timestamp':
      case 'datetime':
        rule = 'vine.date()'
        break
      default:
        rule = 'vine.string()'
    }

    // UPDATE → semua optional
    if (isUpdate) {
      return `${rule}.optional()`
    }

    // CREATE → jika kolom nullable → optional()
    if (col.isNullable) {
      return `${rule}.optional()`
    }

    // CREATE → required (default behaviour)
    return rule
  }
}
