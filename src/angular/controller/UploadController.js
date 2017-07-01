myApp.controller('UploadController', ['$scope', '$rootScope', '$http', '$location', function($scope, $rootScope, $http, $location) {

    var multipart = $(".multipart-support").attr("data-multipart");
    var md = new MobileDetect(window.navigator.userAgent);

    $scope.isAndroid = md.os() == "AndroidOS" ? true : false;

    function print_ob(data) {
        var html = '<pre style="border: 1px solid red; padding: 10px;">' + JSON.stringify(data) + '</pre>'
        $("body").prepend(html);
    }

    $scope.showUploadPreview = function() {
        // $("#thumbnails img").remove();
        // var files = event.target.files;
        // var filesCount = files.length;
        // var filesShownCount = 0;
        //
        // $(".overlay").removeClass("hide");
        //
        // for (var i = 0; i < filesCount; i++) {
        //     var file = files[i];
        //     var picReader = new FileReader();
        //     picReader.addEventListener("load",function(event){
        //         var picFile = event.target;
        //         var div = document.createElement("div");
        //         div.innerHTML = "<img class='thumbnail' src='" + picFile.result + "'" + "title='preview image'/>";
        //         $("#thumbnails").append(div);
        //     });
        //     picReader.readAsDataURL(file);
        //
        //
        //     picReader.onload = function (oFREvent) {
        //         filesShownCount++
        //         if (filesShownCount >= filesCount) {
        //             $(".overlay").addClass("hide");
        //         }
        //     };
        // }
    }

    $scope.uploadForm = function() {

        $rootScope.uploading = true;

        var uploaderName = $("#uploaderName").val();
        var data = new FormData();

        data.append("uploaderName", uploaderName);

        if (!$scope.isAndroid) {
            $.each($('#userFile')[0].files, function(i, file) {
                console.log(file);
                data.append('userFile', file);
            });
        }
        else {
            var inputElementsCount = $("#uploadForm").find(".userFile").length;
            $.each($("#uploadForm").find(".userFile"), function(i, element) {
                var file = $(element)[0].files;
                if (i + 1 < inputElementsCount) {
                    data.append('userFile', file[0]);
                }
            })
        }

        var uuid = localStorage.getItem("uuid");

        if (uuid != null) {
            data.append("uuid", uuid);
        }

        var posting = $http({
            method: 'POST',
            url: '/uploaded',
            data: data,
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined},
            processData: false
        })

        posting.then(function (response) {
            // console.log(response);
        });
        $location.path( "/gallery/uploading" );
    }

}])
