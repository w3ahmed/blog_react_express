const {section, article, users, category, comments} = require('../model/model');
const {ObjectId} = require('mongodb')

exports.addCategory = function(req, res, next){
    let idSection = ObjectId(req.body.sectionall) 
    let cateName = req.body.categorynew;
    let admin = req.session.admin;
    if(admin){

        section.findOne({_id: idSection}, (err, result)=>{
            if (err) throw err;
            let idSection = result._id;
            category.insertOne({name: cateName, section: idSection}, (err, result)=>{
                if (err) throw err;
                let idCate = result.insertedId
                section.findOneAndUpdate({_id: idSection},{$push: {categories: idCate}}, (err, result)=>{
                    if(err) throw err;
                })
            })
        })
        res.json({edit: '/dashboard/edit'})
    }
}


exports.deleteCategory = (req, res, next)=>{
    let cateId = req.params.cateid;
    let sessions = req.session.userid;
    let admin = req.session.admin;
    try {
        cateId = new ObjectId(cateId);
        sessions = new ObjectId(sessions);
    } catch (err) {
        console.error(err);
    }
    if(admin && sessions){
        section.updateOne({categories: cateId}, {$pull: {categories: cateId}}, (err, result)=>{
            if(err) throw err;
            category.deleteOne({_id: cateId}, (err, result)=>{
                if(err) throw err;
                article.aggregate([
                    {$match: {cateid: cateId}},
                    {$project: {'_id': 1}}
                ]).toArray((err, result)=>{
                    if(err) throw err;
                    if(result.length != 0){
                        let dataArticle = [];
                        for (let i = 0; i < result.length; i++) {dataArticle.push(result[i]._id);}
                        article.deleteMany({_id: {$in: dataArticle}}, (err, result)=>{
                            if(err) throw err;
                        })
                        comments.aggregate([
                            {$match: {articleid: {$in: dataArticle}}},
                            {$project: {'_id': 1}}
                        ]).toArray((err, result)=>{
                            if(result.length != 0){
                                let dataComment = [];
                                for (let i = 0; i < result.length; i++) {dataComment.push(result[i]._id);}
                                comments.deleteMany({_id: {$in: dataComment}}, (err, result)=>{
                                    if(err) throw err;
                                })
                                users.updateMany({}, {$pull: {comments: {$in: dataComment}}});
                                users.updateMany({}, {$pull: {articles: {$in: dataArticle}}});
                                res.redirect('/')
                            }
                        })
                        
                    }
    
                })
            })
        })
    }else{
        res.render('error')
    }
}