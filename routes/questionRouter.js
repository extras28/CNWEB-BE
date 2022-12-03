const express = require('express');
const questionController = require('../controllers/questionController');
const router = express.Router();

// create question
router.post('/api/v1/question/create', questionController.createQuestion);

// get question 
router.get('/api/v1/question/find', questionController.find)

module.exports = router;
