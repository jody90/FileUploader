myApp.controller('GalleryController', ['$scope', '$http', '$rootScope', '$routeParams', function($scope, $http, $rootScope, $routeParams) {

    $scope.getDownloadLink = function(tFile) {
        var tFileArray =  tFile.split("/");
        var filename = tFileArray[tFileArray.length - 1];
        var url = '/download/' + filename;
        return url;
    }

    $scope.downloadFile = function(tFile) {
        event.preventDefault()
        var tFileArray =  tFile.split("/");
        var filename = tFileArray[tFileArray.length - 1];
        $http({
            method: 'GET',
            url: '/download/' + filename
        })
    }

    var getGalleryImages = $http({
        method: 'GET',
        url: '/gallery'
    })

    getGalleryImages.then(function (response) {

        var tImages = response.data;
        if ($rootScope.images == undefined) {
            $rootScope.images = [];
        }

        if (tImages.length > $rootScope.images) {
            $rootScope.images.push.apply($rootScope.images, tImages);
        }
    });
}])
