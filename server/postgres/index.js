const { Client } = require('pg');
const client = new Client(
  {
    database: 'qa',
    user: 'postgres',
    password: '123456'
  }
);

client.connect()
  .then(() => console.log('Connected'))
  .catch(err => console.log('Error connecting' + err));

let getQuestions = (query) => {
  let questionsQuery = `SELECT * FROM questions WHERE product_id = $1 ORDER BY question_id ASC OFFSET $2 LIMIT $3`;
  let values = [query.product_id, query.page, query.count];

  return client.query(questionsQuery, values)
    .then(async (res) => {
      let questions = res.rows;

      for (let question of questions) {
        let answersQuery = `SELECT * FROM answers WHERE question_id = $1 ORDER BY answer_id`
        let answers = await getAnswers(question.question_id, null, null, answersQuery);
        question.answers = answers;
      }
      return questions;
    })
    .catch((err) => {
      console.log('DB ERROR GETTING ALL QUESTIONS', err);
      throw err;
    })
};

let getAnswers = (question_id, offset, limit, answersQuery) => {
  let values;
  if (answersQuery === undefined) {
    answersQuery = `SELECT * FROM answers WHERE question_id = $1 ORDER BY answer_id ASC OFFSET $2 LIMIT $3`;
    values = [question_id, offset, limit];
  } else {
    values = [question_id];
  }

  return client.query(answersQuery, values)
    .then(async (res) => {
      // console.log('DB ALL ANSWERS', res.rows);
      let answers = res.rows;

      for (let answer of answers) {
        let photos = await getPhotos(answer.answer_id);
        answer.photos = photos;
      }

      // console.log('DB ANSWERS AFTER ADDING ALL PHOTOS', answers);
      return answers;
    })
    .catch((err) => {
      console.log('DB ERROR GETTING ALL ANSWERS', err);
      throw err;
    })
}

let getPhotos = (answer_id) => {
  let photosQuery = `SELECT id, url FROM photos WHERE answer_id = ${answer_id} ORDER BY id ASC`;
  return client.query(photosQuery)
    .then((res) => {
      // console.log('DB ALL PHOTOS', res.rows);
      return res.rows;
    })
    .catch((err) => {
      console.log('DB ERROR GETTING ALL PHOTOS', err);
      throw err;
    })
};


module.exports.getQuestions = getQuestions;