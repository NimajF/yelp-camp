const { func } = require('joi');
const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/ar_4:3,c_crop');
})

const opts = { toJSON: { virtuals: true } };//Mongo by default doesnt include virtuals when you convert a document to JSON 


const CampgroundSchema = new Schema ({
    title: String,
    images: [ImageSchema],//array para que admita multiples imagenes
    geometry: {// Look at GeoJSON - MongoDB
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }

    },
    price: Number,
    description: String,
    location: String,
    author: {//tiene que referenciar
        type: Schema.Types.ObjectId, ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId, ref: 'Review'
        }
    ]
}, opts);


CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`;//THIS refers to the particular camp instance
})



CampgroundSchema.post('findOneAndDelete', async function (doc) { //Section 45 Deletion Mongoose Middleware - Lo que se elimina es pasado como parametro
    if(doc){ //si algo se encontro 
        await Review.deleteMany({
            _id: {
                $in: doc.reviews //lo que se encontro tiene reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);
