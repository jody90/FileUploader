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

    function uploadFile(data, counter, filesTotal, callback) {

        var files = data.files;

        var formData = new FormData();
        formData.append("uploaderName", data.uploaderName);

        formData.append("userFile", files[0]);

        console.log("counter: ", counter);

        var posting = $http({
            method: 'POST',
            url: '/uploaded',
            data: formData,
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined},
            processData: false
        })
        posting.then(function (response) {

            var uploadedFile = response.data.file;

            if ($rootScope.images == undefined) {
                $rootScope.images = [];
            }

            $rootScope.images.unshift(uploadedFile);

            counter++;
            files.splice(0, 1);
            data.files = files;

            if (files.length > 0) {
                setTimeout(function() {

                    var filesProcessed = counter;
                    var uploadPercentage = Math.round((100 / filesTotal) * filesProcessed);

                    $rootScope.uploadPercentage = uploadPercentage;
                    uploadFile(data, counter, filesTotal, callback);
                }, 2000);
            }
            else {
                $rootScope.uploadPercentage = 100;
                callback();
            }
        });
    }

    $scope.uploadForm = function() {

        $rootScope.uploading = true;

        var uploaderName = $("#uploaderName").val();

        var uploadData = {
            uploaderName: uploaderName,
            files: []
        };

        if (!$scope.isAndroid) {
            $.each($('#userFile')[0].files, function(i, file) {
                uploadData.files.push(file);
            });
        }
        else {
            var inputElementsCount = $("#uploadForm").find(".userFile").length;
            $.each($("#uploadForm").find(".userFile"), function(i, element) {
                var file = $(element)[0].files[0];
                if (i + 1 < inputElementsCount) {
                    uploadData.files.push(file);
                    console.log(uploadData);
                }
            })
        }

        // eins von beiden ist immer gefuellt
        // inputElementsCount immer eins abziehen weil wir ein element mehr im dom haben
        var filesCount = inputElementsCount === undefined ? $('#userFile')[0].files.length : inputElementsCount - 1;
        console.log("filesCount: ", filesCount);

        if (uploadData.files.length == filesCount  && uploadData.files.length > 0) {
            uploadFile(uploadData, 0, uploadData.files.length, function() {
                console.log("alle oben");
            })
        }

        $location.path( "/gallery/uploading" );
    }

}])
