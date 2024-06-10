const knex = require('../Database/knex')

class TagsController {
  async index(req, res) {
    const user_id = req.user.id
    const tags = await knex('tags').distinct('name').where({ user_id }).orderBy('name')

    return res.status(200).json(tags)
  }
}

module.exports = TagsController