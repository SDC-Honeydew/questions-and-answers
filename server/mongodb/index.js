const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/qa');
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', () => {
  console.log('connected');
});

let photoSchema = mongoose.Schema({
  id: String,
  answer_id: String,
  url: String
});

photoSchema.index({ answer_id: 1 })

let answerSchema = mongoose.Schema({
  id: String,
  question_id: String,
  body: String,
  date: Date,
  answerer_name: String,
  answerer_email: String,
  helpfulness: Number,
  reported: Boolean
});

answerSchema.index({ question_id: 1 })

let questionSchema = mongoose.Schema({
  id: String,
  product_id: String,
  body: String,
  date: Date,
  asker_name: String,
  asker_email: String,
  helpfulness: Number,
  reported: Boolean,
});

questionSchema.index({ product_id: 1 })


let database = {};

database['questions'] = mongoose.model('questions', questionSchema);
database['answers'] = mongoose.model('answers', answerSchema);
database['answers_photos'] = mongoose.model('answers_photos', photoSchema);


let insertOne = async (type, doc, cb) => {
  await database[type].create(
    doc,
    (err, res) => {
      if (err) {
        console.log("error!!!:", err);
        return;
      }
      console.log(res.id / 6879306);
    }
  );
};

let insertMany = async (type, docs, cb) => {
  await database[type].insertMany(
    docs,
    (err, res) => {
      if (err) {
        console.log("error!!!:", err);
        return;
      }
      cb();
      console.log('' + type + ':' + res[res.length - 1].id);
    }
  );
};


let getQuestions = async (query, cb) => {
  let result = {};
  await database['questions'].find({ 'product_id': query.product_id })
    .sort({ date: "desc" })
    .limit(query.count)
    .skip((query.page - 1) * query.count)
    .then((res) => {
      result.product_id = query.product_id;
      result.results = res.map(item => {
        let ret = {};
        ret.question_id = item.id;
        ret.question_body = item.body;
        ret.question_date = item.date.toString();
        ret.asker_name = item.asker_name;
        ret.asker_email = item.asker_email;
        ret.question_helpfulness = item.helpfulness;
        ret.reported = item.reported;
        return ret;
      });
    })
    .catch((err) => {
      cb(err, null);
      return;
    });
  for (let question of result.results) {
    await database['answers'].find({ 'question_id': question.question_id })
      .sort({ date: "desc" })
      .then((answers) => {
        question.answers = answers.map((answer) => {
          let ret = {};
          ret.id = answer.id;
          ret.body = answer.body;
          ret.date = answer.date;
          ret.answerer_name = answer.answerer_name;
          ret.answerer_email = answer.answerer_email;
          ret.reported = answer.reported;
          ret.helpfulness = answer.helpfulness;
          return ret;
        });
      })
      .catch(err => {
        cb(err, null);
        return;
      })
  }
  for (let question of result.results) {
    for (let answer of question.answers) {
      await database['answers_photos'].find({ 'answer_id': answer.id })
        .then((photos) => {
          answer.photos = photos.map((photo) => photo.url);
        })
    }
  }

  cb(null, result);
};

module.exports.insertOne = insertOne;
module.exports.insertMany = insertMany;
module.exports.getQuestions = getQuestions;
module.exports.connection = mongoose.connection;