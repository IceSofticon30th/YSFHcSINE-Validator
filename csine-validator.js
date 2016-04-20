var mongojs = require('mongojs');
var db = mongojs('YSFHcSINE', ['session']);

function createSession(user_id, password) {
    var data = {
        user_id: user_id,
        password: password
    };
    
    db.session.insert(data, function(err, doc) {
        console.log(doc)
    });
    
}

createSession('AAA', 'BBB');