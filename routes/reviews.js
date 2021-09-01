const express = require('express');
const router = express.Router({ mergeParams: true });// asi tenemos acceso al ID de req.params

//errors
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError')

//middleware
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

//models
const Campground = require('../models/campground');
const Review = require('../models/review'); // necesitamos los 2 models

//controllers - MVC
const reviews = require('../controllers/reviews')


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;