const Campground = require('../models/campground');


const { cloudinary } = require('../cloudinary');

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({accessToken: mapBoxToken});




module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
};

module.exports.renderNewForm = (req, res) => {
    const foundCamp = Campground.findById(req.params.id);
    res.render('campgrounds/new', {foundCamp})
};

module.exports.createCamp = async (req, res, next) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1 //1 result
    }).send()//send the query after calling the function
    const campground = new Campground(req.body.campground);
    // if(!req.body.campground) throw new ExpressError('Invalid data', 400)
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', `Successfully created ${campground.title} Camp!`)
    res.redirect(`/campgrounds/${campground._id}`)
   
};

module.exports.showCamp = async (req, res) => {
    console.log(req.params)
    const foundCamp = await (await Campground.findById(req.params.id).populate({path:'reviews', populate: {path: 'author'}}).populate('author'));//populate({path:'reviews', populate: {path: 'author'}}) popula los autores de las REVIEWS
    console.log(foundCamp);
    if (!foundCamp){
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')// return asi no pasa al res.render del final
    }
    res.render('campgrounds/show', { foundCamp })
};

module.exports.renderEditForm = async (req, res)=>{
    const { id } = req.params;
    const foundCamp = await Campground.findById(id);
    res.render('campgrounds/edit', { foundCamp })
};

module.exports.updateCamp = async (req, res) => {
    const { id } = req.params;
    console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground })//spread the object (...)
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));// es un array de objetos
    campground.images.push(...imgs);// push() para no reemplazar las imagenes que ya estaban
    await campground.save();
    if(req.body.deleteImages){
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }//Pull from the images array all images where the filename of that image is in the req.body.deleteImages array and then we will await that.
    req.flash('success', `Successfully updated ${campground.title}!`)
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCamp = async (req, res)=>{
    const { id } = req.params; 
    const foundCamp = await Campground.findByIdAndDelete(id);
    req.flash('success', `Successfully deleted ${foundCamp.title}!`)
    res.redirect('/campgrounds');
    

};