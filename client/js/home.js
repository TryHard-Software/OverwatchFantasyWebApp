
$(document).ready(function () {

    var myvid = document.getElementById('bg-video');
    
    if (screen.width < 798) {
        myvid.src=null;
        $(".landing-background").attr("src","/images/landing.png")
    }

    $("#bg-video").on("ended", function () {
        myvid.play();
    });
   
});

