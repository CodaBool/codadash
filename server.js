// setup for mom, who can connect to heroku db no problem unlike p4a
require('dotenv').config({ path:'/home/codabool/codadash/.env' })
const express = require('express')
const { Pool } = require('pg')
const app = express()
const cors = require('cors')

app.use(cors())

const pool = new Pool({
  connectionString: process.env.PG_REMOTE_URI,
  ssl: { rejectUnauthorized: false },
  max: 1
})

async function query(q, values) {
  return await pool.query(q, values)
    .then(res => {
      return res
    })
    .catch(err => {
      console.log('query error', err)
      return {err: err.message} // passes to nearest error handler
    })
}

app.get('/blog', async (req, res) => {
  try {
    const result = await query('SELECT * FROM post', [])
    let totalViews = 0
    for (const page in result.rows) {
      console.log(totalViews, ' + ', Number(result.rows[page].views))
      totalViews = totalViews + Number(result.rows[page].views)
    }
    const inReview = await query("SELECT * FROM comment WHERE status='review'", [])
    res.status(200).json({stat: result.rows, inReview: inReview.rows, totalViews})
  } catch (err) {
    console.log(err)
    res.status(400).send('General Error Cannot Stats')
  }
});

app.use((req, res) => {
  res.status(404).send("Sorry, that route doesn't exist");
});

app.listen(3001, () => {
  console.log('Express started at ', 3001, 'http://localhost:3001');
});