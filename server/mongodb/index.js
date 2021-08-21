const mongoose = require('mongoose');
const dbIP = process.env.dbIP;

if (!dbIP) {
  thorw new error('database ip is not specified');
}

mongoose.connect(`mongodb://${dbIP}:27017/qa`);
//mongoose.connect('mongodb://54.166.201.206:27017/qa');
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', () => {
  console.log('connected');
});

let photoSchema = mongoose.Schema({
  id: String,
  answer_id: String,
  url: String
});

photoSchema.index({ answer_id: 1 });
photoSchema.index({ id: 1 }, { unique: true });

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
answerSchema.index({ id: 1 }, { unique: true })

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
questionSchema.index({ id: 1 }, { unique: true })

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


let getAnswers = async (query, cb) => {
  let result = {};
  result.question_id = query.question_id;
  result.page = query.page;
  result.count = query.count;
  await database['answers'].find({ 'question_id': query.question_id, 'reported': false })
    .sort({ date: "desc" })
    .limit(query.count)
    .skip((query.page - 1) * query.count)
    .then((answers) => {
      result.answers = answers.map((answer) => {
        let ret = {};
        ret.id = Number(answer.id);
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
      return null;
    })
  cb(null, result);
}


let getQuestions = async (query, cb) => {
  console.log(questionSchema.indexes());
  let result = {};
  result.product_id = query.product_id;
  await database['questions'].find({ 'product_id': query.product_id, 'reported': false })
    .sort({ date: "desc" })
    .limit(query.count)
    .skip((query.page - 1) * query.count)
    .then((questions) => {
      result.results = questions.map(item => {
        let ret = {};
        ret.question_id = Number(item.id);
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
      return null;
    });
  for (let question of result.results) {
    await database['answers'].find({ 'question_id': question.question_id, 'reported': false })
      .sort({ date: "desc" })
      .then((answers) => {
        question.answers = answers.map((answer) => {
          let ret = {};
          ret.id = Number(answer.id);
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
        return null;
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

let addQuestion = async (question, cb) => {
  question.id = mongoose.Types.ObjectId().toString();
  await database['questions']
    .create(
      question,
      (err, res) => {
        if (err) {
          console.log("error!!!:", err);
          return;
        }
        cb(null, res);
      }
    );
}


let addAnswer = async (answer, photos, cb) => {
  answer.id = mongoose.Types.ObjectId().toString();
  await database['questions']
    .create(answer)
    .then((result) => { console.log(result) })
    .catch((err) => {
      cb(err, null);
      return null;
    });
  for (let photo of photos) {
    photo.answer_id = answer.id;
    photo.id = mongoose.Types.ObjectId().toString();
    await database['answers_photos']
      .create(photo)
      .then((result) => { console.log(result) })
      .catch((err) => {
        cb(err, null);
        return null;
      });
  }
  cb(null);
}

let markHelpful = async (type, id, cb) => {
  let helpfulness = 0;
  await database[type]
    .findOne({ 'id': id })
    .then((result) => {
      console.log(result);
      helpfulness = result.helpfulness + 1;
    })
    .catch(err => {
      cb(err);
      return null;
    });
  await database[type]
    .findOneAndUpdate({ 'id': id }, { 'helpfulness': helpfulness })
    .catch(err => {
      cb(err);
      return null;
    });
  cb(null);
}

let markReported = async (type, id, cb) => {
  await database[type]
    .findOneAndUpdate({ 'id': id }, { reported: true })
    .then((result) => {
      console.log(result);
    })
    .catch(err => {
      cb(err);
    })
  cb(null);
}

let dropCollection = (type) => {
  return mongoose.connection.dropCollection(type);
}

module.exports.insertOne = insertOne;
module.exports.insertMany = insertMany;
module.exports.getQuestions = getQuestions;
module.exports.getAnswers = getAnswers;
module.exports.addQuestion = addQuestion;
module.exports.addAnswer = addAnswer;
module.exports.markHelpful = markHelpful;
module.exports.markReported = markReported;
module.exports.dropCollection = dropCollection;