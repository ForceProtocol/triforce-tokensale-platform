var tfSocket = {
  listen: function (callback) {
    var api_url = $('#environmentApi').val();
    var initialSocket = io.sails.connect(api_url);

    console.log('connecting to socket', initialSocket);
    tfSocket.connect(initialSocket, function (newSocket) {
      console.log('connected, ', newSocket);
      tfSocket.socket = newSocket;
      tfSocket.subscribeToNotifications();
      tfSocket.listenToNotifications(callback);

      newSocket.on('reconnect', function () {
        console.log('reconnected', newSocket);
        tfSocket.socket = newSocket;
        tfSocket.subscribeToNotifications(newSocket, callback);
      });
    });
  },

  connect: function (socket, callback) {
    socket.on('connect', function () {
      return callback(socket);
    })
  },
  subscribeToNotifications : function() {
    if(typeof TOKEN === 'undefined')return;
    console.log('requesting socket registry', TOKEN);
    tfSocket.socket.get('/subscribe/online/', { token: TOKEN }, function(response) {console.log('response for online subscribe, ', response)});
  },
  listenToNotifications: function (callback) {
    console.log('subscribing to txns');
    tfSocket.socket.on('ico/user/txn', callback);
  }
};

$(document).ready(function () {
  tfSocket.listen(function (rsp) {
    console.log('got response: ', rsp);
  });
});
