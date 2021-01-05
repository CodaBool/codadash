require('dotenv').config()
const express = require('express')
const { Pool } = require('pg')
const { Client } = require('pg');
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
      console.log('query error', err)
      return {err: err.message} // passes to nearest error handler
    })
}

app.get('/home', async function (req, res) {
  const statObj = await getStats()
  console.log(statObj)
  res.status(200).json(statObj)
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
app.get('/test', async function (req, res) {
  const client = new Client({
    connectionString: process.env.PG_REMOTE_URI,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try{
    await client.connect();
    await client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
      if (err) throw err;
      for (let row of res.rows) {
        console.log(JSON.stringify(row));
      }
    });
  } catch(err) {
    console.log('caught err', err)
  } finally {
    await client.end();
  }
  res.status(200).json({you_should:'check logs'})
});

app.use(function(req, res) {
  res.status(404).send("Sorry, that route doesn't exist");
});

app.listen(5050, function () {
  console.log('Started on port', 5050, 'http://localhost:5050');
});

async function getStats() {
  let result = {}, inReview = {}
  let totalViews = 0
  const pool = new Pool({
    connectionString: process.env.PG_REMOTE_URI,
    ssl: { rejectUnauthorized: false },
    max: 1, // default = 10
  })
  try {
    // console.log('pool', pool)
    // gets the stats for every post
    query('SELECT * FROM post', [], pool)
      .then(res=> console.log(res))
      .catch(err=> console.log(err))
    // for (const page in result.rows) { // find the total number of views
    //   console.log(totalViews, ' + ', Number(result.rows[page].views))
    //   totalViews = totalViews + Number(result.rows[page].views)
    // }
    // // get the number of comments to review
    // inReview = await query('SELECT COUNT(*) FROM comment WHERE status=\'review\'', [], pool)
  } catch(err) {
    console.log(err)
  } finally {
    await pool.end()
  }
  return {stats: result.rows, inReview: inReview.rows, totalViews}
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
    result = await query('SELECT * FROM p4a', [], pool)
    delete result.rows[0].id
    result.rows[0]['Last Ran'] = format(result.rows[0]['Last Ran'])
    data.push(result.rows[0])
    result = await query('SELECT * FROM p8a', [], pool)
    delete result.rows[0].id
    result.rows[0]['Last Ran'] = format(result.rows[0]['Last Ran'])
    data.push(result.rows[0])
    result = await query('SELECT * FROM mom', [], pool)
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
