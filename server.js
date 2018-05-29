'use strict';

const pg = require('pg');
const fs = require('fs');
const cors = require('cors');
const express = require('express');
const superagent = require('superagent');
const conString = '';

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;
// const TOKEN = process.env.TOKEN;

const API_KEY = process.env.SOCRATA_KEY;

const client = new pg.Client(process.env.DATABASE_URL);

app.use(cors());
app.use(express.urlencoded({extended:true}));

app.get('/', (req, res) => res.send(`It's ALLLLIIIIVEEE!!`));

app.get('/data/sea-gov', (req, res) => {
    console.log('get');
    superagent
        .get('https://data.seattle.gov/resource/y7pv-r3kh.json')
        .query({
            '$where': "(offense_code like '12%' or offense_code like '13%' or offense_code like '16%' or offense_code like '21%' or offense_code like '35%') and date_reported > '2018-02-01T12:00:00'",
            '$$app_token': `${API_KEY}`
        })
        .then(response => res.send(response.body))
        .catch(console.error);
});


// function loadReports() {
//     let SQL = 'SELECT COUNT(*) FROM crime_reports';
//     client.query(SQL)
//         .then( result => {
//             if(!parseInt(result.rows[0].count)) {
//                 fs.readFile('./')
//             }

//         })
// }

function loadDB() {
    client.query(`
    CREATE TABLE IF NOT EXISTS
    crime_reports (
      report_id SERIAL PRIMARY KEY,
      rms_cdw_id VARCHAR(30),
      general_offense_number VARCHAR(30),
      offense_code VARCHAR(10),
      offense_code_extension VARCHAR(5),
      offense_type VARCHAR(50),
      summary_offense_code VARCHAR(10),
      summarized_offense_description VARCHAR(50),
      date_reported FLOATING TIMESTAMP,
      occurred_date_or_date_range_start FLOATING TIMESTAMP,
      occurred_date_range_end FLOATING TIMESTAMP,
      hundred_block_location VARCHAR(50),
      district_sector VARCHAR(5),
      zone_beat VARCHAR(5),
      census_tract_2000 VARCHAR(15),
      longitude DOUBLE,
      latitude DOUBLE,
      location VARCHAR(100),
      month INTEGER,
      year INTEGER,
    );`
    )
    .then(console.log)
    .then(loadReports)
    .catch(console.error);
}









app.get('*', (request, response) => response.redirect(CLIENT_URL));
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

