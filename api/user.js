const bcrypt = require('bcrypt')

module.exports = app => {

    const { deveExistir, naoDeveExistir, deveSerIgual } = app.config.validations

    const encryptPassword = password => {   
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    async function save(req, res) {  
        const user = req.body

        try {

            deveExistir(user.name, 'Insira o nome de usuário')
            deveExistir(user.email, 'Insira o email')
            deveExistir(user.password, 'Insira a senha')
            deveExistir(user.confirmPassword, 'Insira a confirmação de senha')
            const usuarioExiste = await app.db('users')
                .where({ email: user.email }).first()
            naoDeveExistir(usuarioExiste, 'Usuário já cadastrado')
            console.log(user.password, user.confirmPassword)

            deveSerIgual(user.password, user.confirmPassword, 'Senhas não conferem')

        } catch (msg) {
            return res.status(400).send(msg) 
        }
        
        delete user.confirmPassword
        user.password = encryptPassword(user.password) 

        app.db('users')
            .insert(user)
            .then(_ => res.status(204).send())
            .catch(err => res.status(500).send(err))
    }

    async function update(req, res) { 
        const user = req.body

        try {
            const userFromDB = await app.db('users')
                .where({ id: req.params.id })
                .whereNull('deletedAt')
                .first()
                
                deveExistir(userFromDB, 'Usuário não encontrado')
                
                let lastUpdateDate = await app.db('users')
                .select('updatedAt')
                .where({ id: req.params.id }).first()
                lastUpdateDate = parseInt(lastUpdateDate.updatedAt)

            if (lastUpdateDate) { 
                const now = new Date().getTime()
                if (now <= lastUpdateDate) {
                    throw "Só pode atualizar seu cadastro de 7 em 7 dias"


                }
            }

        } catch (msg) {
            return res.status(400).send(msg)
        }
        
        user.updatedAt = (new Date().getTime() + 604800000).toString() 
        app.db('users')
            .update(user)
            .where({ id: req.params.id })
            .then(_ => res.status(204).send())
            .catch(err => res.status(500).send(err))     
    }

    async function get(req, res) {
        app.db('users')
            .select('id', 'name', 'email', 'admin')
            .whereNull('deletedAt')
            .then(users => res.json(users))
            .catch(err => res.status(500).send(err))
    }

    async function getById(req, res) {
        try {
            const userFromDB = await app.db('users')
                .select('id', 'name', 'email', 'admin')
                .where({ id: req.params.id })
                .whereNull('deletedAt').first()
            deveExistir(userFromDB, 'Usuário não encontrado!')

            res.send(userFromDB)
        } catch(msg) {
            return res.status(400).send(msg)
        }   
    }

    async function getAdmins(req, res) { 
        await app.db('users')
        .select('id', 'name', 'email')
        .where({ admin: true })
        .whereNull('deletedAt')
        .then(admins => res.json(admins))
        .catch(err => res.status(500).send(err))
    }
    
    async function remove(req, res) {
        try {
            const rowsDeleted = await app.db('users')
                .update({deletedAt: new Date()})
                .where({id: req.params.id})
                .whereNull('deletedAt')
            deveExistir(rowsDeleted, 'Usuário não encontrado!')

            res.status(204).send()
        } catch (msg) {
            return res.status(400).send(msg)
        }
    }

    async function deletedUsers(req, res) { 

        app.db('users')
            .select('id', 'name', 'email', 'admin')
            .whereNotNull('deletedAt')
            .then(users => res.json(users))
            .catch(err => res.status(500).send(err))
    }
        
    return { save, update, get, getById, getAdmins, remove, deletedUsers }
}