const express = require('express');
const router = express.Router();
const { comparePolicies } = require('../controllers/compareController');
const { protect } = require('../middleware/auth');

router.post('/', protect, comparePolicies);

module.exports = router;





