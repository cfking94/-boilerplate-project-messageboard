'use strict'

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const threadSchema = new Schema({
  text: {type: String, required: true},
  reported: {type: Boolean, default: false},
  delete_password: {type: String, required: true},
  replies: [{type: Schema.Types.ObjectId, ref: 'Replies'}],
  replycount: {type: Number, default: 0}
}, {
  timestamps: {createdAt: 'created_on', updatedAt: 'bumped_on'}
});

const replySchema = new Schema({
  thread_id: {type: Schema.Types.ObjectId, ref: 'Threads'},
  text: {type: String, required: true},
  delete_password: {type: String, required: true},
  reported: {type: Boolean, default: false}
}, {
  timestamps: {createdAt: 'created_on', updatedAt: false}
});

const boardSchema = new Schema({
  board: {type: String},
  threads: [{type: Schema.Types.ObjectId, ref: 'Threads'}]
});

const Threads = mongoose.model('Threads', threadSchema);
const Replies = mongoose.model('Replies', replySchema);
const Boards = mongoose.model('Boards', boardSchema);

module.exports = {
  Boards: Boards,
  Threads: Threads,
  Replies: Replies
}