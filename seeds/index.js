const mongoose = require('mongoose');
const Campground = require('../models/campground');// Chequear esto
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers')
mongoose.connect('mongodb://localhost:27017/yelp-camp', { 
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("Database Connected")
    })
    .catch(err => {
        console.log("Ups... Error!");
        console.log(err);
    }); // Chequear el nuevo metodo de Colt
  

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 30; i++){
        const random = Math.floor(Math.random() * 30);
        const ranPrice = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //USER ID
            author: '6125533bd781c923880c0c94',
            location: `${cities[random].city}, ${cities[random].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Hay cosas re piolas en la vida',
            price: ranPrice,
            geometry: {
                type: "Point",
                coordinates: [cities[random].longitude, cities[random].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dsscydgze/image/upload/v1630004812/YelpCamp/ph0hikvttifyuxgfp8aw.png',
                    filename: 'YelpCamp/ph0hikvttifyuxgfp8aw'
                  },
                  {
                    url: 'https://res.cloudinary.com/dsscydgze/image/upload/v1630004812/YelpCamp/bm8fkqlyayinolehra7x.png',
                    filename: 'YelpCamp/bm8fkqlyayinolehra7x'
                  }
              
            ]
        })
        await camp.save();
    }
}
seedDB().then(()=>{
    mongoose.connection.close();
})
