function admin (middleware) {
    return (req, res, next) => {
        if (req.user.admin) {
            middleware(req, res, next)
        } else {
            res.status(402).send('O usuário não é Administrador!')
        }
    }
}

module.exports = admin