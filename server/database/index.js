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


let productSchema = mongoose.Schema({
  id: String,
});

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


let getProductQA = async (query, cb) => {
  let qaRes = {};
  await database['questions'].find({ 'product_id': query.product_id })
    .sort({ id: "asc" })
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
};

module.exports.insertOne = insertOne;
module.exports.insertMany = insertMany;
module.exports.getProductQA = getProductQA;