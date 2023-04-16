const validator = require('validator');
const { getAuth, signInWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithPopup} = require('firebase/auth');
const prepend = require('prepend');
const sanitizeHtml = require('sanitize-html');

const auth = getAuth();

exports.loginget = (req, res) => {
  const path = require('path');
  onAuthStateChanged(auth, function(user) {
    if (!user) {
      res.render("account/login.html")
    } else {
      return res.redirect("./")
    }
  })
}

exports.loginpostgoogle = (req, res) => {
  const signInWithGoogle = () => {
    const provider = GoogleAuthProvider(auth);
    signInWithPopup(auth, provider);
  }
  signInWithGoogle()
  .then((userCredential) => {
    res.send("logged in successfully with google"+userCredential.email)
  })
}

exports.loginpost = (req, res) => {
  const inputemail = req.body.email;
  const inputpassword = req.body.password;

  const email = sanitizeHtml(inputemail, {
    allowedTags: [],
    allowedAttributes: {}
  });

  const password = sanitizeHtml(inputpassword, {
    allowedTags: [],
    allowedAttributes: {}
  });

  if (!validator.isAlphanumeric(password)) {
    return res.status(400).send('Invalid password format');
  }

  if (!validator.isEmail(email)) {
    return res.status(400).send('Invalid email format');
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        exports.user = userCredential;
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
      });
  }

  login(email, password)
    .then((user) => {
      res.send("logged in successfully")
    })
    .catch(err => {
      console.error('Error logging in:' + err);
      prepend('login/login.txt', err, function(error) {
        if (error)
          console.error(error);
      });
      res.status(500).send('Error logging in:' + err);
    });

};
