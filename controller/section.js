const {section, article, users, category, db, comments} = require('../model/model');
const {ObjectId} = require('mongodb')

exports.addSection = function (req, res, next){
    const sectionName = req.body.section;
    const cateName = req.body.category;
    let {admin} = req.session;

    if(!admin){
        section.insertOne({name: sectionName, categories: []}, (err, res)=>{
            if (err) throw err;
            let idSection = res.insertedId;
            category.insertOne({name: cateName, section: idSection}, (err, res)=>{
                if (err) throw err;
                section.updateOne({_id:idSection}, {$push: {categories: res.insertedId}}, (err, res)=>{
                    if (err) throw err;
                });
            })
        })
        res.json({edit: '/dashboard/edit'})
    }else{
        res.render('error')
    }
}
exports.getSection = function (req, res, next){
    section.aggregate([
            { $lookup:
                {
                from: 'category',
                localField: 'categories',
                foreignField: '_id',
                as: 'category_all'
                }
            }
        ]).toArray((err, result)=>{
            if (err) throw err;
            let data;
            if(result.length == 0){
                data = null;
            }else{
                data = result;
            }
            
            res.locals.section = data;
            req.section = data;
            next();
        })
}


exports.deleteSection = (req, res, next)=>{
    let sectionId = req.params.sectionid;
    let admin = req.session.admin;
    try {
        sectionId = new ObjectId(sectionId);
    } catch (err) {
        console.error(err);
    }
    if(admin){
        section.findOneAndDelete({_id: sectionId}, (err, result)=>{
            if(err) throw err;
            if(result.value.categories != 0){
                let dataCate = result.value.categories
                category.deleteMany({_id: {$in: dataCate}}, (err, result)=>{
                    if(err) throw err;
                    article.aggregate([
                        {$match: {cateid: {$in: dataCate}}},
                        {$project: {'_id': 1}}
                    ]).toArray((err, result)=>{
                        if(err) throw err;
                        if(result.length != 0){
                            let dataArticle = [];
                            for (let i = 0; i < result.length; i++) {dataArticle.push(result[i]._id);}
                            article.deleteMany({_id: {$in: dataArticle}}, (err, result)=>{
                                if(err) throw err;
                            });
                            users.updateMany({}, {$pull: {articles: {$in: dataArticle}}}, (err, result)=>{
                                if(err) throw err;
                            })
                            comments.aggregate([
                                {$match: {articleid: {$in: dataArticle}}},
                                {$project: {'_id': 1}}
                            ]).toArray((err, result)=>{
                                if(err) throw err;
                                if(result.length != 0){
                                    let dataComment = [];
                                    for (let i = 0; i < result.length; i++) {dataComment.push(result[i]._id);};
                                    comments.deleteMany({_id: {$in: dataComment}}, (err, result)=>{
                                        if(err) throw err;
                                    });
                                    users.updateMany({}, {$pull: {comments: {$in: dataComment}}}, (err, result)=>{
                                        if(err) throw err;
                                    })
                                }
                            })

                        }
                    })
                });
            }else{
                res.render('error');
            }
        })
        res.redirect('/dashboard')
    }else{
        res.render('error')
    }
}