const Delegate = require('dom-delegate');
const parameterize = require('parameterize');
const qs = require('querystring');
const shortId = require('shortid');
const wordWrap = require('word-wrap');

const db = require('../db');
const vars = require('../vars.json');

window.db = db;

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
      event = name.split(/\s/).filter(Boolean);
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
      title: this.title,
    })
    .then(this.addPage)
    .catch(err => {
      var uniqueId = this.slug + '-' + shortId.generate().slice(-5); // greater risk of collision
      db.put({
        _id: uniqueId
      })
      .then(doc => {
        this.slug = uniqueId;
        this.addPage();
      })
      .catch(err => alert(err)); // TODO: display a nice red error
    });
  }

  addPage () {
    fetch('https://fxnaqc63j7.execute-api.us-east-1.amazonaws.com/production/posts', {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({
        slug: this.slug,
        title: this.title
      })
    });
  }

  renderTitle (isUpdate) {
    if (this.isEditing) return;

    var { backgroundEl, el, isEditable, title } = this;

    const lines = wordWrap(title, {width: 17}).split('\n').map((line, index) => {
      let offset = index + 1 + 'em';
      return `<text x="${vars['title-padding']}" dy="${offset}" fill="url(#background)">${line}</text>`;
    });

    const bg = backgroundEl.getBoundingClientRect();
    const elOffset = (el.getBoundingClientRect().left * -1);

    // first pass render to get groupRect
    el.innerHTML = renderLockup(lines, isEditable, bg);

    setTimeout(() => {
      const groupEl = el.querySelector('g');

      groupEl.querySelectorAll('text').forEach((lineEl, index) => {
        let offset = index + 'em';
        groupEl.insertAdjacentHTML('afterbegin', `
          <rect x="0" y="${offset}" width="${lineEl.getComputedTextLength() + 40 + 'px'}" height="1.4em" fill="white" fill-opacity="${this.params.opacity || 1}"></rect>
        `); // 40 = box padding + ligature overlap?
      });

      const groupRect = groupEl.getBoundingClientRect();

      el.innerHTML = renderLockup(groupEl.innerHTML, isEditable, bg, groupRect, backgroundEl.currentSrc);
    }, 1); // wait for font rendering?
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

function renderLockup (lines, isEditable, bgRect, groupRect, imageUrl) {
  if (!groupRect) return `<svg class="post__header_title"><g>${lines}</g></svg>`;

  const editEl = isEditable && renderEditButton(groupRect.top) || '';

  const viewBox = `0 0 ${bgRect.width} ${groupRect.height}`;

  return `
    <svg class="post__header_title" width="${bgRect.width}" height="${groupRect.height}" viewbox="${viewBox}">
      <defs>
        <pattern id="background" patternUnits="userSpaceOnUse" width="${bgRect.width}" height="${bgRect.height}">
          <image xlink:href="${imageUrl}" x="${groupRect.left * -1}" y="${(window.scrollY + groupRect.top - 23) * -1}" width="${bgRect.width}" height="${bgRect.height}" />
        </pattern>
      </defs>
      <g>${lines}</g>
    </svg>
    ${editEl}
  `;
}

function renderEditButton (topY) {
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
