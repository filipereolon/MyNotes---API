const { hash, compare } = require('bcryptjs')
const AppError = require('../Utils/AppError')
const sqliteConnection = require('../Database/Sqlite')
const knex = require('../Database/knex')
const DiskStorage = require('../providers/DiskStorage')

class UsersController {
  async create(req, res) {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      throw new AppError('Missing parameters', 400)
    }
    const database = await sqliteConnection()
    const checkUserExists = await database.get('SELECT * FROM users WHERE email = ?', email)
    if (checkUserExists) {
      throw new AppError('User already exists', 400)
    }
    const hashedPassword = await hash(password, 8)
    await database.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword])
    return res.status(201).json({ message: 'User created' })
    
  }
  async update(req, res) {
    const { name, email, newPassword, currentPassword } = req.body
    const user_id = req.user.id
    const database = await sqliteConnection()
    
    const user = await database.get('SELECT * FROM users WHERE id = ?', user_id)
  
    if (!user) {
      throw new AppError('User not found', 404)
    }
    const checkUpdatedEmailExists = await database.get('SELECT * FROM users WHERE email = ? AND id != ?', email, user_id)
    if (checkUpdatedEmailExists) {
      throw new AppError('Email already exists', 400)
    }
    if (newPassword && !currentPassword) {
      throw new AppError('Current password is required', 400)
    }
    if (currentPassword && newPassword) {
      const checkPassword = await compare(currentPassword, user.password)
      if (!checkPassword) {
        throw new AppError('Invalid password', 400)
      }
      user.password = await hash(newPassword, 8)
    }
    await knex('users').where({ id: user_id }).update({ name, email, password: user.password, updated_at: new Date()})
    return res.status(201).json({ message: 'Password updated' })
  }

  async updateAvatar(req, res) {
    const avatarFilename= req.file.filename
    const user_id = req.user.id
    const diskStorage = new DiskStorage()
    const user = await knex('users').where({ id: user_id }).first()
    if (!user) {
      throw new AppError('User not found', 404)
    }
    if (user.avatar) {
      await diskStorage.deleteFile(user.avatar)
    }
    const filename = await diskStorage.saveFile(avatarFilename)
    user.avatar = filename
    await knex('users').where({ id: user_id }).update({ avatar: filename })
    return res.status(201).json({ avatar: filename })
  }
}

module.exports = UsersController