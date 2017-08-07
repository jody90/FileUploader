var express    = require("express")
var multer     = require('multer')
var app        = express()
var path       = require('path')
var moment     = require('moment');
var fs         = require('fs');
var q          = require("q");
var bodyParser = require("body-parser");
var sharp      = require('sharp');
var mime       = require('mime-types');

var load = multer({ dest: __dirname + '/uploads' });

var ejs = require('ejs')
app.set('view engine', 'ejs')

moment.locale('de');

var timeFormat = 'YYYY-MM-DD_HH:mm:ss';

var uploadFolder = __dirname + "/uploads";
var uploadThumbsFolder = __dirname + "/uploads/thumbs/";
var midsizeFolder = __dirname + "/uploads/midsize/";

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
app.use('/midsize', express.static(__dirname + '/uploads/midsize'));
app.use(bodyParser.urlencoded({extended: true})); // configure the app to use bodyParser()

// Routing
app.get('/', function(req, res) {
    res.render(__dirname + '/views/layout')
})

app.get('/download/:file(*)', function(req, res, next){
    var file = req.params.file;
    var path = uploadFolder + "/" + file;

    res.download(path);
});

app.get('/gallery', function(req, res) {
    var files = [];
    fs.readdir(uploadThumbsFolder, (err, tFiles) => {
        if (tFiles !== undefined) {
            for (var i = 0; i < tFiles.length; i++) {
                if (tFiles[i] !== "temp" && tFiles[i] !== ".directory") {
                    var thumbnail = "thumbs/" + tFiles[i];
                    var large = "uploads/" + tFiles[i];
                    var midsize = "midsize/" + tFiles[i];
                    var mimetype = mime.contentType(tFiles[i]);

                    var tImageData = {
                        thumbnail: thumbnail,
                        midsize: midsize,
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

        callback(null, moment().format(timeFormat) + '-Hochzeit-#' + new Date().getMilliseconds() + "#" + path.extname(file.originalname))
    }
})

var upload = multer({
    storage: storage
});

function createThumbs(file, callback) {

    var tFilePathArray = file.split("/");
    var filename = tFilePathArray[tFilePathArray.length - 1];
    var thumbPath = uploadThumbsFolder + filename;
    var midsizePath = midsizeFolder + filename;

    sharp(file)
    .resize(256)
    .toFile(thumbPath, function(err, info) {

        sharp(file)
        .resize(1200)
        .toFile(midsizePath, function(err, info) {

            var mimetype = mime.contentType(path.extname(file));

            uploadState.file = {
                thumbnail: "/thumbs/" + filename,
                large: "/uploads/" + filename,
                midsize: "/midsize/" + filename,
                mimetype: mimetype,
            }
            return callback(uploadState);
        });
    });
}

function isVideoFile(mimetype) {

    if (mimetype == "video/x-matroska" || mimetype == "video/mp4") {
        return true;
    }
    else {
        return false;
    }

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

    var file = newFilePath.replace("uploads/", "");

    var tFilePathArray = file.split("/");
    var filename = tFilePathArray[tFilePathArray.length - 1];
    var thumbPath = uploadThumbsFolder + filename;

    // Videos auch in Thumbnails aufnehmen direekt
    if (isVideoFile(tFile.mimetype)) {
        fs.createReadStream(newFilePath).pipe(fs.createWriteStream(thumbPath));
    }

    createThumbs(newFilePath, function(uploadState) {
        console.log("thumbs done");
        res.end(JSON.stringify(uploadState))
    })
    // cDrive.doUpload(uploadedFilePaths);
})

var port = 4400;
app.listen(port, function() {
    console.log('Node.js listening on port ' + port)
})
