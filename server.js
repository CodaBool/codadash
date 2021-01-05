// require('dotenv').config({ path:'/home/codabool/express/.env' })
require('dotenv').config()
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

app.get('/stats', async (req, res) => {
  try {
    const result = await query('SELECT * FROM post', [])
    let totalViews = 0
    for (const page in result.rows) {
      console.log(totalViews, ' + ', Number(result.rows[page].views))
      totalViews = totalViews + Number(result.rows[page].views)
    }
    const inReview = await query('SELECT COUNT(*) FROM comment WHERE status=\'review\'', [])
    res.status(200).json({stat: result.rows, inReview: inReview.rows[0].count, totalViews})
  } catch (err) {
    console.log(err)
    res.status(400).send('General Error Cannot Stats')
  }
});

app.use((req, res) => {
  const uri = process.env.PG_REMOTE_URI || 'some ssl issue'
  res.status(404).send(uri);
});

app.listen(3002, () => {
  console.log('Express started at ', 3002, 'http://localhost:3002');
});