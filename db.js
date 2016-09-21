const PouchDB = require('pouchdb');

const db = new PouchDB('https://pushred.cloudant.com/sixofone', {
  auth: {
    username: process.env.CLOUDANT_KEY,
    password: process.env.CLOUDANT_PASSWORD
  },
  skip_setup: !process.browser
});

module.exports = db;
