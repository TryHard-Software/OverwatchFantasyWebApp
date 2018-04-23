
$(document).ready(function () {

    var myvid = document.getElementById('bg-video');
    
    if ($(window).width() < 798) {
        myvid.src="/images/videos/bg-video-mobile.mp4"
    }

    $("#bg-video").on("ended", function () {
        myvid.play();
    });
   
});

