const app = require('express')()
const consign = require('consign')
const db = require('./config/db.js')

app.db = db

consign()
    .include('./config/passport.js')
    .then('./config/middlewares.js')
    .then('./config/validations.js')
    .then('./api')
    .then('./config/routes.js')
    .into(app)

app.listen(8080, () => console.log('Backend executando na porta 8080'))