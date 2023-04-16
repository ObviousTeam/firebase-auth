const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session')
const fs = require('fs');
const { getAuth } =  require('firebase/auth');
const express = require('express');
const crypto = require('crypto');
const { initializeApp } =  require("firebase/app");
const fireconfig = "./service.json"

const algorithm = process.env['encrypting/decrypting_code_for_file'];
const keystring = process.env['file_encrypting/decrypting_key']
const key = Buffer.from(keystring, 'hex');
const iv = crypto.randomBytes(16);

function encryptFile(filePath) {
  const input = fs.readFileSync(filePath);
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(input);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  fs.writeFileSync(filePath, JSON.stringify({ iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') }));
}
function decryptFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath));
  let iv = Buffer.from(data.iv, 'hex');
  let encryptedText = Buffer.from(data.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  fs.writeFileSync(filePath, decrypted);
}


const app = express();

app.use(session({secret: process.env['Session_Secret'], resave: true, saveUninitialized: true}))

app.use('/templates', express.static(__dirname + '/templates', {
	setHeaders: (res, path) => {
		if (path.endsWith('.css')) {
			res.setHeader('Content-Type', 'text/css');
		}
	}
}));
app.use('/templates', express.static(__dirname + '/templates', {
	setHeaders: (res, path) => {
		if (path.endsWith('.js')) {
			res.setHeader('Content-Type', 'text/js');
		}
	}
}));
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'templates'));
app.use(bodyParser.urlencoded({ extended: true }));

decryptFile(fireconfig);

initializeApp(require(fireconfig));
const auth = getAuth();

encryptFile(fireconfig);

/*
const {createget, createpost} = require('#create')
const {recoverget, recoverpost} = require('#recover')
*/
const {loginget, loginpost} = require('#login')
//const {logoutget, logoutpost} = require('#logout')

//app.get('/logout', logoutget)
//app.post('/logout', logoutpost)

app.get('/login', loginget)
app.post('/login', loginpost)

/*
app.get('/recover', recoverget)
app.post('/recover', recoverpost)

app.get('/create', createget)
app.post('/create', createpost)

app.get("/", (req, res) => {
  res.render('homepage/homepage.html')
})

*/

const server = app.listen(3000, () => {
  console.log(`Express running → PORT ${server.address().port}`);
});