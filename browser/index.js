const unorphan = require('unorphan');

const Post = require('../components/post');

document.addEventListener('DOMContentLoaded', () => {
  unorphan('h1, p');

  const post = new Post(document.querySelector('.post__header_content'));

});
