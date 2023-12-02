const admin = require('./admin')
module.exports = app => {

    app.post('/signin',app.api.auth.signin)
    app.post('/signup',app.api.user.save)

    app.route('/users')
    .all(app.config.passport.authenticate())
    .post(admin(app.api.user.save))     
    .get(admin(app.api.user.get))

    app.route('/users/admins')
        .all(app.config.passport.authenticate())
        .get(app.api.user.getAdmins)

    app.route('/users/deleted')
        .all(app.config.passport.authenticate())
        .get(app.api.user.deletedUsers)
        
    app.route('/users/:id')
        .all((app.config.passport.authenticate()))
        .put(admin(app.api.user.update))
        .get(admin(app.api.user.getById))
        .delete(admin(app.api.user.remove))
    
    app.route('/categories')
        .all(app.config.passport.authenticate())
        .get(admin(app.api.category.get))
        .post(admin(app.api.category.saveAndUpdate))

    app.route('/categories/:id')
        .all(app.config.passport.authenticate())
        .put(admin(app.api.category.saveAndUpdate))
        .delete(admin(app.api.category.remove))
        .get(app.api.category.getById)
        
    app.route('/articles')
        .all(app.config.passport.authenticate())
        .post(admin(app.api.article.saveAndUpdate))
        .get(admin(app.api.article.get))
        
    app.route('/articles/:id')
        .all(app.config.passport.authenticate())
        .put(admin(app.api.article.saveAndUpdate))
        .delete(admin(app.api.article.remove))
        .get(app.api.article.getById)

    app.route('/categories/:id/articles')
        .all(app.config.passport.authenticate())
        .get(app.api.article.getByCategory)
        
}