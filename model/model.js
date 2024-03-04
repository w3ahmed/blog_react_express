require('dotenv').config()
const {MongoClient} = require('mongodb');
const url = process.env.CULSTER_URL
const client = new MongoClient(url);
const dbname = 'react-blog';
const db = client.db(dbname);

exports.db = client
exports.section = db.collection('section');
exports.category = db.collection('category');
exports.article = db.collection('article');
exports.users = db.collection('users');
exports.comments = db.collection('comments');

