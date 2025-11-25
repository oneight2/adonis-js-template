import vine from '@vinejs/vine'

export const createRoleValidator = vine.compile(
  vine.object({
    data: vine.object({
      name: vine.string(),
      code: vine.string(),
    }),
  })
)

export const updateRoleValidator = vine.compile(
  vine.object({
    data: vine.object({
      name: vine.string().optional(),
      code: vine.string().optional(),
    }),
  })
)
