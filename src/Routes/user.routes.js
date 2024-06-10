const { Router } = require('express')
const UsersController = require('../Controllers/UsersController')
const ensureAuthenticated = require('../middlewares/ensureAuthenticated')
const multer = require('multer')
const uploadConfig = require('../configs/upload')

const userRoutes = Router()
const usersController = new UsersController()
const upload = multer(uploadConfig.MULTER)

userRoutes.post('/', usersController.create)
userRoutes.put('/', ensureAuthenticated, usersController.update)
userRoutes.patch('/avatar', ensureAuthenticated, upload.single('avatar'), usersController.updateAvatar)

module.exports = userRoutes