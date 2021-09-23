'use strict'

const connectDB = require('../connect-db.js');

const {Threads, Replies, Boards} = require('../models/models.js');

// Connect DB
connectDB();

// ---------- ---------- Thread ---------- ----------
exports.createThread = async function(req, res) {
  try {
    let {board} = req.params;
    let {text, delete_password} = req.body;

    let update = {board: board};
    let options = {upsert: true, new: true};
    let findBoard = await Boards.findOneAndUpdate(
      {board: board},
      update, 
      options
    ).exec();

    // Create new thread
    let newThread = new Threads({
      text: text,
      delete_password: delete_password
    });

    findBoard.threads.push(newThread._id);
   
    await findBoard.save();
    await newThread.save();

    return res.redirect('/b/' + board + '/');
  } catch(error) {
    console.log(error);
  }
}

exports.getThread = async function(req, res) {
  try {
    let {board} = req.params;

    let findBoard = await Boards.findOne({board: board})
    .select({__v: 0})
    .populate({
      path: 'threads',
      sort: {bumped_on: -1},
      select: {reported: 0, delete_password: 0, __v: 0},
      options: {limit: 10},
      populate: {
        path: 'replies',
        select: {reported: 0, delete_password: 0, __v: 0},
        sort: {created_on: -1},
        options: {limit: 3}
      }
    })
    .exec();

    if (!findBoard) {
      return res.send('Not found');
    }

    return res.json(findBoard.threads);
  } catch(error) {
    console.log(error);
  }
}

exports.deleteThread = async function(req, res) {
  try {
    let {board} = req.params;
    let {thread_id, delete_password} = req.body;

    let findBoard = await Boards.findOne({board: board}).exec();

    if (!findBoard) {
      return res.send('Board not found');
    }

    let findThread = await Threads.findOne({_id: thread_id}).exec();

    if (!findThread) {
      return res.send('Thread not found');
    }

    if (findThread.delete_password == delete_password) {
      let removeIndex = findBoard.threads.indexOf(thread_id);
      if (removeIndex > -1) {
        findBoard.threads.splice(removeIndex, 1);
      }

      await findThread.remove();
      await Replies.deleteMany({thread_id: thread_id});

      await findBoard.save();

      res.send('success');
    } else {
      return res.send('incorrect password');
    }
  } catch(error) {
    console.log(error);
  }
}

exports.updateThread = async function(req, res) {
  try {
    let {board} = req.params;
    let {thread_id, report_id} = req.body;

    let findBoard = await Boards.findOne({board: board}).exec();

    if (!findBoard) {
      return res.send('Board not found');
    }
 
    let updateThread;
    let update = {reported: true};
    if ((thread_id && thread_id.length == 24) || report_id) {
      updateThread = await Threads.findOneAndUpdate(
        {_id: thread_id || report_id},
        update,
      );
    }
    
    if (!updateThread) {
      return res.send('Thread not found');
    }

    return res.send('success');
  } catch(error) {
    console.log(error);
  }
}

// ---------- ---------- Reply ---------- ----------
exports.createReply = async function(req, res) {
  try {
    let {board} = req.params;
    let {thread_id, text, delete_password} = req.body;

    let findThread;
    if (thread_id.length == 24) {
      findThread = await Threads.findOne({_id: thread_id}).exec();
    }
    
    if (!findThread) {
      return res.send('Thread not found');
    }

    let newReply = new Replies({
      thread_id: thread_id,
      text: text,
      delete_password: delete_password
    });

    findThread.replies.push(newReply._id);
    findThread.replycount = findThread.replies.length;

    await newReply.save();
    await findThread.save();

    return res.redirect('/b/' + board + '/' + thread_id);
  } catch(error) {
    console.log(error);
  }
}

exports.getReply = async function(req, res) {
  try {
    let {thread_id} = req.query;

    let findThread = await Threads.findOne({_id: thread_id})
    .select({reported: 0, delete_password: 0, __v: 0})
    .populate({
      path: 'replies',
      select: {reported: 0, delete_password: 0, __v: 0}
    })
    .exec()

    if (!findThread) {
      return res.send('Not found');
    }

    return res.json(findThread);
  } catch(error) {
    console.log(error)
  }
}

exports.deleteReply = async function(req, res) {
  try {
    let {board} = req.params;
    let {thread_id, reply_id, delete_password} = req.body;

    let findBoard = await Boards.findOne({board: board}).exec();

    if (!findBoard) {
      return res.send('Board not found');
    }

    let findThread = '';
    if (thread_id.length == 24) {
      findThread = await Threads.findOne({_id: thread_id}).exec();
    } 
    
    if (!findThread) {
      return res.send('Thread not found');
    }

    let findReply = '';
    if (reply_id.length == 24) {
      findReply = await Replies.findOne({_id: reply_id}).exec();
    } 
    
    if (!findReply) {
      return res.send('Reply not found');
    }
    
    if (findReply.delete_password == delete_password) {
      findReply.text = '[deleted]';

      await findReply.save();

      return res.send('success');
    } else {
      return res.send('incorrect password');
    }   
  } catch(error) {
    console.log(error);
  }
}

exports.updateReply = async function(req, res) {
  try {
    let {board} = req.params;
    let {thread_id, reply_id} = req.body;

    let findBoard = await Boards.findOne({board: board}).exec();

    if (!findBoard) {
      return res.send('Board not found');
    }

    let findThread;
    if (thread_id.length== 24) {
      findThread = await Threads.findOne({_id: thread_id}).exec();
    }

    if (!findThread) {
      return res.send('Thread not found');
    }

    let findReply;
    if (reply_id.length == 24) {
      findReply = await Replies.findOne({_id: reply_id}).exec();
    }

    if (!findReply) {
      return res.send('Reply not found');
    }

    findReply.reported = true;
    await findReply.save();

    return res.send('success')
  } catch(error) {
    console.log(error);
  }
}