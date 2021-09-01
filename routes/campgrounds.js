const express = require('express');
const router = express.Router();

//Multer for image upload and Cloudinary
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage })


//errros
const catchAsync = require('../utilities/catchAsync');

//middleware
const { isLoggedIn, isAuthor, validateCampground} = require('../middleware');

//models
const Campground = require('../models/campground');
// const Review = require('../models/review');

//controllers - MVC
const campgrounds = require('../controllers/campgrounds');






router.get('/', catchAsync(campgrounds.index));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);//Tiene que ir /new antes por el orden, ya que si no no encuentra id

router.post('/', isLoggedIn, upload.array('image'), validateCampground,catchAsync(campgrounds.createCamp));
// router.post('/', upload.array('image'), (req, res) => {// 'image' es por el input name en new.ejs  / array o single
//     console.log(req.body, req.files);
//     res.send('Worked')
// })


router.get('/:id', catchAsync(campgrounds.showCamp));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

router.put('/:id', isLoggedIn, isAuthor, upload.array('image'),validateCampground, catchAsync(campgrounds.updateCamp));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCamp));

module.exports = router;