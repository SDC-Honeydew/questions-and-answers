const express = require('express');
const bodyParser = require('body-parser');
const db = require('./mongodb');
//const db = require('./postgres');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// List Questions
// Retrieves a list of questions for a particular product. This list does not include any reported questions.


app.get('/loaderio-9835009cb2bab62413a4721f8131bad8', (req, res) => {
  res.send('loaderio-9835009cb2bab62413a4721f8131bad8');
})

app.get('/qa/questions', (req, res) => {
  let query = {};
  query.product_id = req.query.product_id;
  query.page = Number(req.query.page) || 1;
  query.count = Number(req.query.count) || 5;
  console.log('Got query for product:', query);
  db.getQuestions(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.send(results);
  })
})

// Answers List
// Returns answers for a given question. This list does not include any reported answers.

app.get('/qa/questions/:question_id/answers', (req, res) => {
  let query = {};
  query.question_id = req.params.question_id;
  query.page = Number(req.query.page) || 1;
  query.count = Number(req.query.count) || 5;
  console.log('Got query for question:', query);
  db.getAnswers(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.send(results);
  })
});

// Add a Question
// Adds a question for the given product

app.post('/qa/questions', (req, res) => {
  let question = {};
  question.product_id = req.body.product_id;
  question.body = req.body.body;
  question.asker_name = req.body.name;
  question.asker_email = req.body.email;
  question.helpfulness = 0;
  question.reported = false;
  question.date = new Date();
  db.addQuestion(question, (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.send('Question Added')
  })
});


// Add an Answer
// Adds an answer for the given question
app.post('/qa/questions/:question_id/answers', (req, res) => {
  // prepare answer doc
  let answer = {};
  answer.question_id = req.params.question_id;
  answer.body = req.body.body;
  answer.answerer_name = req.body.answerer_name;
  answer.answerer_email = req.body.answerer_email;
  answer.helpfulness = 0;
  answer.reported = false;
  answer.date = new Date();
  // prepare photo doc
  let photos = req.body.photos.map(photo => { return { url: photo } });
  db.addAnswer(answer, photos, (err) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.send('Answer Added')
  })
});

// Mark Question as Helpful
// Updates a question to show it was found helpful.

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  let question_id = req.params.question_id;
  db.markHelpful('questions', question_id, (err) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.send('Quesition Helpful Marked')
  });
});


// Report Question
// Updates a question to show it was reported. Note, this action does not delete the question, but the question will not be returned in the above GET request.

app.put('/qa/questions/:question_id/report', (req, res) => {
  let question_id = req.params.question_id;
  db.markReported('questions', question_id, (err) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.send('Quesition Reported')
  });
});


// Mark Answer as Helpful
// Updates an answer to show it was found helpful.

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  let answer_id = req.params.answer_id;
  db.markHelpful('answers', answer_id, (err) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.send('Answer Helpful Marked')
  });
});

// Report Answer
// Updates an answer to show it has been reported. Note, this action does not delete the answer, but the answer will not be returned in the above GET request.

app.put('/qa/answers/:answer_id/report', (req, res) => {
  let answer_id = req.params.answer_id;
  db.markReported('answers', answer_id, (err) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.send('Answer Reported')
  });
});

const server = app.listen(port, () => {
  console.log('listening on port ', port);
})


module.exports.app = app;
module.exports.server = server;
module.exports.db = db;
