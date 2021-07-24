const express = require('../server');
const supertest = require('supertest');
const request = supertest(express.app);



describe('test', () => {

  test('responds to a get request with the correct content type ', (done) => {
    request.get('/qa/questions?product_id=1&page=1')
      .expect('Content-Type', /json/)
      .end((err, res) => {
        expect(JSON.parse(res.text).results.length).toBe(5);
        return done();
      })
  });

  afterAll(() => {
    express.server.close();
    express.db.connection.close();
  });

})

