'use strict';

var router = require('express').Router(),
	_ = require('lodash');

var HttpError = require('../../utils/HttpError');
var Story = require('./story.model');

router.param('id', function (req, res, next, id) {
	Story.findById(id).exec()
	.then(function (story) {
		if (!story) throw HttpError(404);
		req.story = story;
		next();
	})
	.then(null, next);
});

router.get('/', function (req, res, next) {
	Story.find({}).populate('author').exec()
	.then(function (stories) {
		res.json(stories);
	})
	.then(null, next);
});

router.post('/', function (req, res, next) {
	if (req.user) {
		if (req.user.isAdmin || (req.user._id === req.body.author._id)) {
			Story.create(req.body)
			.then(function (story) {
				return story.populateAsync('author');
			})
			.then(function (populated) {
				res.status(201).json(populated);
			})
			.then(null, next);
		} else {
			res.sendStatus(401);
		}
	} else {
		res.sendStatus(401);
	}
});

router.get('/:id', function (req, res, next) {
	req.story.populateAsync('author')
	.then(function (story) {
		res.json(story);
	})
	.then(null, next);
});

router.put('/:id', function (req, res, next) {
	if (req.user) {
		if (req.user.isAdmin || (req.user._id === req.body.author._id)) {
			_.extend(req.story, req.body);
			req.story.save()
			.then(function (story) {
				res.json(story);
			})
			.then(null, next);
		} else {
			res.sendStatus(401);
		}
	} else {
		res.sendStatus(401);
	}
});

router.delete('/:id', function (req, res, next) {
	if (req.user) {
		if (req.user.isAdmin || (req.user._id === req.body.author._id)) {
			req.story.remove()
			.then(function () {
				res.status(204).end();
			})
			.then(null, next);
		} else {
			res.sendStatus(401);
		}
	} else {
		res.sendStatus(401);
	}
});

module.exports = router;