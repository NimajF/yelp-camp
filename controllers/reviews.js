const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async(req, res) => {
    console.log(req.params);
    const { id } = req.params;
    const foundCamp = await Campground.findById(id); 
    const review = new Review(req.body.review)// la key review que esta en show.ejs por ejemplo review[rating]
    review.author = req.user._id;
    console.log('req.user', req.user);
    console.log('req.user._id', req.user._id);
    foundCamp.reviews.push(review);
    await review.save();
    await foundCamp.save();
    req.flash('success', `Successfully sent review!`)
    res.redirect(`/campgrounds/${foundCamp._id}`);
};

module.exports.deleteReview = async(req, res) => {
    console.log(req.params)
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});// Search $pull
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', `Successfully deleted review!`)
    res.redirect(`/campgrounds/${id}`)
};



