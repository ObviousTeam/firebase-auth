const validator = require('validator');
const { getAuth, onAuthStateChanged} = require('firebase/auth');
const prepend = require('prepend');
const sanitizeHtml = require('sanitize-html');

const auth = getAuth();

onAuthStateChanged(auth, function(user) {
if (!user) {
    res.render("account/login.html")
} else {
    return res.redirect("./")
    }
})
