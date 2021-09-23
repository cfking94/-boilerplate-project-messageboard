const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let threadID = '';
  let threadID2 = '';
  let replyID = '';

  // ---------- ---------- Thread ---------- ----------
  suite('Routing Tests for /api/threads/{board}', function() {

    suite('POST', function() {
      test('creating a new thread', function(done) {
        chai
        .request(server)
        .post('/api/threads/general')
        .send({text: 'ppap1', delete_password: 'pw'})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
        });
        chai
        .request(server)
        .post('/api/threads/general')
        .send({text: 'ppap2', delete_password: 'pw'})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
          done();
        });
      });
    });

    suite('GET', function() {
      test('viewing the 10 most recent threads with 3 replies each', function(done) {
        chai
        .request(server)
        .get('/api/threads/general')
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'bumped_on');
          assert.notProperty(res.body[0], 'reported');
          assert.notProperty(res.body[0], 'deleted_password');
          assert.isArray(res.body[0].replies);
          assert.isBelow(res.body[0].replies.length, 4);
          threadID = res.body[0]._id;
          threadID2 = res.body[1]._id;
          done();
        });
      });
    });

    suite('DELETE', function() {
      test('deleting a thread with the incorrect password', function(done) {
        chai
        .request(server)
        .delete('/api/threads/general')
        .send({thread_id: threadID2, delete_password: 'wrongpw'})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });

      test('deleting a thread with the correct password', function(done) {
        chai
        .request(server)
        .delete('/api/threads/general')
        .send({thread_id: threadID2, delete_password: 'pw'})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'success');
          done();
        });
      });
    });

    suite('PUT', function() {
      test('reporting a thread', function(done) {
        chai
        .request(server)
        .put('/api/threads/general')
        .send({thread_id: threadID})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'success');
          done();
        });
      });
    });

  });

  // ---------- ---------- Reply ---------- ----------
  suite('Routing Test for /api/replies/{board}', function() {

    suite('POST', function() {
      test('creating a new reply', function(done) {
        chai
        .request(server)
        .post('/api/replies/general')
        .send({thread_id: threadID, text: 'apple', delete_password: 'pw'})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
          done();
        });
      });
    });

    suite('GET', function() {
      test('viewing a single thread with all replies', function(done) {
        chai
        .request(server)
        .get('/api/replies/general')
        .query({thread_id: threadID})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'application/json');
          assert.property(res.body, '_id');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'bumped_on');
          assert.property(res.body, 'text');
          assert.property(res.body, 'replies');
          assert.notProperty(res.body, 'delete_password');
          assert.notProperty(res.body, 'reported');
          assert.isArray(res.body.replies);
          assert.notProperty(res.body.replies[0], 'delete_password');
          assert.notProperty(res.body.replies[0], 'reported');
          assert.equal(res.body.replies[res.body.replies.length-1].text, 'apple');
          replyID = res.body.replies[res.body.replies.length-1]._id;
          done();
        });
      });
    });

    suite('DELETE', function() {
      test('deleting a reply with the incorrect password', function(done) {
        chai
        .request(server)
        .delete('/api/replies/general')
        .send({thread_id: threadID, reply_id: replyID, deleted_password: 'wrongpw'})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });

      test('deleting a reply with the correct password', function(done) {
        chai
        .request(server)
        .delete('/api/replies/general')
        .send({thread_id: threadID, reply_id: replyID, delete_password: 'pw'})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'success');
          done();
        });
      });
    });

    suite('PUT', function() {
      test('reporting a reply', function(done) {
        chai
        .request(server)
        .put('/api/replies/general')
        .send({thread_id: threadID, reply_id: replyID})
        .end(function(error, res) {
          assert.equal(res.status, 200);
          assert.equal(res.type, 'text/html');
          assert.equal(res.text, 'success');
          done();
        });
      });
    });

  });
});
