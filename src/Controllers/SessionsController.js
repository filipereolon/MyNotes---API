const { compare } = require('bcryptjs')
const AppError = require('../Utils/AppError')
const knex = require('../Database/knex')
const authConfig = require('../configs/auth')
const { sign } = require('jsonwebtoken')

class SessionController {
  async create(req, res) {
    const { email, password } = req.body
    if (!email || !password) {
      throw new AppError('Missing parameters', 400)
    }
    
    const user = await knex('users').where({ email }).first()
    if (!user) {
      throw new AppError('Invalid user or email', 401)
    }

    const checkPassword = await compare(password, user.password)
    if (!checkPassword) {
      throw new AppError('Invalid user or email', 401)
    }

    const { secret, expiresIn } = authConfig.jwt
    const token = sign({}, secret, {
      subject: String(user.id),
      expiresIn,
    })
    return res.json({ user, token })
  }
}

module.exports = SessionController