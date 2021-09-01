const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: [true, "Please enter an Email"],
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose);//Passport se encarga de generar username y password

module.exports = mongoose.model('User', UserSchema);