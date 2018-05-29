'use strict';
// REVIEW: Check out all of our new arrow function syntax!

const pg = require('pg');
const fs = require('fs');
const cors = require('cors');
const express = require('express');
const superagent = ('superagent');
const conString = '';

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;
// const TOKEN = process.env.TOKEN;

const client = new pg.Client(process.env.DATABASE_URL);

//API Endpoint from data.seattle.gov
//https://data.seattle.gov/resource/y7pv-r3kh.json

loadCrimeDB();


app.get('/', (request, response) => response.send(`It's ALLLLIIIIVEEE!!`));

app.get('data/crimeData.json', (request, response)=> {
  console.log(request);
  let SQL = 'SELECT * FROM crime_reports';
  let values = [req.params.id];
  
  client.query(SQL, values)
    .then(results => res.send(results.rows))
    .catch(console.error);

})

//MVP
//We need an app.get to request the information from the seattle.gov site
//We need to create a table for inputing the information from the Seattle.gov site so we don't need to create new calls each time
//We need to create a searchable query to return specific information for an area based on user concern/interest
//We need an app.XXX to get information based on the address entered *OR* we need a way to filter the information from the user to be specific to a "100-block" area since that is how the files are separated.

//STRETCH
//We need an app.get to request the Google Maps API
//We need an 






app.get('*', (request, response) => response.redirect(CLIENT_URL));


app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// export PORT=3000
// export CLIENT_URL=http://localhost:8080
// export TOKEN=1234 # Please make your own PIN
// export GOOGLE_API_KEY=your google books api key
// Mac:     export DATABASE_URL=postgres://localhost:5432/books_app
// Windows: export DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/books_app





//////// ** DATABASE LOADERS ** ////////
////////////////////////////////////////

function loadReports() {
  let SQL = 'SELECT COUNT(*) FROM crime_reports';
  client.query( SQL )
  .then(result => {
    if(!parseInt(result.rows[0].count)) {
      fs.readFile('https://data.seattle.gov/resource/y7pv-r3kh.json', 'utf8', (err, fd) => {
        JSON.parse(fd).forEach(element => {
                          let SQL = `
              INSERT INTO crime_reports (
                report_id,
                rms_cdw_id,
                general_offense_number,
                offense_code,
                offense_code_extension,
                offense_type,
                summary_offense_code,
                summarized_offense_description,
                date_reported,
                occurred_date_or_date_range_start,
                occurred_date_range_end,
                hundred_block_location,
                district_sector,
                zone_beat,
                census_tract_2000,
                longitude,
                latitude,
                location,
                month,
                year)
              VALUES (default, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19);`;
            let values = [
              element.rms_cdw_id,
              element.general_offense_number,
              element.offense_code,
              element.offense_code_extension,
              element.offense_type,
              element.summary_offense_code, element.summarized_offense_description, element.date_reported, element.occurred_date_or_date_range_start, element.occurred_date_range_end, element.hundred_block_location,
              element.district_sector,
              element.zone_beat,
              element.census_tract_2000,
              element.longitude,
              element.latitude,
              element.location,
              element.month,
              element.year];
            client.query( SQL, values )
              .catch(console.error);
          })
        })
      }
    })
}

function loadCrimeDB() {
    //LOOK UP FLOATING TIMESTAMP

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
      date_reported DATETIME(YYYY-MM-DD[ hh:mm:ss[.mmm]]),
      occurred_date_or_date_range_start DATETIME(YYYY-MM-DD[ hh:mm:ss[.mmm]]),
      occurred_date_range_end DATETIME(YYYY-MM-DD[ hh:mm:ss[.mmm]]),
      hundred_block_location VARCHAR(50),
      district_sector VARCHAR(5),
      zone_beat VARCHAR(5),
      census_tract_2000 VARCHAR(15),
      longitude DOUBLE,
      latitude DOUBLE,
      location VARCHAR(100),
      month INTEGER,
      year INTEGER
    );`
  )
  //create new loadReports FUNCTION
    .then(loadReports)
    .catch(console.error);
}

// function loadReports() {
              //   let SQL = 'SELECT COUNT(*) FROM crime_reports';
              //   client.query( SQL )
              //     .then(result => {
              //       if(!parseInt(result.rows[0].count)) {
              //         fs.readFile('https://data.seattle.gov/resource/y7pv-r3kh.json', 'utf8', (err, fd) => {
              //           JSON.parse(fd).forEach(element => {
              //             let SQL = `
              //               INSERT INTO crime_reports(report_id, rms_cdw_id, general_offense_number, offense_code, offense_code_extension, offense_type, summary_offense_code, summarized_offense_description, date_reported, occurred_date_or_date_range_start, occurred_date_range_end, hundred_block_location, district_sector, zone_beat, census_tract_2000, longitude, latitude, location, month, year)
              //               SELECT report_id, $1, $2, $3, $4, $,5 $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
              //             ;`;
              //             let values = [element.report_id, element.rms_cdw_id, element.general_offense_number, element.offense_code, element.offense_code_extension, element.offense_type, element.summary_offense_code, element.summarized_offense_description, element.date_reported, element.occurred_date_or_date_range_start, element.occurred_date_range_end, element.hundred_block_location, element.district_sector, element.zone_beat, element.census_tract_2000, element.longitude, element.latitude, element.location, element.month, element.year];
              //             client.query( SQL, values )
              //               .catch(console.error);
              //           })
              //         })
              //       }
              //     })
              // }
              
              // function loadCrimeDB() {
              //     //LOOK UP FLOATING TIMESTAMP
              
              //   client.query(`
              //     CREATE TABLE IF NOT EXISTS
              //     crime_reports (
              //       report_id SERIAL PRIMARY KEY,
              //       rms_cdw_id VARCHAR(30),
              //       general_offense_number VARCHAR(30),
              //       offense_code VARCHAR(10),
              //       offense_code_extension VARCHAR(5),
              //       offense_type VARCHAR(50),
              //       summary_offense_code VARCHAR(10),
              //       summarized_offense_description VARCHAR(50),
              //       date_reported DATETIME(YYYY-MM-DD[ hh:mm:ss[.mmm]]),
              //       occurred_date_or_date_range_start DATETIME(YYYY-MM-DD[ hh:mm:ss[.mmm]]),
              //       occurred_date_range_end DATETIME(YYYY-MM-DD[ hh:mm:ss[.mmm]]),
              //       hundred_block_location VARCHAR(50),
              //       district_sector VARCHAR(5),
              //       zone_beat VARCHAR(5),
              //       census_tract_2000 VARCHAR(15),
              //       longitude DOUBLE,
              //       latitude DOUBLE,
              //       location VARCHAR(100),
              //       month INTEGER,
              //       year INTEGER,
              //     );`
              //   )
              //   //create new loadReports FUNCTION
              //     .then(loadReports)
              //     .catch(console.error);
              // }
