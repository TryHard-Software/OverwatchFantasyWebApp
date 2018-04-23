$(document).ready(function () {
    if (screen.width < 798) {
        $(".table-match-detail .th-kills").html(" K ");
        $(".table-match-detail .th-deaths").html(" D ");
        $(".table-match-detail .th-points").html("PTS");
    }

    $(document).on("click", ".toggleStatsButton", function() {
        var $e = $(this);
        var hidden = false; 
        
        var $div = $("#match_" + $e.data("id") + "_map_" + $e.data("map"));
        if($div.css('display') == "none") 
        {
            hidden = true; 
        }
        
        $(".match_" + $e.data("id")).hide(); 
        //console.log($div.css('display'));
        
        if(hidden) 
        {
            $("#match_" + $e.data("id") + "_map_" + $e.data("map")).show();
        }
    });
});
