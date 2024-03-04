const { ObjectId } = require('mongodb');
const {section, article, users, category, comments, db} = require('../model/model');

let sessions;
exports.addComment = function(req,res,next){
    sessions = req.session.userid;
    let userId;
    let articleId;
    try {
        userId = new ObjectId(sessions);
        articleId = new ObjectId(req.body.article);
    } catch (err) {
        articleId = req.body.article;
    }
    if(sessions){
        let comment = req.body.comment;
        let userImg;
        let userName;
        let dateNow = new Date().toUTCString().slice(5, -4);
        users.findOne({_id: userId}, (err, result)=>{
            if (err) throw err;
            userImg = result.img;
            userName = result.fullname;
            let insertComment = {
                userid: userId,
                articleid: articleId,
                username: userName,
                userimg: userImg,
                comment: comment,
                date: dateNow,
                articletitle: 'None Title'
            }
            article.findOne({_id: articleId}, (err, result)=>{
                if (err) throw err;
                if(!result){
                    res.status(404).json({articleErr: `${articleId} `})
                }else{
                    comments.insertOne(insertComment, (err, result)=>{
                        if (err) throw err;
                        let commentId = result.insertedId;
                        users.updateOne({_id: userId}, {$push: {comments: result.insertedId}}, (err, result)=>{
                            if (err) throw err;
                        })
                        article.findOneAndUpdate({_id: articleId}, {$push: {comments: result.insertedId}}, (err, result)=>{
                            if (err) throw err;
                            comments.findOneAndUpdate({_id: commentId},{$set: {articletitle: result.value.title}}, (err, result)=>{
                                if (err) throw err;
                                res.status(200).json(result.value)
                            })
                        })
                    })
                }
            })
        })
    }else{
        res.status(404).json({page: 'login'})
    }
}
exports.deleteComment = function(req, res, next){
    let commentId = req.params.commentid;
    let sessions = req.session.userid;
    let admin = req.session.admin;
    try{
        commentId = new ObjectId(commentId);
        sessions = new ObjectId(sessions);
    }catch(err){
        console.error(err);
    }
    comments.findOne({_id: commentId}, (err, result)=>{
        if(err) throw err;
        if(String(result.userId) === req.session.userid || admin){
            comments.findOneAndDelete({_id: commentId}, (err, result)=>{
                if (err) throw err;
                let articleId = result.value.articleid;
                let userId = result.value.userid;
                if(result.value != 0){
                    article.updateOne({_id: articleId},{$pull: {comments: commentId}}, (err, result)=>{
                        if(err) throw err;
                        console.log(result.modifiedCount);
                    });
                    users.updateOne({_id: userId}, {$pull: {comments: commentId}}, (err, result)=>{
                        if(err) throw err;
                        res.redirect(`/article/${articleId}`)
                    })
                }
            })
            
        }else{
            res.render('error');
        }
    })
    
}