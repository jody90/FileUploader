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



myApp.run(['$rootScope', '$location', '$routeParams', function($rootScope, $location, $routeParams) {

    var showProgressBar = function(value) {
        if (value) {
            $rootScope.showProgressBar = true;
            $rootScope.uploadPercentage = $rootScope.uploadPercentage || 1;
        }
        else {
            $rootScope.showProgressBar = false;
            $rootScope.uploadPercentage = 0;
        }
    }

    $rootScope.$on('$routeChangeSuccess', function(e, current, pre) {
        $rootScope.currentPath = $location.path();

        switch ($rootScope.currentPath) {
            case "/" :
            $rootScope.headerText = "Willkommen auf der Hochzeit von Barbara und Matthias";
            break;
            case "/gallery" :
                $rootScope.headerText = "Gallerie";
            break;
            case "/upload" :
                $rootScope.headerText = "Bilder und Videos Hochladen";
            break;
        }

        showProgressBar($rootScope.uploading);

    });

    // Wenn sich uploading value aendert showProgressBar aufrufen
    $rootScope.$watch("uploading", function(value) {
        showProgressBar(value);
      });

    $rootScope.uploading = false;

}]);
