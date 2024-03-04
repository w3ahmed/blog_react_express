const { ObjectId } = require("mongodb");
const { users, category } = require("../../model/model");
exports.pagination = function(data, pageCount = 1, dataLimit = 12) {
    let startIndx = pageCount * dataLimit - dataLimit;
    let endIndx = startIndx + dataLimit;
    let articleAll = data.slice(startIndx, endIndx)
    let count = Math.ceil(data.length / dataLimit);
    return {data: articleAll, count: count, currentPage: Number(pageCount)};
}

exports.checkEmail = function(req, res, next){
    let email = req.body.email;
    users.findOne({email: email}, (err, result)=>{
        if(err) throw err;
        let checkEmail = result ? true : false
        res.locals.checkmail = checkEmail;
        req.checkmail = checkEmail;
        next();
    })
}
exports.checkCate = function(req, res, next){
    let cateId = req.body.category;
    try {
        cateId = new ObjectId(cateId);
    } catch (err) {
        res.locals.checkcate = false;
        req.checkCate = false;
    }
    category.findOne({_id:cateId}, (err, result)=>{
        if(err) throw err;
        let checkCate = result ? true : false;
        res.locals.checkCate = checkCate;
        req.checkCate = checkCate;
        next();
    })
}

exports.checkSession = function(req, res, next){
    let sessions = req.session
    if(sessions.userid){
        let dataSession = {userid: sessions.userid, img: sessions.img}
        res.locals.datasession = dataSession;
        req.datasession = dataSession;
    }else{
        res.locals.datasession = null;
        req.datasession = null;
    }
    next();
}