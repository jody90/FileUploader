var myApp = angular.module('MyApp', ['ngRoute']);

myApp.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "templates/index.html",
        controller : "IndexController"
    })
    .when("/upload", {

        templateUrl : "templates/upload.html",
        controller : "UploadController"
    })
    .when("/gallery", {
        templateUrl : "templates/gallery.html",
        controller : "GalleryController"
    })
    .when("/gallery/:isUploading", {
        templateUrl : "templates/gallery.html",
        controller : "GalleryController"
    })
    .otherwise({redirectTo: "/"});
})

myApp.run(function($rootScope) {

    $rootScope.uploading = false;

    if (window.WebSocket && typeof(Storage) !== "undefined") {

        // console.info("websocket supported");

        var socket = io();

        socket.on('connect', function() {
            // console.log("WS connected");

            var uuid = localStorage.getItem("uuid");
            var data = {
                uuid: uuid
            };
            socket.emit('clientmeta', data);
        });

        socket.on('clientmeta', function(msg) {
            console.log("clientmeta msg: ", msg);
            localStorage.setItem("uuid", msg.uuid);
        });

        socket.on('uploadState', function(msg) {
            console.log("uploadState msg: ", msg);

            if ($rootScope.images == undefined) {
                $rootScope.images = [];
            }

            $rootScope.$apply(function() {
                $rootScope.images.unshift(msg.file);

                var filesProcessed = msg.filesProcessed;
                var filesTotal = msg.filesTotal;
                var uploadPercentage = Math.round((100 / filesTotal) * filesProcessed);

                $rootScope.uploadPercentage = uploadPercentage;
            });




            console.log($rootScope.images);
            // print_ob(msg);
        });
    }
    else {
        console.info("websocket NOT supported");
    }
});


// myApp.factory("MyException", function() {
//
//     function MyException(name, message, throwingClass) {
//         this.name = name;
//         this.message = message;
//         this.throwingClass = throwingClass;
//         this.method = method;
//     }
//
//     MyException.prototype = new Error();
//     MyException.prototype.constructor = MyException;
//
//     return MyException
//
// })
