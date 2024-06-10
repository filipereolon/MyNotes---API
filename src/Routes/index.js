const { Router } = require('express')
const userRoutes = require('./user.routes')
const notesRoutes = require('./notes.routes')
const tagsRoutes = require('./tags.routes')
const sessionsRoutes = require('./sessions.routes')

const routes = Router() 

routes.use('/users', userRoutes)
routes.use('/sessions', sessionsRoutes)
routes.use('/notes', notesRoutes)
routes.use('/tags', tagsRoutes)

module.exports = routes