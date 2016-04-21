var mongojs = require('mongojs');
var db = mongojs('YSFHcSINE', ['session']);

function validateSession(session_id, callback) {
    var expires = new Date();
    expires.setHours(expires.getHours() + 1);
    
    db.session.update({session_id: session_id}, {$set: {expires: expires} }, function (err, result) {
        // { ok: 1, nModified: 0, n: 0 }
        if (err) {
            console.error(err.stack);
            callback(null);
            return;
        }
        
        if (result.nModified === 1) {
            callback(expires);
        } else if (result.nModified === 0) {
            callback(null);
        } else {
            console.error('ERROR: Detected overlap of session_id.');
            callback(null);
        }
    });
}

function sessionValidator(req, res, next) {
    if (!req.cookies) throw new Error('cookie parser required');
    if (!req.cookies.session_id) {
        res.redirect('/login');
        return;
    }
    validateSession(req.cookies.session_id, function (expires) {
        if (!expires) {
            next(new Error('Invalid Session'));
        } else {
            res.cookie('session_id', req.cookies.session_id, {expires: expires});
            next();
        }
    });
}

module.exports = sessionValidator;