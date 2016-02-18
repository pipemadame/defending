'use strict';

var router = require('express').Router(),
	_ = require('lodash');

var HttpError = require('../../utils/HttpError');
var User = require('./user.model');

router.param('id', function (req, res, next, id) {
	User.findById(id).exec()
	.then(function (user) {
		if (!user) throw HttpError(404);
		req.requestedUser = user;
		next();
	})
	.then(null, next);
});

router.get('/', function (req, res, next) {
	User.find({}).exec()
	.then(function (users) {
		res.json(users.map(function (user) {
			return {
				_id: user._id,
				name: user.name,
				photo: user.photo,
				phone: user.phone,
				email: user.email,
				isAdmin: user.isAdmin
			};
		}));
	})
	.then(null, next);
});

router.post('/', function (req, res, next) {
	req.body.isAdmin = false;
	User.create(req.body)
	.then(function (user) {
		res.status(201).json(user);
	})
	.then(null, next);
});

router.get('/:id', function (req, res, next) {
	req.requestedUser.getStories()
	.then(function (stories) {
		var obj = req.requestedUser.toObject();
		obj.stories = stories;
		res.json({
			_id: obj._id,
			name: obj.name,
			photo: obj.photo,
			phone: obj.phone,
			email: obj.email,
			isAdmin: obj.isAdmin,
			stories: obj.stories
		});
	})
	.then(null, next);
});

router.put('/:id', function (req, res, next) {
	if (!req.user.isAdmin) {
		req.body.isAdmin === false;
	}
	if (req.user.isAdmin || (req.user._id === req.requestedUser._id)) {
		_.extend(req.requestedUser, req.body);
		req.requestedUser.save()
		.then(function (user) {
			res.json(user);
		})
		.then(null, next);
	} else {
		res.sendStatus(401);
	}
});

router.delete('/:id', function (req, res, next) {
	if (req.user.isAdmin || (req.user._id === req.requestedUser._id)) {
		req.requestedUser.remove()
		.then(function () {
			res.status(204).end();
		})
		.then(null, next);
	} else {
		res.sendStatus(401);
	}
});

module.exports = router;