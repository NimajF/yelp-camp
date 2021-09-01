//.env
if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}// if we are in development



const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
// const { campgroundSchema, reviewSchema } = require('./schemas.js')
const session = require('express-session');
const flash = require('connect-flash')
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
//connect-mongo cloud
const MongoStore = require('connect-mongo');


//Models
const Campground = require('./models/campground');
const Review = require('./models/review');
const User = require('./models/user');

//Routes
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const user = require('./routes/users')

//express-mongo-sanitize -  No SQL Mongo Injection
const mongoSanitize = require('express-mongo-sanitize');


const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

// 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl, { 
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false //Para que no salga el mensaje de deprecation
})
    .then(() => {
        console.log("Database Connected")
    })
    .catch(err => {
        console.log("Ups... Error!");
        console.log(err);
    }) // Chequear el nuevo metodo de Colt


const path = require('path');


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));// parse the req.body
app.use(methodOverride('_method'))//para delete or patch
app.use(express.static(path.join(__dirname, 'public')));//public dir
app.use(mongoSanitize());


const secret = process.env.SECRET || 'sicre';
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,//24hs
    crypto: {
        secret
    }
});
store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
});


const sessionConfig = {
    store, 
    name: 'Cookino',
    secret, 
    resave: false, 
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true
        expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))//Session va antes que passport.initialize y passport.session
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.session);
    res.locals.currentUser = req.user;//middleware.js currentUser es el nombre que le ponemos aca - req.user lo genera passport
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})// cualquier request

//Uses 
app.use('/', user);//No necesito prefijo de nada exactamente
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);



app.get('/fakeuser', async (req, res) => {
    const user = new User({email: 'teta@gmail.com', username: 'teta'})// passport genera username y password
    const reg = await User.register(user, 'teta123')//segundo parametro es password
    res.send(reg);
})

app.get('/', (req, res) => {
    res.render('home/home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => { //err aca es el err de arriba que paso como parametro
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh no, something went wrong';
    res.status(statusCode).render('error', { err });
    //res.send('awew');
})


app.listen(3000, () => {
    console.log('Running');
})