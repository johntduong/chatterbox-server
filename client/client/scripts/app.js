// YOUR CODE HERE:
//var messages = [];
var app;
var rooms = new Set();
const ESC_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};
var escapeString = function(map, str) {
  var result = '';
  for (var i = 0; i < str.length; i++) {
    if (Object.keys(map).includes(str[i])) {
      result += map[str[i]];
    } else {
      result += str[i];
    }
  }
  return result;
};

$(document).ready(function() {
  //console.log('hello there i am readya');
  app = {
    server: 'http://127.0.0.1:3000/classes/messages',
    friends: new Set(),
    storage: {},
    selectedRoom: $('#roomSelect').val() || 'lobby',
    username: escapeString(ESC_MAP, window.location.search.slice(window.location.search.indexOf('=') + 1)),
    init: function() {
    },
    send: function(message) {
      $.ajax({
        // This is the url you should use to communicate with the parse API server.
        url: app.server,
        type: 'POST',
        data: JSON.stringify(message),
        contentType: 'application/json',
        success: function (data) {
          console.log('data', data);
          
          app.renderMessage(message);
          console.log('chatterbox: Message sent');
        },
        error: function (data) {
          // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
          console.error('chatterbox: Failed to send message', data);
        }
      });
    },
    fetch: function() {
      $.ajax({
        // This is the url you should use to communicate with the parse API server.
        url: app.server,
        type: 'GET',
        //data: JSON.stringify(message),
        data: 'order=-createdAt',
        //data: {order: '-createdAt'},
        contentType: 'application/json',
        success: function (response) {
          response = JSON.parse(response);
          app.clearMessages();
          console.log(response.results);
          //app.storage = result
          _.each(response.results, function(message) {
            //console.log(message.text);
            if (message.text) {
              if (!rooms.has(message.roomname)) {
                rooms.add(message.roomname);
                app.renderRoom(message.roomname);
              }
              if (app.selectedRoom === message.roomname) {
                app.renderMessage(message);
              }
            }
          });
          //$('#roomSelect').empty();

          console.log(rooms);
        },
        error: function (data) {
          // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
          console.error('chatterbox: Failed to get message', data);
        }
      });
    },
    clearMessages: function() {
      $('#chats').empty();
    },
    renderMessage: function(message) {
      var person = message.username;
      if (app.friends.has(person)) {
        console.log('enter');
        $('#chats').append(`<div style="font-weight:bold"> <a href="#/" class="username"> ${person} </a>${escapeString(ESC_MAP, message.text)}<hr></div>`);
      } else {
        $('#chats').append(`<div> <a href="#/" class="username"> ${person} </a> ${escapeString(ESC_MAP, message.text)} <hr></div>`);
      }
      //$('#main').prepend(`<button class="username"> ${message.username} </button>`);
    },
    addRoom: function(room) {
      console.log(room);
      rooms.add(room);
      //$('.dropdown').append(`<option> ${room} </option>`);
      app.renderRoom(room);
    },
    renderRoom: function(room) {
      console.log(room);
      $('#roomSelect').append(`<option> ${room} </option>`);
    },
    handleUsernameClick: function(value) {
      //add friend to app.friends set
      console.log('friends are', value);
      app.friends.add(value.trim());
    },
    handleSubmit: function(message) {
      app.send(message);
    }
  };

  app.fetch();
  setInterval(function() {
    console.log('fetching');
    app.fetch();
  }, 5000);
  $('#roomSelect').on('change', function() {
    app.selectedRoom = $('#roomSelect').val();
    //app.clearMessages();
    app.fetch();
    // _.each(messages, function(message) {
    //   if (message.roomname === app.selectedRoom) {
    //     app.renderMessage(message);
    //   }
    // });
  });
  $('.addRoom').on('click', function() {
    var newRoom = $('.enterNewRoom').val();
    app.addRoom(newRoom);
    //app.renderRoom(newRoom);
  });
  $('body').on('click', '.username', function(event) { 
    //console.log($(this).text());
    app.handleUsernameClick($(this).text()); 
  });
  $('form').submit(function(event) {
    event.preventDefault();
    var msgObj = {
      username: app.username,
      text: escapeString(ESC_MAP, $('#message').val()),
      roomname: $('#roomSelect').val()
    };
    app.handleSubmit(msgObj);
  });
});