$(document).ready(function() {

    function print_ob(data) {
        var html = '<pre style="border: 1px solid red; padding: 10px;">' + JSON.stringify(data) + '</pre>'
        $("body").prepend(html);
    }

    $(document).on("change", ".userFile", function(event) {

        var inputValue = $(this).val().trim();

        if (inputValue != "") {

            var files = event.target.files;
            var inputId = $(this).attr("id");
            var thisLabel = $(document).find("label[for='"+inputId+"']");
            var file = files[0];
            var picReader = new FileReader();

            var newInput = $(this).clone();
            var newLabel = $(thisLabel).clone();

            var res = inputId.split("_");
            var newIdNumber = parseInt(res[1]) + 1;
            var newId = res[0] + "_" + newIdNumber;

            $(newLabel).attr("for", newId);
            $(newInput).attr("id", newId);

            var div = document.createElement("div");

            $(div).addClass("col-xs-6 col-sm-4 col-md-3 col-lg-2");
            $(div).append(newLabel)
            $(div).append(newInput);

            $("#addInputArea").append(div);

            picReader.addEventListener("load", function(event) {
                var picFile = event.target.result;
                var picFile = file.type == "video/mp4" ? "/images/video-poster.jpg" : event.target.result;

                $(thisLabel).find("span").remove();
                $(thisLabel).css("background-image", "url("+picFile+")");
            });

            picReader.readAsDataURL(file);
        }
    })
})
