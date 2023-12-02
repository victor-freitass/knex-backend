module.exports = app => {

    const {deveExistir, naoDeveExistir } = app.config.validations

    async function saveAndUpdate (req, res) { 
        const category = req.body
        
        if (req.params.id) category.id = req.params.id  

        try {
            deveExistir(category.name, 'Informe o nome da cateogoria')
        } catch (msg) {
            return res.status(400).send(msg)
        }
        
        if (category.id) { 
            try {   
                const categoryFromDB = await app.db('categories')
                .where({id: category.id}) 
                deveExistir(categoryFromDB, 'Categoria não encontrada')

            } catch (msg) {
                return res.status(400).send(msg)
            }

                app.db('categories')
                .update(category)
                .where({id: category.id})
                .then(res.status(204).send())
            } else { 
                app.db('categories')
                .insert(category)
                .then(_=> res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }
    
    async function remove(req, res) {
        try {  
            const articlesFromDB = await app.db('articles')
                .where({ categoryId: req.params.id }).first() 
            naoDeveExistir(articlesFromDB, 'A categoria contém artigos')
            
            const subCategoriesFromDB = await app.db('categories')
            .where({ parentId: req.params.id }).first()
            naoDeveExistir(subCategoriesFromDB, 'A categoria tem possui sub-categorias')
           

        } catch (msg) {
            return res.status(400).send(msg)
        }

        app.db('categories')
            .del()
            .where({ id: req.params.id })
            .then(_ => res.status(204).send())
            .catch(err => res.status(500).send(err))
    }

    const get = (req, res) =>  app.db('categories')
        .then(categories => res.json(categories))
        .catch(err => res.status(500).send(err))

    const getById = (req, res) => app.db('categories')
        .where({id: req.params.id})
        .first()
        .then(c => res.json(c))
        .catch(err => res.status(500).send(err))
    
    return { saveAndUpdate, remove, get, getById }
}