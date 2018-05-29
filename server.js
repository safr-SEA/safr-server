'use strict';

const pg = require( 'pg' );
const fs = require( 'fs' );
const cors = require( 'cors' );
const express = require( 'express' );
const superagent = require( 'superagent' );
const conString = '';

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL;
// const TOKEN = process.env.TOKEN;

const API_KEY = process.env.SOCRATA_KEY;

const client = new pg.Client( 'postgres://localhost:5432/safr' );
client.connect();

app.use( cors() );
app.use( express.urlencoded( { extended: true } ) );
// app.use(express.json());

app.get( '/', ( req, res ) => res.send( `It's ALLLLIIIIVEEE!!` ) );

loadDB();

app.get( '/data/sea-gov', ( req, res ) => {
  superagent
    .get( 'https://data.seattle.gov/resource/y7pv-r3kh.json' )
    .query( {
      '$where': "(offense_code like '12%' or offense_code like '13%' or offense_code like '16%' or offense_code like '21%') and date_reported > '2018-02-01T12:00:00'",
      '$$app_token': `${ API_KEY }`
    } )
    .then( response => {
      response.body.forEach( ( e ) => {
        let SQL = 'INSERT INTO crime_reports(offense_code, summarized_offense_description, date_reported, hundred_block_location, district_sector, zone_beat, longitude, latitude, location) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING';
        let values = [ e.offense_code, e.summarized_offense_description, e.date_reported, e.hundred_block_location, e.district_sector, e.zone_beat, e.longitude, e.latitude, e.location ];
        client.query( SQL, values )
          .catch( console.error );
      } )
      res.send( response.body );
    } )
    .catch( console.error );
} );

function loadDB() {
  console.log( 'loadDB' );
  client.query( `
    CREATE TABLE IF NOT EXISTS
    crime_reports (
      report_id SERIAL PRIMARY KEY,      
      offense_code VARCHAR(10),      
			summarized_offense_description VARCHAR(50),
			date_reported TIMESTAMPTZ,      
      hundred_block_location VARCHAR(50),
      district_sector VARCHAR(5),
      zone_beat VARCHAR(5),			
			longitude DOUBLE PRECISION,
      latitude DOUBLE PRECISION,
      location VARCHAR(100)			
    );`
  )
    .then( console.log )
    .catch( console.error );
}

app.get( '*', ( request, response ) => response.redirect( CLIENT_URL ) );
app.listen( PORT, () => console.log( `Listening on port: ${ PORT }` ) );

//rms_cdw_id VARCHAR(30),
//general_offense_number VARCHAR(30),
//offense_code_extension VARCHAR(5),
//offense_type VARCHAR(50),
//summary_offense_code VARCHAR(10),
//occurred_date_or_date_range_start TIMESTAMPTZ,
//occurred_date_range_end TIMESTAMPTZ,
//census_tract_2000 VARCHAR(15),
//month INTEGER,
//year INTEGER
