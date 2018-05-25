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



app.get('/', (request, response) => response.send(`It's ALLLLIIIIVEEE!!`));










app.get('*', (request, response) => response.redirect(CLIENT_URL));
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

