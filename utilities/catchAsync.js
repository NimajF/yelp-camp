module.exports = func => { // pasamos func
    return (req, res, next) => { // devuelve una nueva funcion que tiene func ejecutada
        func(req, res, next).catch(next);
    }
}