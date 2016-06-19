var mongojs = require('mongojs');
var db = mongojs('YSFHcSINE', ['session']);

function validateSession(session_id, callback) {
    var newExpires = new Date();
    newExpires.setHours(newExpires.getHours() + 1);
    
    db.session.findOne({session_id: session_id}, function (err, doc) {
        if (err) {
            console.error(err.stack);
            callback(null);
            return;
        }
        
        if (doc.expires.getTime() - new Date().getTime() >= 0) {
            callback(doc);
            db.session.update({session_id: session_id}, {$set: {expires: newExpires} });
        } else {
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
        validateSession(req.cookies.session_id, function (doc) {
            if (doc) {
                next();
            } else {
                if (typeof invalidSession === 'function') invalidSession(req, res, next);
                else next(new Error('Invalid Session'));
            }
        });
    }
}

module.exports = sessionValidator;