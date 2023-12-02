const {authSecret} = require('../.env')
const bcrypt = require('bcrypt')
const jwt = require('jwt-simple')

module.exports = app => {
    const { deveExistir } = app.config.validations
    
    async function signin (req, res) {
        if(!req.body.email || !req.body.password) {
            return res.status(400).send('Informe email e senha')
        }

        const user = await app.db('users')
            .where({email: req.body.email}).first()
        if(!user) return res.status(400).send('O usuário não existe')   

        const verificarSenha = bcrypt.compareSync(req.body.password, user.password)
        if(!verificarSenha) return res.status(401).send('Email/Senha inválidos!')

        const now = Math.floor(Date.now() / 1000) 

        const payload = {                                
            id: user.id,
            name: user.name,
            email: user.email,
            admin: user.admin,
            iat: now,
            exp: now + (60 * 60 * 24 * 3)             
        }

        res.json({                  
            ...payload,
            token: jwt.encode(payload, authSecret)
        })
    }

    return { signin }
}