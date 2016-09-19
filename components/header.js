function makeEditable () {
  const headerContentEl = document.querySelector('.post__header_content');

  headerContentEl.innerHTML = renderInput();
  headerContentEl.classList.add('post__header_content--modify');

  const inputEl = document.querySelector('input', headerContentEl);

  inputEl.addEventListener('focus', function () {
    this.value = this.value;
  });

  inputEl.focus();
}

module.exports = makeEditable;

function renderTitle (title = 'untitled') {
  return `
    <h1 class="post__header_title"><span>${title}</span></h1>
    <button class="button button--modify" title="Change">
      <span>Change</span>
      <svg><use xlink:href="/files/bundle.svg#modify"></use></svg>
    </button>
  `;
}

function renderInput (title = 'untitled', slug = 'untitled') {
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
