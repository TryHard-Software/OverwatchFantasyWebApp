$(document).ready(function () {
    var mobile = false;
    if (rosterLock) {
        $(".move-button").attr("disabled", true);
        $(".roster-lock-message").show();
    }

    // remove all players without a team from the free agents table
    // dont remove by roster table because we still want people
    // to be able to remove the player from their roster
    $("#playerTable tr[teamid='0']").remove();

    // stick name and role into player pic column
    if (screen.width < 798) {
        mobile = true;
        var $trs = $("tr");
        for (var t = 0; t < $trs.length; t++) {
            var $tr = $($trs[t]);
            var $columnToDelete = $($tr.children()[1]);
            $($columnToDelete.children("a")[0]).addClass("playerNameMobile");
            var newElem = $columnToDelete.html();
            var $firstCol = $($tr.children()[0]);
            // only move html over if its not a column header
            if ($firstCol.attr("scope") !== "col") {
                $firstCol.append(newElem);
            }
            $columnToDelete.remove();
        }
    }

    //on page load, loop through roster and hide all the players currently
    // in the roster from the free agents table so people don't have duplicate
    // players
    hideRosterFromAgents();
    function hideRosterFromAgents() {
        var $rows = $("#rosterTable tr");
        for (var r = 0; r < $rows.length; r++) {
            var id = $($rows[r]).attr("playerid");
            if (id) {
                $('#agents-table tr[playerid="' + id + '"]').hide();
            }
        }
    }

    $(".filter").on("click", function (event) {
        var filter = $(this).attr("value");
        if (filter === "all") {
            $(".playerRow").show();
        } else if (filter === "offense"
            || filter === "tank"
            || filter === "support") {
            $(".playerRow").filter(function () {
                return $(this).attr("role") === filter;
            }).show();
            $(".playerRow").filter(function () {
                return $(this).attr("role") !== filter;
            }).hide();
        } else {
            $(".playerRow").filter(function () {
                return $(this).attr("teamId") === filter;
            }).show();
            $(".playerRow").filter(function () {
                return $(this).attr("teamId") !== filter;
            }).hide();
        }
        hideRosterFromAgents();
    });

    // couldn't just switch the row between the two tables or
    // the ordering would get messed up
    $(document).on("click", ".move-button", function (event) {
        // controls where the roles sit in the table
        var indexLimit = {
            offense: 0,
            tank: 4,
            support: 8
        };
        // grab the entire player row
        var $row = $(this).parents("tr");
        var role = $row.attr("role");
        // if the row is in the free agents table
        if ($row.parents("#agents-table").length) {
            // dont let user add more to roster if no more empty slots
            var emptySlotCount = $(".emptyRosterSlot").length;
            if (emptySlotCount === 0) {
                toast("Full Roster");
                return;
            }
            // dont let user add more than 4 of a role to roster
            if ($('#rosterTable tr[role="' + role + '"]').not(".emptyRosterSlot").length > 3) {
                toast("Too many " + role + " players");
                return;
            }
            // clone the row
            var $rowClone = $row.clone();
            // toggle the button
            var $button = $rowClone.find("button");
            toggleButton($button);
            // append the clone to the roster table
            $rowClone.appendTo("#rosterTable");
            // clone is no longer a playerRow (so no team filter)
            $rowClone.toggleClass("playerRow");
            // move the player passed all the empty roster slots
            // but not passed other players
            for (var i = 0; i < 12; i++) {
                // complicated logic. support can only pass the bottom 3 slots.
                // tank can only pass the bottom 7 slots.
                if (($rowClone.prev().hasClass("emptyRosterSlot")
                    || indexLimit[$rowClone.prev().attr("role")] > indexLimit[role])
                    && $rowClone.prev().index() >= indexLimit[role]) {
                    $rowClone.prev().insertAfter($rowClone);
                }
            }
            // remove the slot that the new player just displaced
            $rowClone.next().remove();
            // hide the old row in the free agents table
            $row.hide();
            // else the button must be in the roster table
        } else {
            // get the playerId of the row
            var playerId = $row.attr("playerId");
            // show the row in the free agents table with this playerId

            // Check if the removed player is part of the selected filter and show the player on the agents table if filter is there.
            // This way it doesnt add a player if the filter does not include the player in the agents table. 
            var filter = $(".nav-tabs li.active a").attr("value");
            var playerTeamId = $row.attr("teamId");
            if (!filter || filter === playerTeamId || filter === role) {
                $(".playerRow").filter(function () {
                    return $(this).attr("playerId") === playerId;
                }).show();
            }
            // attach an empty slot to the roster table at bottom of the role section
            // with the appropriate role coloring
            var $emptyRosterSlot = $('<tr class="emptyRosterSlot" role="' + role + '"><td><div class="playerPicContainerMinHeight"></div></td><td></td><td></td><td></td><td></td></tr>');
            // mobile needs 1 less column
            if (mobile) {
                $emptyRosterSlot = $('<tr class="emptyRosterSlot" role="' + role + '"><td><div class="playerPicContainerMinHeight"></div></td><td></td><td></td><td></td></tr>');
            }
            $emptyRosterSlot.insertAfter($("#rosterTable tr")[indexLimit[role] + 4]);
            // remove the roster row
            $row.remove();
        }
        updateDbRoster();
    });

    //send email
    $("#send-report").on("click", function (e) {
        e.preventDefault();
        var data = {
            title: $("#report-title").val(),
            message: $("#report-message").val()
        }
        $.ajax({
            type: "POST",
            url: "/sendreport",
            data: data,
            success: function (response) {
            },
            error: function () {
            }
        });
        $(".report-form")[0].reset(); 
        $('#report-ticket').modal('hide');
        $('#confirm-report').modal('show'); 
        });
});

function updateDbRoster() {
    var $rosterRows = $("#rosterTable tr");
    var ids = [];
    // start with index 1 to ignore the table header
    for (var r = 1; r < $rosterRows.length; r++) {
        ids.push($($rosterRows[r]).attr("playerid"));
    }
    var data = {
        roster: ids
    }
    $.ajax({
        type: "POST",
        url: "/api/updateRoster",
        data: JSON.stringify(data),
        contentType: "application/json",
        dataType: "json"
    }, function (err, res) {
    }).done(function (res) {
        // if not logged in, redirect home
        if (res.redirect) {
            window.location.href = res.redirect;
        }
        if (res.toast) {
            toast(res.toast);
        }
    });
};


// takes button object and toggles button plus and minus
function toggleButton($button) {
    if ($button.hasClass("btn-danger")) {
        $button.toggleClass("btn-danger btn-primary");
        $button.find("span").toggleClass("glyphicon-minus glyphicon-plus");
    } else if ($button.hasClass("btn-primary")) {
        $button.toggleClass("btn-primary btn-danger")
        $button.find("span").toggleClass("glyphicon-plus glyphicon-minus");
    }
}

function toast(message) {
    var $toast = $('<div class="toast"></div>');
    $("body").append($toast);
    $toast.text(message);
    $toast.addClass("show");
    setTimeout(function () {
        $toast.removeClass("show");
    }, 3000);
}
