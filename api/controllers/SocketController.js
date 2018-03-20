module.exports = {
  subscribeOnline: (req, res) => {
    if (!req.isSocket) {
      return res.badRequest({error: 'Only sockets can access this.'});
    }
    // On connect
    // Set socket id
    User.findOne({id: req.token.user.id, select: ['id']}).exec(function (err, account) {
      if (err) {
        return res.negotiate(err);
      }

      if (account) {
        account.socketId = req.socket.id;
        account.save();

      } else {
        return res.badRequest({error: 'No account exists.'});
      }
    });
  }
}
