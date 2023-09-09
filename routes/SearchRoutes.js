const express = require('express');
const router = express.Router();
const searchController = require('../controllers/SearchController');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

router.get('/', searchController.searchData);

module.exports = router;