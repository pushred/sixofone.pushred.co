const unorphan = require('unorphan');

const Header = require('../components/header');

document.addEventListener('DOMContentLoaded', () => {
  unorphan('h1, p');
  Header();
});
