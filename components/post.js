const Delegate = require('dom-delegate');
const parameterize = require('parameterize');

class Post {

  constructor (el) {
    this.title = 'Untitled';
    this.slug = 'untitled';
    this.el = el;
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

    this.toggleEdit();
  }

  toggleEdit (event) {
    this.isEditing = !this.isEditing;

    if (event) event.preventDefault(); // TODO: submit being triggered even though button is not a submit?

    if (this.isEditing) {
      this.el.innerHTML = renderInput(this.title, this.slug);
      this.el.classList.add('post__header_content--modify');
      this.inputEl = this.el.querySelector('.input__control');
      this.slugEl = this.el.querySelector('.input__text--var');
      this.inputEl.focus();
      this.inputEl.value = this.inputEl.value; // send cursor to the end
    } else {
      this.el.innerHTML = renderTitle(this.title);
      this.el.classList.remove('post__header_content--modify');
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
