myApp.controller('UploadController', ['$scope', '$rootScope', '$http', '$location', function($scope, $rootScope, $http, $location) {

    var multipart = $(".multipart-support").attr("data-multipart");
    var md = new MobileDetect(window.navigator.userAgent);

    $scope.isAndroid = md.os() == "AndroidOS" ? true : false;

    function print_ob(data) {
        var html = '<pre style="border: 1px solid red; padding: 10px;">' + JSON.stringify(data) + '</pre>'
        $("body").prepend(html);
    }

    function extround(zahl,n_stelle) {
        zahl = (Math.round(zahl * n_stelle) / n_stelle);
        return zahl;
    }

    function createPreview(files, filesCount, filesShownCount, callback) {
        var file = files[0];

        var filename = file.name;
        var filesizeMb = extround(file.size / 1000 / 1000, 100) + " MB";

        var picReader = new FileReader();
        picReader.addEventListener("load",function(event) {
            var picFile = event.target;
            var div = document.createElement("div");
            // div.innerHTML = "<span class='img-container' style='background-image: url(picFile.result);'><img class='thumbnail' src='" + picFile.result + "'" + "title='preview image'/></span><span class='filename'><span class='filename-title'>Dateiname:</span><br>" + filename + "</span><span class='filesize'><span class='filesize-title'>Dateigröße:</span><br>" + filesizeMb + "</span>";
            console.log("filename: ", filename);
            console.log("filesizeMb: ", filesizeMb);

            div.innerHTML = "<span class='preview-row'><span class='img-container' style='background-image: url(" + picFile.result + ");'></span></span><span class='filename'><span class='filename-title'>Dateiname:</span><br>" + filename + "</span><span class='filesize'><span class='filesize-title'>Dateigröße:</span><br>" + filesizeMb + "</span><span class='btn btn-danger remove-preview-img'><span class='glyphicon glyphicon-trash icon-remove-preview-img'></span>entfernen</span>";
            $("#thumbnails").append(div);
        });
        picReader.readAsDataURL(file);


        picReader.onload = function (oFREvent) {
            console.log("filesShownCount: ", filesShownCount);
            if (filesCount == filesShownCount) {
                return callback();
            }
            else {
                filesShownCount++
                console.log("files: ", files.length);
                files.splice(0, 1);
                console.log("files: ", files.length);

                createPreview(files, files.length, filesShownCount, callback)
            }
        };
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

        createPreview(filesArray, files.length, 0, function() {
            console.log("fertig");
            $(".overlay").addClass("hide");
        })

        // for (var i = 0; i < filesCount; i++) {
        //     var file = files[i];
        //
        //     var filename = file.name;
        //     var filesizeMb = extround(file.size / 1000 / 1000, 100) + " MB";
        //
        //     var picReader = new FileReader();
        //     picReader.addEventListener("load",function(event) {
        //         var picFile = event.target;
        //         var div = document.createElement("div");
        //         // div.innerHTML = "<span class='img-container' style='background-image: url(picFile.result);'><img class='thumbnail' src='" + picFile.result + "'" + "title='preview image'/></span><span class='filename'><span class='filename-title'>Dateiname:</span><br>" + filename + "</span><span class='filesize'><span class='filesize-title'>Dateigröße:</span><br>" + filesizeMb + "</span>";
        //         console.log("filename: ", filename);
        //         console.log("filesizeMb: ", filesizeMb);
        //
        //         div.innerHTML = "<span class='preview-row'><span class='img-container' style='background-image: url(" + picFile.result + ");'></span></span><span class='filename'><span class='filename-title'>Dateiname:</span><br>" + filename + "</span><span class='filesize'><span class='filesize-title'>Dateigröße:</span><br>" + filesizeMb + "</span><span class='btn btn-danger remove-preview-img'><span class='glyphicon glyphicon-trash icon-remove-preview-img'></span>entfernen</span>";
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
