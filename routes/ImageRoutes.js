const image = require('../controllers/ImageController');
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

router.post('/', image.uploadImage);
router.post('/delete/:imageKey', image.deleteImage);

module.exports = router;