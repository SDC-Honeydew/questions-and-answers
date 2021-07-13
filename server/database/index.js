const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/qa');
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', () => {
  console.log('connected');
});

let answerSchema = mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  body: String,
  date: Date,
  answerer_name: String,
  helpfulness: Number,
  photos: [String]
});


let questionSchema = mongoose.Schema({
  question_id: mongoose.Schema.Types.ObjectId,
  question_body: String,
  question_date: Date,
  asker_name: String,
  question_helpfulness: Number,
  reported: Boolean,
  answers: [answerSchema]
});


let qaSchema = mongoose.Schema({
  product_id: mongoose.Schema.Types.ObjectId,
  results: [questionSchema]
});