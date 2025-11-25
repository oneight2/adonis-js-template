import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    data: vine.object({
      name: vine.string(),
      email: vine.string(),
      username: vine.string(),
      nik: vine.string(),
      npk: vine.string(),
      department_id: vine.string(),
      position_id: vine.string(),
      division_id: vine.string(),
    }),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    data: vine.object({
      name: vine.string().optional(),
      email: vine.string().optional(),
      username: vine.string().optional(),
      nik: vine.string().optional(),
      npk: vine.string().optional(),
      department_id: vine.string().optional(),
      position_id: vine.string().optional(),
      division_id: vine.string().optional(),
    }),
  })
)
