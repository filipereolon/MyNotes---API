const sqliteConnection = require('..')
const createUsers = require('./createUsers')

async function migrationRun() {
  const schemas = [createUsers].join('')

  sqliteConnection().then(db => db.exec(schemas)).catch(console.error)
}

module.exports = migrationRun