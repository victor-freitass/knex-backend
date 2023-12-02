const queries  = require('./queries')

module.exports = app => {
    
    const {deveExistir} = app.config.validations

    const saveAndUpdate = (req, res) => {
        const article = req.body
        if (req.params.id) article.id = req.params.id   

        try {
            deveExistir(article.name, 'Insira o nome do artigo');
            deveExistir(article.description, 'Insira a descrição do artigo');
            deveExistir(article.imageUrl, 'Insira a imagem do artigo');
            deveExistir(article.content, 'Insira o conteúdo do artigo');
            deveExistir(article.userId, 'Insira o id do usuário');
            deveExistir(article.categoryId, 'Insira a categoria que o artigo pertence');
        } catch (error) {
            console.error('Erro:', error);
            return res.status(400).send(error.message || 'Erro genérico');
        }        

        if (article.id) {   //se for update
            app.db('articles')
                .update(article)
                .where({id: req.params.id})
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
            } else {    //se for insert
                app.db('articles')
                .insert(article)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
            }
        }
        
    const remove = async (req, res) => {
        try {
            const article = await app.db('articles')
                .where({ id: req.params.id })
            deveExistir(article, 'O artigo não existe')
        } catch (msg) {
            return res.status(400).send(msg)
        }
        
        app.db('articles')
        .del()
        .where({id: req.params.id})
        .then(_ => res.status(204).send())
        .catch(err => res.status(500).send(err))
    }

    const get = async (req, res) => { 
        const limit = 10
        const page = req.query.params || 1 

        const articles = await app.db('articles').count('id').first()
        const count = parseInt(articles.count)

        app.db('articles')
            .limit(limit).offset(page * limit - limit)
            .then(articles => res.json({data: articles, totalArticlesFromDB: count, 
                limitPag: limit, actualPag: page}))
            .catch(err => res.status(500).send(err))
    }

    const getById = async (req, res) => {   
        try {
            const articleFromDB = await app.db('articles')
                .where({id: req.params.id}).first()
            deveExistir(articleFromDB, 'Artigo não encontrado')
            articleFromDB.content = articleFromDB.content.toString()
            res.json(articleFromDB)
        } catch (msg) {
            return res.status(400).send(msg)
        }
    }

    const getByCategory = async (req, res) => { 
        const limit = 10

        const categoryId = req.params.id 
        const page = req.query.page || 1
        const categories = await app.db.raw(queries.categoryWithChildren, categoryId) 
        const ids = categories.rows.map(c => c.id) 

        app.db({a: 'articles', u: 'users'})
        .select('a.id', 'a.name', 'a.description', 'a.imageUrl', { author: 'u.name' })
        .limit(limit).offset(page * limit - limit)
        .whereRaw('?? = ??', ['u.id', 'a.userId'])
        .whereIn('categoryId', ids)
        .orderBy('a.id', 'desc')
        .then(articles => res.json(articles))
        .catch(error => res.status(500).send(error))

    }

    return { saveAndUpdate, remove, getById, get, getByCategory }
}