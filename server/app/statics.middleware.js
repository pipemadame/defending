'use strict';

var express = require('express'),
	router = express.Router(),
	path = require('path');


var publicPath = path.join(__dirname, 'public');

router.use('/browser', express.static('browser'));
router.use('/bower_components', express.static('bower_components'));
router.use(express.static('public'));

module.exports = router;