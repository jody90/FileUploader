var googleDrive = require('google-drive')

// ...
// add stuff here which gets you a token, fileId, and callback
// ...

var token = 'AIzaSyBCyCFsz5REEa-K2FiIZw3kZQNTLbK-4P8';
var fileId = 'android-release.apk';

// getFile(token, fileId, function(err, response, body) {
//     if (err) return console.log('err', err)
//     console.log('response', response)
//     console.log('body', JSON.parse(body))
// })

listFiles(token, callback);
// {
//     if (err) return console.log('err', err)
//     console.log('response', response)
//     console.log('body', JSON.parse(body))
// })

function getFile(token, fileId, callback) {
  googleDrive(token).files(fileId).get(callback)
}

function listFiles(token, callback) {
  googleDrive(token).files().get(callback)
}

function callback(err, response, body) {
  if (err) return console.log('err', err)
  console.log('response', response)
  console.log('body', JSON.parse(body))
}
