const Delegate = require('dom-delegate');
const parameterize = require('parameterize');
const shortId = require('shortid');

const db = require('../db');

window.db = db;

class Post {

  constructor (el) {
    if (!/edit/.test(window.location.search)) return;

    var slug;

    if (/posts/.test(window.location.pathname)) slug = window.location.pathname.split('posts').pop();

    this.el = el;
    this.title = this.el.querySelector('.post__header_title span').textContent;
    this.slug = slug || 'please enter a post title';
    this.isEditing = false;

    el.innerHTML = renderTitle(this.title); // add edit button

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
      this.el.innerHTML = renderTitle(this.title);
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

function renderTitle (title) {
  return `
    <h1 class="post__header_title"><span>${title}</span></h1>
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
      <input class="input__control" name="title" type="text" value="${title}" tabindex="1" />
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
