var express = require('express');
var router = express.Router();
const {getUser} = require('../controller/users')
const {getSection} = require('../controller/section');
const {getArticle} = require('../controller/article');
const { pagination, checkSession } = require('../controller/helper/helper');


router.get('/', getArticle, (req, res)=>{
  let {userid} = req.session;
  let dataarticles = pagination(req.article, req.query.page) 
  res.render('index', {title: 'My Blog', session: userid, dataarticles: dataarticles})
});
router.get('/category/:articles', getArticle, (req, res)=>{
  sessions = req.session.userid;
  let dataarticles = pagination(req.article, req.query.page)
  if(req.article[0]){
    res.render('index', {title: req.article[0].catename, session: sessions , dataarticles: dataarticles})
  }else{
    res.render('error')
  }
});
router.get('/article/:article',getArticle, (req, res)=>{
  sessions = req.session.userid;
  if(req.article[0]){
    res.render('article', {title: req.article[0].title, session: sessions, dataarticle: req.article[0]})
  }else{
    res.render('error')
  }
})
router.get('/addarticle', (req, res)=>{
  sessions = req.session.userid;
  if(sessions){
    res.render('addarticle', {title: 'Create Article'})
  }else{
    res.redirect('/login')
  }
})
router.get('/profile/:user', (req, res)=>{
    res.render('profile')
})
router.get(['/login', '/register'], (req, res)=>{
  sessions = req.session.userid;
  if(sessions){
    res.redirect('/')
  }else{
    res.render('login')
  }
});

// Session Destroied
router.get('/logout' ,(req, res)=>{req.session.destroy(); res.redirect('/');});

router.get(['/dashboard', '/dashboard/articles', '/dashboard/users', '/dashboard/edit'], (req, res, next)=>{
  res.render('dashboard');
})

// Call API
router.get('/api/session', checkSession , (req, res)=>{
  res.json(req.datasession)  
});
router.get('/api/article', getArticle, (req, res, next)=>{res.json(req.article);})
router.get('/api/section', getSection, (req, res, next)=>{res.json(req.section);})
router.get('/api/user', getUser, (req, res, next)=>{res.json(req.user);})
router.get('/api/user/:user', getUser, (req, res, next)=>{res.json(req.user);})

module.exports = router;