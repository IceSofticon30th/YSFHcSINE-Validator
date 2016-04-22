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

function sessionValidator(object) {
    var noSession = object.noSession;
    var invalidSession = object.invalidSession;
    
    // Middleware for Express 4
    return function validator(req, res, next) {
        if (!req.cookies) next(new Error('req.cookies is undefined.'));
        if (!req.cookies.session_id) {
            if (typeof noSession === 'function') noSession(req, res, next);
            else next(new Error('No Session'));
            return;
        }
        validateSession(req.cookies.session_id, function (expires) {
            if (!expires) {
                if (typeof invalidSession === 'function') invalidSession(req, res, next);
                else next(new Error('Invalid Session'));
            } else {
                res.cookie('session_id', req.cookies.session_id, {expires: expires});
                next();
            }
        });
    }
}

module.exports = sessionValidator;