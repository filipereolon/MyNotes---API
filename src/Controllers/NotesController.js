const knex = require('../Database/knex')
const AppError = require('../Utils/AppError')

class NotesController {
	async create(req, res) {
		const { title, description, tags, links } = req.body
		const user_id = req.user.id

		if (!title || !description || !tags || !links) {
			throw new AppError('Missing parameters', 400)
		}
		const [user] = await knex('users').where({ id: user_id })
		if (!user) {
			throw new AppError('User not found', 400)
		}

		const [note_id] = await knex('notes').insert({ title, description, user_id })

		const linksInsert = links.map(link => {
			return {
				url: link,
				note_id,
			}
		})
		const tagsInsert = tags.map(name => {
			return {
				name,
				user_id,
				note_id,
			}
		})

		await knex('links').insert(linksInsert)
		await knex('tags').insert(tagsInsert)

		return res.json()
	}

	async show(req, res) {
    const id = req.params.id
		const user_id = req.user.id
		const note = await knex('notes').where({ user_id }).first()
		const tags = await knex('tags').where({ note_id: id }).orderBy('name')
		const links = await knex('links').where({ note_id: id }).orderBy('url')
		return res.json({
			...note,
			tags,
			links,
		})
	}

	async delete(req, res) {
		const id = req.params.id
		await knex('notes').where({ id }).delete()
		return res.json()
	}

	async index(req, res) {
		const user_id = req.user.id
		let notes = await knex('notes').where({ user_id }).orderBy('title')

		const userTags = await knex('tags').where({ user_id })
		const notesWithTags = notes.map(note => {
			const noteTags = userTags.filter(tag => tag.note_id === note.id)
			return {
				...note,
				tags: noteTags,
			}
		})
		return res.status(200).json(notesWithTags)
	}
}

module.exports = NotesController
