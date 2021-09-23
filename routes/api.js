'use strict';

const messageBoard = require('../controllers/handlers.js');

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .post(messageBoard.createThread)
    .get(messageBoard.getThread)
    .delete(messageBoard.deleteThread)
    .put(messageBoard.updateThread);
    
  app.route('/api/replies/:board')
    .post(messageBoard.createReply)
    .get(messageBoard.getReply)
    .delete(messageBoard.deleteReply)
    .put(messageBoard.updateReply);

};
