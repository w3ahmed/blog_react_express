const { ObjectId } = require('mongodb');
const {section, article, users, category, db, comments} = require('../model/model');


let sessions;
exports.addArticle = function(req, res, next){
    sessions = req.session.userid;
    let author = new ObjectId(sessions);
    let cateid = new ObjectId(req.body.category);
    let catename;
    let dateNow = new Date().toUTCString().slice(5, -4);
    if(sessions){
        category.findOne({_id: cateid}, (err, result)=>{
            if (err) throw err;
            catename = result.name;
            let insertArticle = {
                date: dateNow,
                cateid: cateid,
                catename: catename,
                title: req.body.title,
                img: req.file.filename,
                content: req.body.content,
                author: author,
                comments: [],
            }
            article.insertOne(insertArticle, (err, result)=>{
                if(err) throw err;
                users.findOneAndUpdate({_id: author}, {$push: {articles: result.insertedId}}, (err, result)=>{
                    if (err) throw err;
                })
                res.json({article:`/article/${result.insertedId}`})
            })
        })
    }else{
        res.status(404).json({home: '/login'})
    }
}

exports.getArticle = function(req,res, next){
    let articleParam  = req.params.article;
    let cateParam = req.params.articles;
    try {
        articleParam = articleParam ? new ObjectId(articleParam):null;
        cateParam = cateParam ? new ObjectId(cateParam):null
    } catch (err) {console.log(err);}

    let query;

    if(articleParam || cateParam){
        query = articleParam ? {_id: articleParam} : {cateid: cateParam}
    }else{ query = {} }

    article.aggregate([
        {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "author"}},
        {$lookup: {from: "comments", localField: "comments", foreignField: "_id", as: "comments"}},
        {$unwind: '$author'},
        {$match: query}
    ]).toArray((err, result)=>{
        if (err) throw err;
        let data = result;
        if(data){
            res.locals.article = data;
            req.article = data;
            next()
        }
    })
}

exports.deleteArticle = function(req, res, next){
    let articleid = req.params.articleid;
    let sessions = req.session.userid;
    let admin = req.session.admin;
    if(articleid && sessions){
        try {
            articleid = new ObjectId(articleid);
            sessions = new ObjectId(sessions)
        } catch (err) {
            console.error(err);
        }
    }
    article.findOne({_id: articleid}, (err, result)=>{
        if(err) throw err;
        if(result){
            let authorAricle = String(result.author)
            if(authorAricle === req.session.userid || admin){
                article.deleteOne({_id: articleid}, (err, result)=>{
                    if(err) throw err;
                    comments.aggregate([
                        {$match: {articleid: articleid}}, 
                        {$project: {'_id': 1}}
                    ]).toArray((err, result)=>{
                        if(err) throw err;
                        if(result.length != 0){
                            let data = [];
                            for (let i = 0; i < result.length; i++) {data.push(result[i]._id);}
                            comments.deleteMany({_id:{$in: data}}, (err, result)=>{
                                if(err) throw err;
                            })
                            users.updateMany({}, {$pull: {comments: {$in: data}}}, (err, result)=>{
                                if(err) throw err;
                            })
                        }
                    })
                    users.updateOne({_id: new ObjectId(authorAricle)}, {$pull: {articles: articleid}}, (err, result)=>{
                        if(err) throw err;
                        res.redirect('/dashboard/articles')
                    });
                })
            }else{
                res.send('error')
            }
        }else{
            res.send('no result')
        }
    })
}