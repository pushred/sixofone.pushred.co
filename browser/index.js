const unorphan = require('unorphan');

document.addEventListener('DOMContentLoaded', () => {
  unorphan('h1, p');
});

