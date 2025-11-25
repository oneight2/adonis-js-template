/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const UserController = () => import('#controllers/user_controller')

const RoleController = () => import('#controllers/role_controller')

router.get('/', async () => {
  return {
    hello: 'Backend API',
  }
})
// CRUD User
router
  .group(() => {
    router.get('/', [UserController, 'index'])
    router.get('/:id', [UserController, 'show'])
    router.post('/', [UserController, 'store'])
    router.put('/:id', [UserController, 'update'])
    router.delete('/:id', [UserController, 'destroy'])
  })
  .prefix('users')
// CRUD Role
router
  .group(() => {
    router.get('/', [RoleController, 'index'])
    router.get('/:id', [RoleController, 'show'])
    router.post('/', [RoleController, 'store'])
    router.put('/:id', [RoleController, 'update'])
    router.delete('/:id', [RoleController, 'destroy'])
  })
  .prefix('roles')
