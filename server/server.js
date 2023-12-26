// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors=require('cors');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Naveen143@',
  database: 'sat_results',
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.log('MySQL connection failed:', err);
  } else {
    console.log('Connected to MySQL');
  }
});
app.post('/api/insert', (req, res) => {
  const { name, address, city, country, pincode, sat_score } = req.body;
  console.log(req.body);  // Add this line to log the request body

  const sql = 'INSERT INTO sat_results (name, address, city, country, pincode, sat_score) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, address, city, country, pincode, sat_score], (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      res.status(500).send('Insert failed');
    } else {
      console.log('Record inserted');
      res.status(200).send('Record inserted');
    }
  });
});

// View all data with Passed/Failed status
app.get('/api/viewAll', (req, res) => {
  const sql = 'SELECT id, name, address, city, country, pincode, sat_score FROM sat_results';
  db.query(sql, (err, result) => {
    if (err) {
      console.log('View all error:', err);
      res.status(500).send('View all failed');
    } else {
      // Calculate 'Passed' dynamically
      const dataWithPassed = result.map((row) => ({
        ...row,
        passed: row.sat_score >= 30 ? 'Pass' : 'Fail',
      }));
      res.status(200).json(dataWithPassed);
    }
  });
});

app.get('/api/getRank/:name', (req, res) => {
  const name = req.params.name;
  const sql = 'SELECT name, FIND_IN_SET(sat_score, (SELECT GROUP_CONCAT(sat_score ORDER BY sat_score DESC) FROM sat_results)) AS scoreRank FROM sat_results WHERE name = ?';
  db.query(sql, [name], (err, result) => {
    if (err) {
      console.log('Get rank error:', err);
      res.status(500).json({ error: 'Get rank failed' });
    } else {
      // Assuming 'scoreRank' is the correct field name returned from the database
      res.status(200).json({ scoreRank: result[0].scoreRank });
    }
  });
});
app.put('/api/updateScore/:name', (req, res) => {
  const name = req.params.name;
  const newScore = req.body.satScore;

  // Update only the sat_score field
  const sql = 'UPDATE sat_results SET sat_score = ? WHERE name = ?';
  db.query(sql, [newScore, name], (err, result) => {
    if (err) {
      console.log('Update score error:', err);
      res.status(500).send('Update score failed');
    } else {
      console.log('Score updated');
      res.status(200).send('Score updated');
    }
  });
});
// View a candidate by name
app.get('/api/viewAllByName/:name', (req, res) => {
  const name = req.params.name;
  const sql = 'SELECT * FROM sat_results WHERE name = ?';
  db.query(sql, [name], (err, result) => {
    if (err) {
      console.log('View by name error:', err);
      res.status(500).send('View by name failed');
    } else {
      res.status(200).json(result);
    }
  });
});
app.put('/api/updateRecord/:name', (req, res) => {
  const name = req.params.name;
  const { address, city, country, pincode } = req.body;

  const sql = 'UPDATE sat_results SET address = ?, city = ?, country = ?, pincode = ? WHERE name = ?';
  db.query(sql, [address, city, country, pincode, name], (err, result) => {
    if (err) {
      console.log('Update record error:', err);
      res.status(500).send('Update record failed');
    } else {
      console.log('Record updated');
      res.status(200).send('Record updated');
    }
  });
});
//Delete one record
app.delete('/api/deleteRecord/:name', (req, res) => {
  const name = req.params.name;
  const sql = 'DELETE FROM sat_results WHERE name = ?';
  db.query(sql, [name], (err, result) => {
    if (err) {
      console.log('Delete record error:', err);
      res.status(500).send('Delete record failed');
    } else {
      console.log('Record deleted');
      res.status(200).send('Record deleted');
    }
  });
});
// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
