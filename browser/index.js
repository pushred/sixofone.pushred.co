const debounce = require('lodash/debounce');
const unorphan = require('unorphan');

const Post = require('../components/post');

document.addEventListener('DOMContentLoaded', () => {
  unorphan('h1, p');

  const post = new Post(document.querySelector('.post__header_content'));

  window.addEventListener('resize', debounce(() => post.renderTitle(), 20));
  window.addEventListener('load', () => post.renderTitle()); // render again once image is loaded
});
