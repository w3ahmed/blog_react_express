const { ObjectId } = require('mongodb');
const {section, article, users, comments, category, db} = require('../model/model');
const bcrypt = require('bcrypt')
exports.addUser = async function(req, res, next){
    let img = req.body.gender === 'male' ? 'male.png' : 'female.png';
    let field = req.body;
    let salt = await bcrypt.genSalt(10);
    let passwordHash = await bcrypt.hash(field.password, salt);
    let dateNow = new Date().toUTCString().slice(5, -13);
    let fullname = `${field.fname} ${field.lname}`
    let insertUser = {
        fname : field.fname,
        lname : field.lname,
        fullname: fullname,
        job : field.job,
        email : field.email,
        password : passwordHash,
        gender : field.gender,
        admin: false,
        status: true,
        date: dateNow,
        img: img,
        articles: [],
        comments: []
    } ;

    users.insertOne(insertUser, (err, result)=>{
        if(err) throw err;
        req.session.userid = result.insertedId
        req.session.img = img;
        
        res.json({profile:`/profile/${result.insertedId}`})
    })

}

exports.loginUser = async function(req, res, next){
    if(!req.session.userid){
        let email = req.body.email;
        let password = req.body.password;
        let user = await users.findOne({email: email});
        if(user){
            let checkPass = await bcrypt.compare(password, user.password);
            if(checkPass){
                req.session.userid = user._id
                req.session.admin = user.admin
                req.session.img = user.img;
                res.json({done: '/'})
            }else{
                res.status(400).json({errors: [{param: 'password', msg: 'Password Is Wrong'}]})
            }
        }else{
            res.status(400).json({errors: [{param: 'email', msg: 'Email Is Wrong'}]})
        }
    }else{
        res.redirect('/')
    }
}
exports.getUser = function(req, res, next){
    let userId = req.params.user;
    if(userId){
        try {
            userId = new ObjectId(userId);
        } catch (err) {
            console.error(err);
        }
    }
    let query = userId ? {_id: userId} : {};

    let pipeline = userId ? [
            {$match: query},
            { $lookup:{ from: "article", localField: "articles", foreignField: "_id", as: "articleAll"}},
            {$lookup:{ from: "comments", localField: "comments", foreignField: "_id", as: "comments"}},
        ] : [{$match: query}]
    users.aggregate(pipeline).toArray((err, result)=>{
        if(err) throw err;
        let data = result ;
        if(data.length){
            res.locals.user = data;
            req.user = data;
            next();
        }else{
            res.status(404).send('This User is not Found')
        }
    })
}

exports.deleteUser = function(req, res, next){
    let userid = req.params.userid;
    let sessions = req.session.userid;
    let admin = req.session.admin;
    try {
        userid = new ObjectId(userid);
        sessions = new ObjectId(sessions);
    } catch (err) {
        console.error(err);
    }
    if(req.session.userid === req.params.userid || admin){
        users.findOneAndDelete({_id: userid}, (err, result)=>{
            if(err) throw err;
            if(result.value){
                let articleUser = result.value.articles;
                let commentUser = result.value.comments;
                // destroy session user
                if(req.session.userid === req.params.userid){
                    req.session.userid = null;
                    req.session.admin = null;
                };

                article.deleteMany({_id: {$in: articleUser}}, (err, result)=>{
                    if(err) throw err;
                });
                comments.aggregate([
                    {$match: {articleid: {$in: articleUser}}},
                    {$project: {'_id': 1}}
                ]).toArray((err, result)=>{
                    if(err) throw err;
                    console.log(result);
                    if(result.length != 0){
                        let data = [];
                        for (let i = 0; i < result.length; i++) {data.push(result[i]._id);}
                        users.updateMany({}, {$pull: {comments: {$in: data}}}, (err, result)=>{
                            if(err) throw err;
                        })
                    }
                    comments.deleteMany({_id: {$in: commentUser}}, (err, result)=>{
                        if(err) throw err;
                    })
                    comments.deleteMany({articleid: {$in: articleUser}}, (err, result)=>{
                        if(err) throw err;
                        res.redirect('/dashboard/users')
                    })
                })
                
            }
        })
    }else{
        res.send('error')
    }
}