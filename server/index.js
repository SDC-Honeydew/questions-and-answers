const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// List Questions
// Retrieves a list of questions for a particular product. This list does not include any reported questions.

app.get('/qa/questions', (req, res) => {
  let query = {};
  query.product_id = req.query.product_id;
  query.page = Number(req.query.page) || 1;
  query.count = req.query.count || 5;
  console.log('Got query for product:', query);
  db.getProductQA(query, (err, docs) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }
    //let result = {};
    //console.log(result);
    res.send(docs);
    res.end();
  });
})

// Answers List
// Returns answers for a given question. This list does not include any reported answers.

app.get('/qa/questions/:question_id/answers', (req, res) => {

});

// Add a Question
// Adds a question for the given product

app.post('/qa/questions', (req, res) => {

});


// Add an Answer
// Adds an answer for the given question
app.post('/qa/questions/:question_id/answers', (req, res) => {

});

// Mark Question as Helpful
// Updates a question to show it was found helpful.

app.put('/qa/questions/:question_id/helpful', (req, res) => {

});


// Report Question
// Updates a question to show it was reported. Note, this action does not delete the question, but the question will not be returned in the above GET request.

app.put('/qa/questions/:question_id/report', (req, res) => {

});


// Mark Answer as Helpful
// Updates an answer to show it was found helpful.

app.put('/qa/answers/:answer_id/helpful', (req, res) => {

});

// Report Answer
// Updates an answer to show it has been reported. Note, this action does not delete the answer, but the answer will not be returned in the above GET request.

app.put('/qa/answers/:answer_id/report', (req, res) => {

});

const server = app.listen(port, () => {
  console.log('listening on port ', port);
})


module.exports.app = app;
module.exports.server = server;
module.exports.db = db;
