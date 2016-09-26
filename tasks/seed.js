const chalk = require('chalk');
const parameterize = require('parameterize');

const db = require('../db');

[
  "Are we out of the woods yet?",
  "It is impossible to walk rapidly and be unhappy.",
  "We don’t get offered crises, they arrive.",
  "I have seen the future and it doesn’t work.",
  "I dwell in possibility...",
  "Knowledge is power."
].forEach(title => {
  db.put({
    _id: parameterize(title),
    title: title
  })
  .then(doc => console.info(chalk.green('✓'), chalk.gray(doc.id)))
  .catch(err => console.error(chalk.red(JSON.stringify(err))));
});
