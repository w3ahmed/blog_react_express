var express = require('express');
var router = express.Router();
const {addSection} = require('../controller/section')
const {addCategory} = require('../controller/category')
const {addUser, loginUser} = require('../controller/users')
const { addArticle} = require('../controller/article');
const { addComment} = require('../controller/comments');
const {checkEmail, checkCate} = require('../controller/helper/helper')
const {body, validationResult} = require('express-validator')
const multer = require('multer');
const imgType = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
]
const multerStorage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, "public/images");
  },
  filename: (req, file, cb)=>{
    const ext = file.mimetype.split('/')[1];
    let random = Math.floor(Math.random() * 1000)
    const nameFile = Date.now()
    cb(null, `${nameFile}${random}.${ext}`)
  }
})

const upload = multer({
  storage: multerStorage,
  limits: {fileSize:1000000, files: 1},
  fileFilter: (req, file, cb) => {
    if(!imgType.includes(file.mimetype)) {
      return cb(new Error('Image Should png, jpeg, jpg, webp'), false)
    }
    cb(null, true)
  }
});

let checkErrMulter = (req, res, next)=>{
    upload.single('boster')(req, res, err => {
      if(err){
        switch(err.code){
          case "LIMIT_FILE_SIZE":
            err.message = "Size More Than 1MB"
            break;
          case "LIMIT_FILE_COUNT":
            err.message = "Allowed 1 File Only"
          default:
            err.message = err.message;
        }
        res.status(400).json({errors: [{param: 'boster', msg: err.message}]})
      }else{
        if(!req.file){
          res.status(400).json({errors: [{param: 'boster', msg: 'Upload File Is Require'}]})
        }else{
          next();
        } 
      }
    })
}

router.post('/addpost',checkErrMulter,checkCate,
body('category').trim().escape().custom((val, {req})=>{
  if(req.checkCate){
    return true;
  }else{
    throw new Error('Not Found This Category')
  }
}),
body('title', 'leave single whitespace only between words').trim().escape().matches(/^\S+(?: \S+)*$/),
body('content', 'min length 50 a litter').isLength({min: 50}).trim(),
(req, res, next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()})
  }else{
    next()
  }
}
,addArticle)

router.post('/signin',
body('email', 'Email is wrong').isEmail().normalizeEmail().trim().escape(),
body('password', 'Password is wrong').isLength({min: 1}).trim().escape(),
(req, res, next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.status(400).json({errors: errors.array()});
  }else{
    next();
  }
}
,loginUser)


router.post('/addsection',
body('section', 'This Field is Required').isLength({min: 1}).trim().escape(),
body('category', 'This Field is Required').isLength({min: 1}).trim().escape(),
(req, res, next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()});
  }else{
    next();
  }
},
addSection)

router.post('/addcategory',
body('sectionall', 'This Field is Required').isLength({min: 1}).trim().escape(),
body('categorynew', 'This Field is Required').isLength({min: 1}).trim().escape(),
(req, res, next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()});
  }else{
    next();
  }
}, addCategory)



router.post('/adduser',checkEmail,
body('fname', 'Must be litter only to 10 litter').isLength({max: 10}).notEmpty().trim().escape().matches(/^[A-Za-z]+$/g),
body('lname', 'Must be litter only to 10 litter').isLength({max: 10}).notEmpty().trim().escape().matches(/^[A-Za-z]+$/g),
body('job', 'Must be litter only from 5 to 20 litter').isLength({min: 5, max: 20}).trim().escape().matches(/^([A-Za-z]+\s)*[A-Za-z]+$/g),
body('email').isEmail().normalizeEmail().trim().escape()
.custom((val, {req})=>{
    if (req.checkmail) {
      throw new Error('Email already is used')
    } else {
      return true;
    }
}),
body('password', 'Must be More 10 character').isLength({min: 10}).trim().escape(),
body('repassword').custom((val, {req})=>{
  if(val !== req.body.password){
    throw new Error('Password confirmation does not match password')
  }else{
    return true;
  }
}),
body('gender', 'error gender').isIn(['male', 'female']),
(req, res, next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()})
  }else{
    next();
  }
}, addUser)




router.post('/addcomment', 
body('comment', 'must be more than 5 char').isLength({min: 5}).trim().escape()
,(req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({errors: errors.array()})
    }else{
      next()
    }
}, addComment)


module.exports = router;