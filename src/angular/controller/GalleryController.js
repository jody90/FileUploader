myApp.controller('GalleryController', ['$scope', '$http', '$rootScope', '$routeParams', function($scope, $http, $rootScope, $routeParams) {

    if ($routeParams.isUploading !== undefined && $rootScope.uploading) {

        $rootScope.uploadPercentage = $rootScope.uploadPercentage || 1;

        var countPercentage = setInterval(function() {
            $rootScope.$apply(function() {
                var percentageAdd = $rootScope.uploadPercentage > 40 ? 1 : 3;
                $rootScope.uploadPercentage = parseInt($rootScope.uploadPercentage) + percentageAdd;

                if ($rootScope.uploadPercentage >= 99) {
                    $rootScope.uploadPercentage = 100;
                    clearInterval(countPercentage);
                }

            });
        }, 2500);
    }

    var posting = $http({
        method: 'GET',
        url: '/gallery'
    })

    posting.then(function (response) {
        var tImages = response.data;
        if ($rootScope.images == undefined) {
            $rootScope.images = [];
        }

        if (tImages.length > $rootScope.images) {
            $rootScope.images.push.apply($rootScope.images, tImages);
        }
    });
}])
