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

const SOCRATA_KEY = process.env.SOCRATA_KEY;

// const client = new pg.Client( 'postgres://localhost:5432/safr' );
const client = new pg.Client( process.env.DATABASE_URL );
client.connect();

app.use( cors() );
app.use( express.urlencoded( { extended: true } ) );

app.get( '/', ( req, res ) => res.send( `It's ALIVE!` ) );

loadDB();

// app.get('/data/sea-gov', (req, res) => {
//     superagent
//     .get('https://data.seattle.gov/resource/y7pv-r3kh.json')
//         .query({
//             '$where': "(offense_code like '9%' or offense_code like '12%' or offense_code like '13%' or offense_code like '16%' or offense_code like '21%' or offense_code like '22%') and date_reported > '2018-02-28T12:00:00'",
//             '$$app_token': `${SOCRATA_KEY}`
// 				})
//         .then(response => {
// 					response.body.forEach((e) => {
// 						let SQL = 'INSERT INTO safr_sea_dedup_90_day(offense_code, summarized_offense_description, date_reported, hundred_block_location, district_sector, zone_beat, longitude, latitude, location) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT DO NOTHING';
// 						let values = [e.offense_code, e.summarized_offense_description, e.date_reported, e.hundred_block_location, e.district_sector, e.zone_beat, e.longitude, e.latitude, e.location];
// 						client.query(SQL, values)
// 							.catch(console.error);
// 					})
// 					res.send(response.body);
// 				})
//         .catch(console.error);
// });

app.get('/data/sea-gov/latlng', (req, res) => {
	
	console.log(req.query.dataLatLng);
	let dataLatLng = req.query.dataLatLng;
	let dataLat = parseFloat(dataLatLng.lat);
	let dataLng = parseFloat(dataLatLng.lng);

	let SQL = `SELECT * FROM safr_sea_dedup_90_day WHERE (latitude BETWEEN ${dataLat - 0.003} AND ${dataLat + 0.003}) AND (longitude BETWEEN ${dataLng - 0.003} AND ${dataLng + 0.003});`;

	client.query(SQL)
		.then(result => res.send(result.rows))
		.catch(console.error)

});

app.get('/data/sea-gov/latlngall', (req, res) => {
  let SQL = `SELECT * FROM crime_reports`;
  client.query(SQL)
    .then(result => res.send(result.rows))
    .catch(console.error)
});

// DATABASE LOADER

function loadDB() {
  console.log( 'loadDB' );
  client.query( `
    CREATE TABLE IF NOT EXISTS
    safr_sea_dedup_90_day (
    report_id int primary key,
    date_reported timestamptz,
    offense_code varchar (15),
    summarized_offense_description varchar (50),
    summary_offense_code varchar (10),
    rms_cdw_id varchar (15),
    occurred_date_or_date_range_start timestamptz,
    occurred_date_range_end timestamptz,
    census_tract_2000 varchar (25),
    census_tracts_2010 varchar (25),
    zip_codes varchar (10),
    city_council_districts int,
    hundred_block_location varchar (128),
    district_or_sector varchar (5),
    zone_or_beat varchar (5),
    spd_beats int,
    spd_micro_community_policing_plan_areas int,
    longitude varchar (24),
    latitude varchar (24),
    location varchar (48)		
    );`
  )
    .then( console.log )
    .catch( console.error );
}

app.get( '*', ( request, response ) => response.redirect( CLIENT_URL ) );
app.listen( PORT, () => console.log( `Listening on port: ${ PORT }` ) );




// report_id SERIAL PRIMARY KEY,      
//       offense_code VARCHAR(10),      
// 			summarized_offense_description VARCHAR(50),
// 			date_reported TIMESTAMPTZ,      
//       hundred_block_location VARCHAR(50),
//       district_sector VARCHAR(5),
//       zone_beat VARCHAR(5),			
// 			longitude DOUBLE PRECISION,
//       latitude DOUBLE PRECISION,
//       location VARCHAR(100)	

// rms_cdw_id VARCHAR(30),
// general_offense_number VARCHAR(30),
// offense_code_extension VARCHAR(5),
// offense_type VARCHAR(50),
// summary_offense_code VARCHAR(10),
// occurred_date_or_date_range_start TIMESTAMPTZ,
// occurred_date_range_end TIMESTAMPTZ,
// census_tract_2000 VARCHAR(15),
// month INTEGER,
// year INTEGER
