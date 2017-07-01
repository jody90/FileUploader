var express = require("express")
var multer = require('multer')
var app = express()
var path = require('path')
var moment = require('moment');
var cDrive = require('./cDrive');
var fs = require('fs');
var Jimp = require("jimp");
var q = require("q");
var bodyParser = require("body-parser");
var uuidv1 = require('uuid/v1');
var ioProm  = require('express-socket.io');
var server  = ioProm.init(app);
var useragent = require('useragent');
var MobileDetect = require('mobile-detect');
var sharp = require('sharp');
var mime = require('mime-types');

var load = multer({ dest: './uploads' });

var ejs = require('ejs')
app.set('view engine', 'ejs')

var uploadFolder = "uploads";
var uploadThumbsFolder = "uploads/thumbs/";
var uploadThumbsFolderTmp = "uploads/thumbs/temp/";


var uploadState = {};

var clients = {};

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
    })
})

// Websocket
ioProm.then(function(io) {
    io.on('connection', function(socket) {
        console.log('Connected!');

        socket.on('clientmeta', function(msg) {

            var uuid = msg.uuid;

            if (uuid == null) {
                uuid = uuidv1();
                var data = {
                    uuid: uuid
                }
                socket.emit('clientmeta', data);
                console.log("No UUID sent One to client ", data.uuid);
            }

            clients[uuid] = {
                socket: socket
            }
        });
    });
});

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

function createThumbs(files, uuid, counter, callback) {

    var thumbReplace = /^uploads\//

    var counter = counter != null ? counter : 0;

    uploadState.files = counter === 0 ? [] : uploadState.files;

    var filename = files[0].replace(thumbReplace, "");

    var thumbPathTmp = uploadThumbsFolderTmp + filename;

    var allThumbsDone = false;

    sharp(files[0])
    .resize(256)
    .toFile(thumbPathTmp, function(err, info) {

        var mimetype = mime.contentType(path.extname(files[0]));

        uploadState.file = {
            thumbnail: thumbPathTmp,
            large: files[0],
            mimetype: mimetype,
        }

        files.splice(0, 1);

        counter++;
        uploadState.filesProcessed = counter;
        uploadState.files.push(filename);

        // Client ueber aktuellen Upload Status informieren
        clients[uuid].socket.emit('uploadState', uploadState);

        if (files.length > 0) {
            // setTimeout(function() {
            createThumbs(files, uuid, counter, callback);
            // }, 300);
        }
        else {
            callback();
        }
    });
}

app.post('/uploaded', upload.array('userFile', 99), function(req, res) {

    var tFiles = req.files;
    var uploadedFilePaths = [];
    var uploaderName = req.body.uploaderName != "" ? req.body.uploaderName : "Anonymus";
    var replace = /#.*#/;
    var files = [];
    var uuid = req.body.uuid != undefined ? req.body.uuid : null;

    // Dateien umbenennen und Thumbs erstellen
    for (var i = 0; i < tFiles.length; i++) {

        var newFilePath = tFiles[i].path.replace(replace, uploaderName);

        // umbenennen
        fs.rename(tFiles[i].path, newFilePath, function (err) {
            if (err) {
                console.log(err);
                return;
            }
        });

        files.push(newFilePath);

        var filename = newFilePath.replace("uploads/", "");

        // Videos auch in Thumbnails aufnehmen
        if (tFiles[i].mimetype == "video/mp4") {
            fs.createReadStream(newFilePath).pipe(fs.createWriteStream('uploads/thumbs/' + filename));
        }

        uploadState.filesTotal = files.length;

        // thumbs erstellen danach zu gallery weiterleiten
        if (files.length === tFiles.length) {
            var returnData = {finish: true};
            res.end(JSON.stringify(returnData));
            createThumbs(files, uuid, 0, function() {

                setTimeout(function() {

                    fs.readdir(uploadThumbsFolderTmp, (err, tFiles) => {
                        for (var i = 0; i < tFiles.length; i++) {
                            var oldPath = uploadThumbsFolderTmp + tFiles[i];
                            var newPath = uploadThumbsFolder + tFiles[i];
                            fs.rename(oldPath, newPath, function() {

                            })
                        }
                        res.end(JSON.stringify(files))
                    })
                    console.log("thumbs done");
                }, 2000)
            })
        }
    }
    // cDrive.doUpload(uploadedFilePaths);
})

var port = 4400
server.listen(port, function() {
    console.log('Node.js listening on port ' + port)
})
