$(document).ready(function () {
  var socket = io();

  if(loggedIn)
    getChatHistory();

  $('#chat-icon').on("click", function () {
    $("#chat-window").show();
    $('#chat-icon').hide();
  })

  $('#minimize-icon').on("click", function () {
    $("#chat-window").hide();
    $('#chat-icon').show();
  })



  $('#chat-send').on("click", function () {
    sendChatMessage();
  })

  socket.on('chat message', function (msg) {
    $('#chat-display').append($('<li class="list-group-item">').html(msg));
    var chatscroll = document.getElementById("chat-display");
    chatscroll.scrollTop = chatscroll.scrollHeight;
  });


  jQuery(document).on('keydown', '#messageToSend', function (ev) {
    if (ev.which === 13) {
      sendChatMessage();
    }
  });


  function sendChatMessage() {
    var message = $("#messageToSend").val();
    if (message == "")
      return;
    updateChatHistory();
    var username = $("#messageToSend").data("username");
    socket.emit('chat message', "<span class='bold'>" + username + "</span>" + ": " + message);
    $("#messageToSend").val("");
    return;
  }


})

function updateChatHistory() {
  var message = $("#messageToSend").val();
  var data = {
    message: message
  }
  $.ajax({
    type: "POST",
    url: "/api/updateChatHistory",
    data: JSON.stringify(data),
    contentType: "application/json",
    dataType: "json"
  }, function (err, res) {
    if (err) {
      console.log("could not send chat history to server. Error: " + err);
      return;
    }
  })
};


function getChatHistory() {
  $.get("/api/getChatHistory", function (messages) {
    for (var i = 0; i < messages.length; i++) {
      var username = messages[i].username;
      var message = messages[i].message;
      //concatenate username and message with approperiate span - bold(username) : message
      var msgToDisplay = "<span class='bold'>" + username + "</span>" + ": " + message;
      $('#chat-display').append($('<li class="list-group-item">').html(msgToDisplay));
      var chatscroll = document.getElementById("chat-display");
      chatscroll.scrollTop = chatscroll.scrollHeight;
    }
  })
}

