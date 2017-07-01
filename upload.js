var fs = require('fs');
var google = require('googleapis');
var drive = google.drive({ version: 'v3', auth: oauth2Client });

drive.files.create({
  resource: {
    name: 'testimage.png',
    mimeType: 'image/png'
  },
  media: {
    mimeType: 'image/png',
    body: fs.createReadStream('awesome.png') // read streams are awesome!
  }
}, callback);
