const db = require('./mongodb');
const fs = require('fs');
const csv = require('csv-parser');
const { Writable } = require('stream');


let dataTables = ['answers_photos', 'questions', 'answers'];

let preprocess = (type, row) => {
  let doc = {};
  if (type === 'answers') {
    doc.id = row.id;
    doc.question_id = row.question_id;
    doc.body = row.body;
    doc.date = new Date(Number(row.date_written));
    doc.answerer_name = row.answerer_name;
    doc.answerer_email = row.answerer_email;
    doc.helpfulness = Number(row.helpful);
    doc.reported = Boolean(Number(row.reported));
  } else if (type === 'questions') {
    doc.id = row.id;
    doc.product_id = row.product_id;
    doc.body = row.body;
    doc.date = new Date(Number(row.date_written));
    doc.asker_name = row.asker_name;
    doc.asker_email = row.asker_email;
    doc.helpfulness = Number(row.helpful);
    doc.reported = Boolean(Number(row.reported));
  } else if (type === 'answers_photos') {
    doc.id = row.id;
    doc.answer_id = row.answer_id;
    doc.url = row.url;
  }
  return doc;
}


var dataBulk = [];

let readData = (type, successCB) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(`${type}.csv`)
      .pipe(csv({}, { objectMode: true }))
      .pipe(new Writable({
        write: (json, encoding, callback) => {
          let doc = preprocess(type, json);
          dataBulk.push(doc);
          if (dataBulk.length === 5000) {
            db.insertMany(type, dataBulk, () => {
              dataBulk = [];
              callback();
            });
          } else {
            callback();
          }
        },
        objectMode: true
      }))
      .on('finish', () => {
        if (dataBulk.length > 0) {
          db.insertMany(type, dataBulk, () => {
            dataBulk = [];
            console.log(`${type}.CSV file processed successfully`);
            successCB();
            resolve();
          })
        } else {
          console.log(`${type}.CSV file processed successfully`);
          successCB();
          resolve();
        }
      });
  })
};


let readAllTheCSVs = async () => {
  for (var item of dataTables) {
    await db.dropCollection(item);
    await readData(item, () => {
      console.log(`${type}.CSV file processed successfully`);
    });
  }
}

readAllTheCSVs();
