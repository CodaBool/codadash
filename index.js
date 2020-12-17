var express = require('express')
require('dotenv').config()
const { Client } = require('pg')
const { format } = require('timeago.js')
var app = express()
var cors = require('cors')

app.use(cors())

// Prefer .env but unecessary in this local case
const URI = "postgres://postgres:ven@192.168.1.34:5432"

app.get('/', function (req, res) {
  res.send('This is an express server, the endpoints are p4a, p8a, mom, and all');
});

app.get('/p4a', function (req, res) {
  singleTable('SELECT * FROM p4a;')
    .then(response => res.status(200).json(response))  
});
app.get('/p8a', function (req, res) {
  singleTable('SELECT * FROM p8a;')
    .then(response => res.status(200).json(response))  
});
app.get('/mom', function (req, res) {
  singleTable('SELECT * FROM mom;')
    .then(response => res.status(200).json(response))  
});
app.get('/all', function (req, res) {
  allTables()
    .then(response => res.status(200).json(response))  
});

app.use(function(req, res, next) {
  res.status(404).send("Sorry, that route doesn't exist");
});

app.listen(5050, function () {
  console.log('Started on port', 5050, 'http://localhost:5050');
});

async function singleTable(query) {
  let data = {}
  let client = await new Client({ connectionString: URI })
  try {
    await client.connect()
    const result = await client.query(query)
    data = result.rows[0]
  } catch(err) {
    console.log(err)
  } finally {
    client.end()
  }
  return data
}
async function allTables() {
  let data = []
  let result = {}
  let client = await new Client({ connectionString: URI })
  try {
    await client.connect()
    result = await client.query('SELECT * FROM pi4;')
    delete result.rows[0].id
    result.rows[0]['Last Ran'] = format(result.rows[0]['Last Ran'])
    data.push(result.rows[0])
    result = await client.query('SELECT * FROM pi8;')
    delete result.rows[0].id
    result.rows[0]['Last Ran'] = format(result.rows[0]['Last Ran'])
    data.push(result.rows[0])
    result = await client.query('SELECT * FROM win;')
    delete result.rows[0].id
    result.rows[0]['Last Ran'] = format(result.rows[0]['Last Ran'])
    data.push(result.rows[0])
  } catch(err) {
    console.log(err)
  } finally {
    client.end()
  }
  return data
}
