myApp.controller('UploadController', ['$scope', '$rootScope', '$http', '$location', function($scope, $rootScope, $http, $location) {

    var multipart = $(".multipart-support").attr("data-multipart");
    var md = new MobileDetect(window.navigator.userAgent);

    $scope.isAndroid = md.os() == "AndroidOS" ? true : false;

    $scope.filesArray = {};
    $scope.filesArray.files = [];
    $scope.filesArray.thumbs = [];

    $scope.form = {};
    $scope.form.uploaderName = "";

    var helperFilesArray = [];

    $scope.removeThumbnail = function(index) {
        $scope.filesArray.files.splice(index, 1);
        $scope.filesArray.thumbs.splice(index, 1);
    }

    $scope.file_changed = function(element) {

        var files = element.files;

        if (files != null) {
            for (var i = 0; i < files.length; i++) {
                helperFilesArray.push(files[i]);

            }
        }

        $(".overlay").removeClass("hide");

        createPreview(helperFilesArray, helperFilesArray.length, function() {
            $(".overlay").addClass("hide");
        })
    };

    function print_ob(data) {
        var html = '<pre style="border: 1px solid red; padding: 10px;">' + JSON.stringify(data) + '</pre>'
        $("body").prepend(html);
    }

    function extround(zahl,n_stelle) {
        zahl = (Math.round(zahl * n_stelle) / n_stelle);
        return zahl;
    }

    function createPreview(files, filesCount, callback) {
        var file = files[0];

        var filename = file.name;
        var filesizeMb = extround(file.size / 1000 / 1000, 100) + " MB";

        var thumbData = {};
        thumbData.filename = filename;
        thumbData.filesize = filesizeMb;

        if (file.type == "video/mp4") {
            thumbData.picFile = "images/video-poster.jpg";
            $scope.$apply(function(scope) {
                $scope.filesArray.thumbs.push(thumbData);
                $scope.filesArray.files.push(file);
            });

            files.splice(0, 1);

            if (files.length > 0) {
                createPreview(files, files.length, callback)
            }
            else {
                return callback();
            }
        }
        else {

            var picReader = new FileReader();
            picReader.addEventListener("load",function(event) {
                var picFile = event.target;

                thumbData.picFile = picFile.result;
                $scope.$apply(function(scope) {
                    $scope.filesArray.thumbs.push(thumbData);
                    $scope.filesArray.files.push(file);
                });
            });
            picReader.readAsDataURL(file);

            picReader.onload = function (oFREvent) {

                files.splice(0, 1);

                if (files.length > 0) {
                    createPreview(files, files.length, callback)
                }
                else {
                    return callback();
                }
            };
        }
    }

    $scope.uploadFiles = function() {

        $rootScope.uploading = true;

        var uploaderName = $("#uploaderName").val();

        var uploadData = {
            uploaderName: $scope.form.uploaderName,
            files: $scope.filesArray.files
        };

        if (uploadData.files.length > 0) {
            uploadFile(uploadData, 0, uploadData.files.length, function() {
                console.log("alle oben");
            })
        }

        $location.path( "/gallery/uploading" );

    }

    $scope.showUploadPreview = function() {
        $("#thumbnails").html('');
        var files = event.target.files;
        var filesCount = files.length;
        var filesShownCount = 0;

        var filesArray = [];
        for (var i = 0; i < filesCount; i++) {
            filesArray.push(files[i]);
        }

        $(".overlay").removeClass("hide");

        createPreview(filesArray, files.length, function() {
            console.log("fertig");
            $(".overlay").addClass("hide");
        })
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

        // $rootScope.uploading = true;
        //
        // var uploaderName = $("#uploaderName").val();
        //
        // var uploadData = {
        //     uploaderName: uploaderName,
        //     files: []
        // };
        //
        // if (!$scope.isAndroid) {
        //     $.each($('#userFile')[0].files, function(i, file) {
        //         uploadData.files.push(file);
        //     });
        // }
        // else {
        //     var inputElementsCount = $("#uploadForm").find(".userFile").length;
        //     $.each($("#uploadForm").find(".userFile"), function(i, element) {
        //         var file = $(element)[0].files[0];
        //         if (i + 1 < inputElementsCount) {
        //             uploadData.files.push(file);
        //             console.log(uploadData);
        //         }
        //     })
        // }
        //
        // // eins von beiden ist immer gefuellt
        // // inputElementsCount immer eins abziehen weil wir ein element mehr im dom haben
        // var filesCount = inputElementsCount === undefined ? $('#userFile')[0].files.length : inputElementsCount - 1;
        // console.log("filesCount: ", filesCount);
        //
        // if (uploadData.files.length == filesCount  && uploadData.files.length > 0) {
        //     uploadFile(uploadData, 0, uploadData.files.length, function() {
        //         console.log("alle oben");
        //     })
        // }
        //
        // $location.path( "/gallery/uploading" );
    }

}])
