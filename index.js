var express = require("express")
var multer = require('multer')
var app = express()
var path = require('path')
var moment = require('moment');
var cDrive = require('./cDrive');
var fs = require('fs');
var q = require("q");
var bodyParser = require("body-parser");
var useragent = require('useragent');
var sharp = require('sharp');
var mime = require('mime-types');

var load = multer({ dest: './uploads' });

var ejs = require('ejs')
app.set('view engine', 'ejs')

var uploadFolder = "uploads";
var uploadThumbsFolder = "uploads/thumbs/";

var uploadState = {};

app.use('/css', express.static(__dirname + '/ressources/css'));
app.use('/angular', express.static(__dirname + '/ressources/angular'));
app.use('/images', express.static(__dirname + '/ressources/images'));
app.use('/img', express.static(__dirname + '/ressources/images'));
app.use('/templates', express.static(__dirname + '/src/templates'));
app.use('/fonts', express.static(__dirname + '/ressources/fonts'));
app.use('/scripts', express.static(__dirname + '/ressources/js'));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use('/thumbs', express.static(__dirname + '/uploads/thumbs'));
app.use(bodyParser.urlencoded({extended: true})); // configure the app to use bodyParser()

// Routing
app.get('/', function(req, res) {
    res.render('layout', {
        view: "index"
    })
})

app.get('/gallery', function(req, res) {
    var files = [];
    fs.readdir(uploadThumbsFolder, (err, tFiles) => {
        if (tFiles.length !== undefined) {
            for (var i = 0; i < tFiles.length; i++) {
                if (tFiles[i] !== "temp" && tFiles[i] !== ".directory") {
                    var thumbnail = "thumbs/" + tFiles[i];
                    var large = "uploads/" + tFiles[i];
                    var mimetype = mime.contentType(tFiles[i]);

                    var tImageData = {
                        thumbnail: thumbnail,
                        large: large,
                        mimetype: mimetype
                    }
                    files.push(tImageData);
                }
            }
            files.reverse();
            res.end(JSON.stringify(files))
        }
        else {
            // res.end(JSON.stringify({status: 500, message: "Thumbs Folder is empty"}));
            res.end(JSON.stringify(files))
        }
    })
})

// Pfad wo die Uploads abgelegt werden definieren
var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, uploadFolder)
    },
    filename: function(req, file, callback) {

        var randomNumber = Math.floor((Math.random() * 100) + 1);

        callback(null, moment().format('YYYY-MM-DD_hh:mm:ss:SSS') + '-Hochzeit-#' + new Date().getMilliseconds() + "#" + path.extname(file.originalname))
    }
})

var upload = multer({
    storage: storage
});

function createThumbs(file, callback) {

    var thumbReplace = /^uploads\//

    var filename = file.replace(thumbReplace, "");

    var thumbPath = uploadThumbsFolder + filename;

    sharp(file)
    .resize(256)
    .toFile(thumbPath, function(err, info) {

        var mimetype = mime.contentType(path.extname(file));

        uploadState.file = {
            thumbnail: thumbPath,
            large: file,
            mimetype: mimetype,
        }
        return callback(uploadState);
    });
}

app.post('/uploaded', upload.single('userFile'), function(req, res) {

    var tFile = req.file;
    var uploadedFilePaths = [];
    var uploaderName = req.body.uploaderName != "" ? req.body.uploaderName : "Anonymus";
    var replace = /#.*#/;
    var files = [];

    // Dateien umbenennen und Thumbs erstellen
    // umbenennen
    var newFilePath = tFile.path.replace(replace, uploaderName);
    fs.rename(tFile.path, newFilePath, function (err) {
        if (err) {
            console.log(err);
            return;
        }
    });

    var filename = newFilePath.replace("uploads/", "");

    // Videos auch in Thumbnails aufnehmen direekt
    if (tFile.mimetype == "video/mp4") {
        fs.createReadStream(newFilePath).pipe(fs.createWriteStream('uploads/thumbs/' + filename));
    }

    createThumbs(newFilePath, function(uploadState) {
        console.log("thumbs done");
        res.end(JSON.stringify(uploadState))
    })
    // cDrive.doUpload(uploadedFilePaths);
})

var port = 4400
app.listen(port, function() {
    console.log('Node.js listening on port ' + port)
})
