var express = require('express');
var router = express.Router();
const {deleteUser} = require('../controller/users')
const {deleteArticle} = require('../controller/article');
const {deleteComment} = require('../controller/comments');
const { deleteCategory } = require('../controller/category');
const { deleteSection } = require('../controller/section');


router.get('/delete/article/:articleid', deleteArticle)
router.get('/delete/user/:userid', deleteUser)
router.get('/delete/comment/:commentid', deleteComment)
router.get('/delete/category/:cateid', deleteCategory)
router.get('/delete/section/:sectionid', deleteSection)


module.exports = router;