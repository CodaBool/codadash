// setup for mom, who can connect to heroku db no problem unlike p4a
require('dotenv').config({ path:'/home/codabool/codadash/.env' })
const exec = require('child_process').exec;
const express = require('express')
const { format } = require('timeago.js')
const { Pool } = require('pg')
const app = express()
const cors = require('cors')
const path = require('path')

// app.use(express.static('images'))
app.use(express.static(__dirname + '/images'))
app.use(cors())

const pool_remote = new Pool({
  connectionString: process.env.PG_REMOTE_URI,
  ssl: { rejectUnauthorized: false },
  max: 1
})
const pool_local = new Pool({
  connectionString: process.env.PG_LOCAL_URI
})

async function query(q, values, p) {
  return await p.query(q, values)
    .then(res => {
      return res
    })
    .catch(err => {
      console.log('query error', err)
      return {err: err.message} // passes to nearest error handler
    })
}
function execute(command, callback) {
  exec(command, (error, stdout, stderr) => callback(stdout));
}

app.get('/', async (req, res) => {
  try {
    res.sendFile(path.join(__dirname + '/index.html'))
  } catch (err) {
    res.status(500).send('General Server Error')
  }
});

app.get('/table', async (req, res) => {
  try {
    // remote pg connection
    const result = await query('SELECT * FROM post', [], pool_remote)
    let totalViews = 0
    for (const page in result.rows) {
      totalViews = totalViews + Number(result.rows[page].views)
    }
    const inReview = await query("SELECT * FROM comment WHERE status='review'", [], pool_remote)

    // local pg connection
    const p4a = await query('SELECT * FROM p4a', [], pool_local)
    p4a.rows[0]['Last Ran'] = format(p4a.rows[0]['Last Ran']) // make time ago more readable
    const p8a = await query('SELECT * FROM p8a', [], pool_local)
    p8a.rows[0]['Last Ran'] = format(p8a.rows[0]['Last Ran'])
    const mom = await query('SELECT * FROM mom', [], pool_local)
    mom.rows[0]['Last Ran'] = format(mom.rows[0]['Last Ran'])
    
    // heroku hours
    execute('/home/codabool/scripts/bash-scripts/getHeroku.sh', (output) => {
      const hours = output.replace(/\s/g,'')
      res.status(200).json({ p4a: p4a.rows[0], p8a: p8a.rows[0], mom: mom.rows[0], stat: result.rows, inReview: inReview.rows, totalViews, hours})
    })
  } catch (err) {
    res.status(500).send('General Error Cannot Stats')
  }
});

app.use((req, res) => {
  res.status(404).send("Sorry, that route doesn't exist");
});

app.listen(9001, () => {
  console.log('Express started at ', 9001, 'http://localhost:9001');
});