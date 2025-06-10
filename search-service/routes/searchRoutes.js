const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get('/questions', searchController.searchQuestions);
router.get('/answers', searchController.searchAnswers);
router.get('/doctors', searchController.searchDoctors);
router.get('/articles', searchController.searchArticles);
router.get('/suggestions', searchController.searchSuggestions);

module.exports = router;
