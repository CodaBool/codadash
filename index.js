require('dotenv').config()
const express = require('express')
// const { Pool } = require('pg')
const { format } = require('timeago.js')
const app = express()
const cors = require('cors')
const quotes = require("./quotes.js")

app.use(cors())

// const pool = new Pool({
//   connectionString: process.env.PG_REMOTE_URI,
//   ssl: { rejectUnauthorized: false },
//   max: 1
// })
// async function query(q, values, pool) {
//   return await pool.query(q, values)
//     .then(res => {
//       return res
//     })
//     .catch(err => {
//       console.log('query error', err)
//       return {err: err.message} // passes to nearest error handler
//     })
// }

app.get('/quote', function (req, res) {
  const item = quotes[Math.floor(Math.random() * quotes.length)]
  res.status(200).send(item)
});

// app.get('/all', function (req, res) {
//   getTables()
//     .then(response => {
//       console.log('res', response)
//       res.status(200).json(response)
//     })  
// });

// app.get('/stats', async (req, res) => {
//   try {
//     const result = await query('SELECT * FROM post', [])
//     let totalViews = 0
//     for (const page in result.rows) {
//       console.log(totalViews, ' + ', Number(result.rows[page].views))
//       totalViews = totalViews + Number(result.rows[page].views)
//     }
//     const inReview = await query('SELECT COUNT(*) FROM comment WHERE status=\'review\'', [])
//     res.status(200).json({stat: result.rows, inReview: inReview.rows[0].count, totalViews})
//   } catch (err) {
//     console.log(err)
//     res.status(400).send('General Error Cannot Stats')
//   }
// });

app.use(function(req, res) {
  res.status(404).send("Sorry, that route doesn't exist");
});

app.listen(5052, function () {
  console.log('Started on port', 5052, 'http://localhost:5052');
});

// async function getTables() {
//   let data = []
//   let result = {}
//   try {
//     result = await query('SELECT * FROM p4a', [], pool)
//     delete result.rows[0].id
//     result.rows[0]['Last Ran'] = format(result.rows[0]['Last Ran'])
//     data.push(result.rows[0])
//     result = await query('SELECT * FROM p8a', [], pool)
//     delete result.rows[0].id
//     result.rows[0]['Last Ran'] = format(result.rows[0]['Last Ran'])
//     data.push(result.rows[0])
//     result = await query('SELECT * FROM mom', [], pool)
//     delete result.rows[0].id
//     result.rows[0]['Last Ran'] = format(result.rows[0]['Last Ran'])
//     data.push(result.rows[0])
//   } catch(err) {
//     console.log(err)
//   } finally {
//     await pool.end()
//   }
//   return data
// }
