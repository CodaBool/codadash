require('dotenv').config()
const express = require('express')
const { Pool } = require('pg')
const { format } = require('timeago.js')
const app = express()
const cors = require('cors')
const quotes = require("./quotes.js")

app.use(cors())

async function query(q, values, pool) {
  return await pool.query(q, values)
    .then(res => {
      return res
    })
    .catch(err => {
      return {err: err.message} // passes to nearest error handler
    })
}

app.get('/home', function (req, res) {
  console.log(getStats())
  res.status(200).send('codabool rise up')
});
app.get('/quote', function (req, res) {
  const item = quotes[Math.floor(Math.random() * quotes.length)]
  res.status(200).send(item)
});
app.get('/all', function (req, res) {
  getTables()
    .then(response => {
      console.log('res', response)
      res.status(200).json(response)
    })  
});

app.use(function(req, res) {
  res.status(404).send("Sorry, that route doesn't exist");
});

app.listen(5050, function () {
  console.log('Started on port', 5050, 'http://localhost:5050');
});

async function getStats() {
  let result = {}
  const pool = new Pool({
    connectionString: process.env.PG_REMOTE_URI,
    ssl: { rejectUnauthorized: false },
    max: 1, // default = 10
  })
  try {
    result = await query('SELECT * FROM mom;', [], pool)
  } catch(err) {
    console.log(err)
  } finally {
    await pool.end()
  }
  return result
}

async function getTables() {
  let data = []
  let result = {}
  const pool = new Pool({
    connectionString: process.env.PG_LOCAL_URI,
    ssl: { rejectUnauthorized: false },
    max: 1, // default = 10
  })
  try {
    result = await query('SELECT * FROM p4a;', [], pool)
    delete result.rows[0].id
    result.rows[0]['Last Ran'] = format(result.rows[0]['Last Ran'])
    data.push(result.rows[0])
    result = await query('SELECT * FROM p8a;', [], pool)
    delete result.rows[0].id
    result.rows[0]['Last Ran'] = format(result.rows[0]['Last Ran'])
    data.push(result.rows[0])
    result = await query('SELECT * FROM mom;', [], pool)
    delete result.rows[0].id
    result.rows[0]['Last Ran'] = format(result.rows[0]['Last Ran'])
    data.push(result.rows[0])
  } catch(err) {
    console.log(err)
  } finally {
    await pool.end()
  }
  return data
}
