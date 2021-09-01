const User = require('../models/user');


module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async(req, res) => {
    try {
        const { email, username, password } = req.body;
        const newUser = new User({email, username});
        const regUser = await User.register(newUser, password);
        req.login(regUser, err => {//Metodo de passport para quedar logeado desp del register
            if(err){
                return next(err);
            } else {
                req.flash('success', `Welcome ${username}!`)
                res.redirect('/campgrounds')
            }
        });
        
    } catch(e){    
        req.flash('error', e.message);
        res.redirect('/register')
    }
    // console.log(regUser);
    
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
};

module.exports.login = (req, res) => {
    const { username } = req.body;
    req.flash('success', `Welcome back ${username}`)
    const redirectUrl = req.session.returnTo || '/campgrounds';// guarda el url donde intentaba acceder para ser redirigido, O el home si se logeaba ahi
    delete req.session.returnTo; //para que no quede registro en la session
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', `Goodbye - Successfully logged out`);
    res.redirect('/campgrounds');
};



