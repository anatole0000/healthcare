const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

router.get('/combined', questionController.getCombinedQuestions);
router.get('/combined/search', questionController.searchCombinedQuestions);

router.post('/', questionController.createQuestion);
router.get('/', questionController.getAllQuestions);
router.get('/:id', questionController.getQuestionDetail);

module.exports = router;
