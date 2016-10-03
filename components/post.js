const Delegate = require('dom-delegate');
const forEach = require('lodash/forEach');
const parameterize = require('parameterize');
const qs = require('querystring');
const shortId = require('shortid');
const wordWrap = require('word-wrap');

const db = require('../db');
const vars = require('../vars.json');

class Post {

  constructor (el) {
    var slug;

    if (/posts/.test(window.location.pathname)) slug = window.location.pathname.split('posts').pop();

    this.el = el;
    this.backgroundEl = document.querySelector('.header__background');

    this.title = this.el.querySelector('.post__header_title').textContent;
    this.slug = slug || parameterize(this.title) || 'please enter a post title';
    this.isEditing = false;

    this.params = qs.parse(window.location.search.slice(1));
    this.isEditable = Object.keys(this.params).indexOf('edit') >= 0;

    this.renderTitle();

    const delegate = new Delegate(el);

    const events = {
      'click  .button--modify': this.toggleEdit,
      'click  .button--destroy': this.toggleEdit,
      'keyup  .input__control': this.handleInput,
      'submit .form': this.save
    };

    // setup handlers for events bubbling to the element

    Object.keys(events).forEach(name => {
      let event = name.split(/\s/).filter(Boolean);
      delegate.on(event[0], event[1], eventObj => events[name].call(this, eventObj));
    });
  }

  handleInput () {
    this.generateSlug();
    this.validate();
  }

  generateSlug () {
    this.slug = parameterize(this.inputEl.value);
    this.slugEl.textContent = this.slug;
  }

  save (event) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.isValid) return;

    let oldTitle = this.title;
    let newTitle = event.target.querySelector('.input__control').value;

    this.title = newTitle;
    document.title = document.title.replace(oldTitle, newTitle);

    this.toggleEdit(); // optimistically update

    if (oldTitle === newTitle) return;

    db.put({
      _id: this.slug,
      title: this.title
    })
    .then(() => this.addPage())
    .catch(err => {
      if (err) throw err;

      var uniqueId = this.slug + '-' + shortId.generate().slice(-5); // greater risk of collision
      db.put({
        _id: uniqueId
      })
      .then(doc => {
        this.slug = uniqueId;
        this.addPage();
      })
      .catch(err => window.alert(err)); // TODO: display a nice red error
    });
  }

  addPage () {
    const { slug, title } = this;

    fetch('https://fxnaqc63j7.execute-api.us-east-1.amazonaws.com/production/posts', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({
        slug,
        title
      })
    });
  }

  renderTitle () {
    if (this.isEditing) return;

    var { backgroundEl, el, isEditable, title } = this;

    const lines = wordWrap(title, { width: 17 }).split('\n');
    const bgRect = backgroundEl.getBoundingClientRect();

    // first pass render to get rect
    el.innerHTML = renderLockup(lines, bgRect, isEditable);

    const lockupEl = el.querySelector('g');

    forEach(lockupEl.querySelectorAll('tspan'), (lineEl, index) => {
      let offset = 79 * index;

      const rectEl = document.createElement('rect');

      rectEl.setAttribute('x', '0')
      rectEl.setAttribute('y', offset)
      rectEl.setAttribute('width', lineEl.getComputedTextLength() + 40) // 40 = box padding + ligature overlap?
      rectEl.setAttribute('height', '80px')
      rectEl.setAttribute('fill', 'white')
      rectEl.setAttribute('fill-opacity', this.params.opacity || 1);

      lockupEl.insertBefore(rectEl, lockupEl.firstChild);
    });

    const lockupRect = lockupEl.getBoundingClientRect();
    if (isEditable) el.insertAdjacentHTML('beforeend', renderEditButton(lockupRect.top));

    el.querySelector('svg').innerHTML = renderBackground(bgRect, lockupRect, lockupEl.innerHTML, backgroundEl);
  }

  redrawTitle () {
    const lockupEl = this.el.querySelector('g');
    if (!lockupEl) return;

    const bgRect = this.backgroundEl.getBoundingClientRect();
    const lockupRect = lockupEl.getBoundingClientRect();

    this.el.querySelector('svg').innerHTML = renderBackground(bgRect, lockupRect, lockupEl.innerHTML, this.backgroundEl);
  }

  toggleEdit (event) {
    this.isEditing = !this.isEditing;

    if (event) event.preventDefault(); // TODO: submit being triggered even though button is not a submit?

    if (this.isEditing) {
      this.el.innerHTML = renderInput(this.title, this.slug);
      document.querySelector('.post__header').classList.add('post__header--modify');
      this.inputEl = this.el.querySelector('.input__control');
      this.slugEl = this.el.querySelector('.input__text--var');
      this.inputEl.focus();
      this.inputEl.value = this.inputEl.value; // send cursor to the end
    } else {
      this.renderTitle(this.title);
      document.querySelector('.post__header').classList.remove('post__header--modify');
    }
  }

  validate () {
    if (this.inputEl.value.length === 0) {
      this.isValid = false;
      this.el.querySelector('button[type=submit]').disabled = true;
    } else {
      this.isValid = true;
      this.el.querySelector('button[type=submit]').disabled = false;
    }
  }
}

module.exports = Post;

function renderLockup (lines, bgRect) {
  const text = `<text fill="url(#background)">` + lines.map((line, index) =>
    `<tspan x="${vars['title-padding']}" dy="68px">${line.trim()}</tspan>`
  ).join(' ') + `</text>`;

  const width = bgRect.width;
  const height = lines.length * 80 + 10; // 10px to avoid cropped descenders

  return `
    <svg class="post__header_title" width="${width}" height="${height}">
      <g>${text}</g>
    </svg>
  `;
}

function renderBackground (bgRect, lockupRect, content, bgEl) {
  return `
    <defs>
      <pattern id="background" patternUnits="userSpaceOnUse" width="${bgRect.width}" height="${bgRect.height}">
        <image xlink:href="${bgEl.currentSrc}" x="${(lockupRect.left - 20) * -1}" y="${(window.scrollY + lockupRect.top - 2) * -1}" width="${bgRect.width}" height="${bgRect.height}" />
      </pattern>
    </defs>
    <g>${content}</g>
  `;
}

function renderEditButton () {
  return `
    <button class="button button--modify" title="Change">
      <span>Change</span>
      <svg><use xlink:href="/files/bundle.svg#modify"></use></svg>
    </button>
  `;
}

function renderInput (title, slug) {
  return `
    <form class="form">
      <label class="input__label" for="title">Title</label>
      <input class="input__control" name="title" type="text" value="${title}" tabindex="1" autocomplete="off" />
      <p class="input__text">slug: <var class="input__text--var">${slug}</var></p>
      <button class="button button--save icon" title="Save" type="submit">
        <span>Save</span>
        <svg><use xlink:href="/files/bundle.svg#save"></use></svg>
      </button>
      <button class="button button--destroy icon" title="Cancel">
        <span>Cancel</span>
        <svg><use xlink:href="/files/bundle.svg#destroy"></use></svg>
      </button>
    </form>
  `;
}
