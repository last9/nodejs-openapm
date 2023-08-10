var express = require('express');
var { OpenAPM } = require('../dist/cjs/index.js');
var mysql2 = require('mysql2');
const openapm = new OpenAPM();

openapm.instrument('mysql2');

const app = express();
const pool = mysql2.createPool(
  `mysql://express-app:password@127.0.0.1/express`
);

app.get('/result', (req, res) => {
  pool.getConnection((err, conn) => {
    conn.query(
      'SELECT `id`, `username`, `createdAt`, `updatedAt` FROM `Users` AS `User`'
    );
  });

  res.status(200).json({});
});

app.listen(3000, () => {
  console.log('serving at 3000');
});