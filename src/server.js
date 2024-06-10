require('dotenv').config()
require('express-async-errors')

const migrationsRun = require('./Database/Sqlite/Migrations')
const uploadConfig = require('./configs/upload')
const express = require('express')
const routes = require('./Routes')
const AppError = require('./Utils/AppError')
const app = express()
const cors = require('cors')

app.use(express.json())
app.use(cors())
app.use('/files', express.static(uploadConfig.UPLOAD_FOLDER))
app.use(routes)
migrationsRun()

app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    })
  }
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  })
})

const PORT = process.env.PORT || 3333
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
