const EMAIL_RENDERER_STYLE = String.raw`<style id="read-email-renderer-style">
  .email-renderer {
    display: grid;
    gap: .7rem;
  }
  .email-renderer-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .75rem;
    flex-wrap: wrap;
  }
  .email-renderer-label {
    display: inline-flex;
    align-items: center;
    gap: .45rem;
    color: var(--color-ink-2);
    font: 700 .62rem/1 var(--font-label);
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .email-renderer-label::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--color-mint);
    border: 1px solid var(--color-mint-deep);
  }
  .email-renderer-actions {
    display: flex;
    align-items: center;
    gap: .45rem;
    flex-wrap: wrap;
  }
  .email-renderer-button {
    min-height: 31px;
    padding: 0 .72rem;
    border: 1px solid var(--color-rule-strong);
    border-radius: var(--radius-pill);
    background: var(--color-paper);
    color: var(--color-ink);
    cursor: pointer;
    font: 700 .61rem/1 var(--font-label);
    transition: background-color 140ms, border-color 140ms, transform 140ms var(--ease-out);
  }
  .email-renderer-button:hover {
    background: var(--color-paper-2);
    border-color: var(--color-ink-2);
    transform: translateY(-1px);
  }
  .email-renderer-button.is-active {
    background: var(--color-mint-soft);
    border-color: var(--color-mint-deep);
  }
  .email-renderer-button:focus-visible,
  .email-renderer-icon-button:focus-visible,
  .email-modal-close:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
  .email-renderer-icon-button {
    width: 33px;
    height: 33px;
    padding: 0;
    display: inline-grid;
    place-items: center;
    border: 1px solid var(--color-rule-strong);
    border-radius: 50%;
    background: var(--color-paper);
    color: var(--color-ink);
    cursor: pointer;
    transition: background-color 140ms, border-color 140ms, transform 140ms var(--ease-out);
  }
  .email-renderer-icon-button:hover {
    background: var(--color-pear);
    border-color: var(--color-ink);
    transform: translateY(-1px);
  }
  .email-renderer-icon-button svg {
    width: 15px;
    height: 15px;
    display: block;
  }
  .email-renderer-frame-wrap {
    overflow: hidden;
    border: 1px solid var(--color-rule);
    border-radius: 14px;
    background: #fff;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,.015);
  }
  .email-renderer-frame {
    display: block;
    width: 100%;
    height: 320px;
    border: 0;
    background: #fff;
  }
  .email-renderer-note {
    margin: 0;
    color: var(--color-muted);
    font: 500 .58rem/1.45 var(--font-label);
    letter-spacing: .03em;
    text-transform: uppercase;
  }
  .email-plain-view {
    margin: 0;
    max-height: 430px;
    overflow: auto;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font: 500 .78rem/1.62 var(--font-label);
    color: var(--color-ink-2);
  }
  .mail-body.has-rendered-email > .mail-content {
    display: none;
  }

  body.email-modal-open {
    overflow: hidden !important;
  }
  .email-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: grid;
    place-items: center;
    padding: clamp(.7rem, 2.5vw, 1.6rem);
    background: rgba(24, 24, 21, .62);
    backdrop-filter: blur(7px);
    -webkit-backdrop-filter: blur(7px);
  }
  .email-modal {
    width: min(1180px, 100%);
    height: min(92vh, 900px);
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1.5px solid var(--color-rule-strong);
    border-radius: 22px;
    background: var(--color-paper);
    box-shadow: 0 28px 90px rgba(0, 0, 0, .24);
  }
  .email-modal-head {
    flex: 0 0 auto;
    min-height: 74px;
    padding: .9rem 1rem;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid var(--color-rule);
    background: var(--color-pear-soft);
  }
  .email-modal-heading {
    min-width: 0;
  }
  .email-modal-kicker {
    margin: 0 0 .28rem;
    color: var(--color-muted);
    font: 700 .58rem/1 var(--font-label);
    letter-spacing: .1em;
    text-transform: uppercase;
  }
  .email-modal-subject {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: .98rem;
    line-height: 1.25;
    font-weight: 700;
  }
  .email-modal-from {
    margin: .25rem 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--color-muted);
    font-size: .7rem;
  }
  .email-modal-head-actions {
    display: flex;
    align-items: center;
    gap: .45rem;
  }
  .email-modal-close {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border: 1.5px solid var(--color-ink);
    border-radius: 50%;
    background: var(--color-pear);
    color: var(--color-ink);
    cursor: pointer;
    font: 700 1rem/1 var(--font-label);
  }
  .email-modal-close:hover {
    background: var(--color-pear-deep);
  }
  .email-modal-toolbar {
    flex: 0 0 auto;
    padding: .65rem .9rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .7rem;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--color-rule);
    background: var(--color-paper-2);
  }
  .email-modal-toolbar-note {
    margin: 0;
    color: var(--color-muted);
    font: 500 .56rem/1.45 var(--font-label);
    letter-spacing: .04em;
    text-transform: uppercase;
  }
  .email-modal-body {
    flex: 1 1 auto;
    min-height: 0;
    padding: .8rem;
    background: var(--color-paper);
  }
  .email-modal-frame-wrap {
    width: 100%;
    height: 100%;
    overflow: hidden;
    border: 1px solid var(--color-rule);
    border-radius: 14px;
    background: #fff;
  }
  .email-modal-frame {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    background: #fff;
  }
  .email-modal-plain {
    width: 100%;
    height: 100%;
    margin: 0;
    overflow: auto;
    padding: 1rem;
    box-sizing: border-box;
    border: 1px solid var(--color-rule);
    border-radius: 14px;
    background: var(--color-quiet);
    color: var(--color-ink-2);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font: 500 .78rem/1.65 var(--font-label);
  }

  @media (max-width: 620px) {
    .email-renderer-toolbar {
      align-items: flex-start;
      flex-direction: column;
    }
    .email-renderer-actions {
      width: 100%;
    }
    .email-renderer-frame {
      height: 300px;
    }
    .email-modal-backdrop {
      padding: .35rem;
    }
    .email-modal {
      height: 96vh;
      border-radius: 16px;
    }
    .email-modal-head {
      min-height: 68px;
      padding: .75rem;
    }
    .email-modal-subject {
      font-size: .88rem;
    }
    .email-modal-toolbar {
      align-items: flex-start;
      flex-direction: column;
    }
    .email-modal-body {
      padding: .45rem;
    }
  }
</style>`;

const EMAIL_RENDERER_SCRIPT = String.raw`<script id="read-email-renderer-script">
(function () {
  var latestMessages = [];
  var nativeFetch = window.fetch.bind(window);
  var results = null;
  var resultsObserver = null;
  var activeModal = null;

  function isReadEndpoint(input) {
    try {
      var raw = typeof input === 'string' ? input : input && input.url ? input.url : '';
      var url = new URL(raw, window.location.href);
      return url.pathname === '/api/read';
    } catch (error) {
      return false;
    }
  }

  window.fetch = async function () {
    var args = Array.prototype.slice.call(arguments);
    var response = await nativeFetch.apply(null, args);

    if (isReadEndpoint(args[0])) {
      try {
        var clone = response.clone();
        clone.json().then(function (data) {
          if (data && data.ok && Array.isArray(data.messages)) {
            latestMessages = data.messages;
            scheduleEnhance();
          }
        }).catch(function () {});
      } catch (error) {}
    }

    return response;
  };

  function scheduleEnhance() {
    requestAnimationFrame(function () {
      enhanceCards();
      setTimeout(enhanceCards, 40);
    });
  }

  function removeUnsafeMarkup(doc) {
    doc.querySelectorAll('script,iframe,object,embed,form,input,button,textarea,select,meta,base,link').forEach(function (node) {
      node.remove();
    });

    doc.querySelectorAll('*').forEach(function (node) {
      Array.prototype.slice.call(node.attributes || []).forEach(function (attr) {
        var name = String(attr.name || '').toLowerCase();
        var value = String(attr.value || '');

        if (name.indexOf('on') === 0 || name === 'srcdoc' || name === 'formaction') {
          node.removeAttribute(attr.name);
          return;
        }

        if ((name === 'href' || name === 'src') && /^\s*(javascript|vbscript):/i.test(value)) {
          node.removeAttribute(attr.name);
        }
      });
    });

    doc.querySelectorAll('a').forEach(function (anchor) {
      var href = String(anchor.getAttribute('href') || '');
      if (/^\s*data:/i.test(href)) anchor.removeAttribute('href');
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    });
  }

  function blockRemoteImages(doc) {
    doc.querySelectorAll('img').forEach(function (img) {
      var src = String(img.getAttribute('src') || '');
      if (/^(https?:)?\/\//i.test(src)) {
        img.setAttribute('data-blocked-src', src);
        img.removeAttribute('src');
        if (!img.getAttribute('alt')) img.setAttribute('alt', 'Remote image blocked');
        img.classList.add('__read_email_blocked_image');
      }
    });

    doc.querySelectorAll('[background]').forEach(function (node) {
      var bg = String(node.getAttribute('background') || '');
      if (/^(https?:)?\/\//i.test(bg)) node.removeAttribute('background');
    });
  }

  function buildEmailDocument(html, allowRemoteImages) {
    var doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    removeUnsafeMarkup(doc);
    if (!allowRemoteImages) blockRemoteImages(doc);

    var head = doc.head || doc.documentElement.insertBefore(doc.createElement('head'), doc.body || null);

    var csp = doc.createElement('meta');
    csp.setAttribute('http-equiv', 'Content-Security-Policy');
    csp.setAttribute(
      'content',
      allowRemoteImages
        ? "default-src 'none'; img-src data: blob: http: https:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"
        : "default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"
    );
    head.insertBefore(csp, head.firstChild);

    var viewport = doc.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    viewport.setAttribute('content', 'width=device-width, initial-scale=1');
    head.insertBefore(viewport, csp.nextSibling);

    var style = doc.createElement('style');
    style.textContent = [
      'html,body{max-width:100%;margin:0;padding:0;background:#fff;color:#1d1d1d;overflow-wrap:anywhere}',
      'body{padding:18px;font-family:Arial,Helvetica,sans-serif;box-sizing:border-box}',
      'img{max-width:100%;height:auto}',
      'table{max-width:100%}',
      'pre{white-space:pre-wrap;overflow-wrap:anywhere}',
      'a{color:#0878c9}',
      '.__read_email_blocked_image{display:inline-block;min-width:90px;min-height:24px;padding:5px 8px;box-sizing:border-box;border:1px dashed #bbb;background:#f5f3ea;color:#666;font-size:11px}'
    ].join('');
    head.appendChild(style);

    return '<!doctype html>\n' + doc.documentElement.outerHTML;
  }

  function fitFrame(frame) {
    try {
      var doc = frame.contentDocument;
      if (!doc) return;
      var body = doc.body;
      var root = doc.documentElement;
      var height = Math.max(
        body ? body.scrollHeight : 0,
        body ? body.offsetHeight : 0,
        root ? root.scrollHeight : 0,
        root ? root.offsetHeight : 0
      );
      frame.style.height = Math.min(Math.max(height + 4, 240), 560) + 'px';
    } catch (error) {}
  }

  function makeExpandIcon() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');

    var paths = [
      'M8 3H3v5',
      'M3 3l6 6',
      'M16 21h5v-5',
      'M21 21l-6-6'
    ];

    paths.forEach(function (d) {
      var path = document.createElementNS(ns, 'path');
      path.setAttribute('d', d);
      svg.appendChild(path);
    });

    return svg;
  }

  function closeModal() {
    if (!activeModal) return;
    var restoreFocus = activeModal.restoreFocus;
    activeModal.backdrop.remove();
    activeModal = null;
    document.body.classList.remove('email-modal-open');
    if (restoreFocus && typeof restoreFocus.focus === 'function') {
      try { restoreFocus.focus(); } catch (error) {}
    }
  }

  function openModal(message, options) {
    closeModal();

    var state = {
      imagesLoaded: Boolean(options && options.imagesLoaded),
      mode: options && options.mode === 'text' ? 'text' : 'rendered'
    };

    var backdrop = document.createElement('div');
    backdrop.className = 'email-modal-backdrop';
    backdrop.setAttribute('role', 'presentation');

    var modal = document.createElement('section');
    modal.className = 'email-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Expanded email viewer');

    var head = document.createElement('header');
    head.className = 'email-modal-head';

    var heading = document.createElement('div');
    heading.className = 'email-modal-heading';
    var kicker = document.createElement('p');
    kicker.className = 'email-modal-kicker';
    kicker.textContent = 'Expanded email';
    var subject = document.createElement('p');
    subject.className = 'email-modal-subject';
    subject.textContent = String(message.subject || '(no subject)');
    var from = document.createElement('p');
    from.className = 'email-modal-from';
    from.textContent = String(message.from || 'Unknown sender');
    heading.appendChild(kicker);
    heading.appendChild(subject);
    heading.appendChild(from);

    var headActions = document.createElement('div');
    headActions.className = 'email-modal-head-actions';
    var closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'email-modal-close';
    closeButton.setAttribute('aria-label', 'Close expanded email');
    closeButton.title = 'Close';
    closeButton.textContent = '×';
    headActions.appendChild(closeButton);

    head.appendChild(heading);
    head.appendChild(headActions);

    var toolbar = document.createElement('div');
    toolbar.className = 'email-modal-toolbar';
    var toolbarActions = document.createElement('div');
    toolbarActions.className = 'email-renderer-actions';

    var renderedButton = document.createElement('button');
    renderedButton.type = 'button';
    renderedButton.className = 'email-renderer-button';
    renderedButton.textContent = 'Rendered';

    var textButton = document.createElement('button');
    textButton.type = 'button';
    textButton.className = 'email-renderer-button';
    textButton.textContent = 'Plain text';

    var hasImageMarkup = /<(img)\b|background\s*=|url\s*\(/i.test(String(message.bodyHtml || ''));
    var imageButton = null;
    if (hasImageMarkup) {
      imageButton = document.createElement('button');
      imageButton.type = 'button';
      imageButton.className = 'email-renderer-button';
      imageButton.textContent = state.imagesLoaded ? 'Images loaded' : 'Load images';
      imageButton.disabled = state.imagesLoaded;
      toolbarActions.appendChild(imageButton);
    }

    toolbarActions.appendChild(renderedButton);
    toolbarActions.appendChild(textButton);

    var toolbarNote = document.createElement('p');
    toolbarNote.className = 'email-modal-toolbar-note';
    toolbarNote.textContent = hasImageMarkup && !state.imagesLoaded
      ? 'Remote images are blocked by default.'
      : 'Sandboxed email viewer';

    toolbar.appendChild(toolbarActions);
    toolbar.appendChild(toolbarNote);

    var modalBody = document.createElement('div');
    modalBody.className = 'email-modal-body';

    var frameWrap = document.createElement('div');
    frameWrap.className = 'email-modal-frame-wrap';
    var frame = document.createElement('iframe');
    frame.className = 'email-modal-frame';
    frame.setAttribute('title', 'Expanded rendered email content');
    frame.setAttribute('sandbox', 'allow-same-origin allow-popups allow-popups-to-escape-sandbox');
    frame.setAttribute('referrerpolicy', 'no-referrer');
    frameWrap.appendChild(frame);

    var plain = document.createElement('pre');
    plain.className = 'email-modal-plain';
    plain.textContent = String(message.body || 'No text body.');

    modalBody.appendChild(frameWrap);
    modalBody.appendChild(plain);

    modal.appendChild(head);
    modal.appendChild(toolbar);
    modal.appendChild(modalBody);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    document.body.classList.add('email-modal-open');

    function renderModalHtml() {
      frame.srcdoc = buildEmailDocument(message.bodyHtml, state.imagesLoaded);
      frameWrap.hidden = false;
      plain.hidden = true;
      renderedButton.classList.add('is-active');
      textButton.classList.remove('is-active');
      state.mode = 'rendered';
    }

    function showModalText() {
      frameWrap.hidden = true;
      plain.hidden = false;
      renderedButton.classList.remove('is-active');
      textButton.classList.add('is-active');
      state.mode = 'text';
    }

    renderedButton.addEventListener('click', renderModalHtml);
    textButton.addEventListener('click', showModalText);

    if (imageButton) {
      imageButton.addEventListener('click', function () {
        state.imagesLoaded = true;
        imageButton.textContent = 'Images loaded';
        imageButton.disabled = true;
        toolbarNote.textContent = 'Remote images enabled for this viewer.';
        renderModalHtml();
      });
    }

    closeButton.addEventListener('click', closeModal);
    backdrop.addEventListener('mousedown', function (event) {
      if (event.target === backdrop) closeModal();
    });

    activeModal = {
      backdrop: backdrop,
      restoreFocus: options && options.restoreFocus ? options.restoreFocus : null
    };

    if (state.mode === 'text') showModalText();
    else renderModalHtml();

    setTimeout(function () {
      try { closeButton.focus(); } catch (error) {}
    }, 0);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && activeModal) closeModal();
  });

  function enhanceCard(card, message) {
    if (!card || !message || !message.bodyHtml || card.dataset.emailRendered === '1') return;

    var body = card.querySelector('.mail-body');
    var plain = body ? body.querySelector('.mail-content') : null;
    if (!body || !plain) return;

    card.dataset.emailRendered = '1';
    body.classList.add('has-rendered-email');

    var renderer = document.createElement('div');
    renderer.className = 'email-renderer';

    var toolbar = document.createElement('div');
    toolbar.className = 'email-renderer-toolbar';

    var label = document.createElement('span');
    label.className = 'email-renderer-label';
    label.textContent = 'Rendered email';

    var actions = document.createElement('div');
    actions.className = 'email-renderer-actions';

    var renderedButton = document.createElement('button');
    renderedButton.type = 'button';
    renderedButton.className = 'email-renderer-button is-active';
    renderedButton.textContent = 'Rendered';

    var textButton = document.createElement('button');
    textButton.type = 'button';
    textButton.className = 'email-renderer-button';
    textButton.textContent = 'Plain text';

    var hasImageMarkup = /<(img)\b|background\s*=|url\s*\(/i.test(String(message.bodyHtml));
    var imageButton = null;
    if (hasImageMarkup) {
      imageButton = document.createElement('button');
      imageButton.type = 'button';
      imageButton.className = 'email-renderer-button';
      imageButton.textContent = 'Load images';
      actions.appendChild(imageButton);
    }

    actions.appendChild(renderedButton);
    actions.appendChild(textButton);

    var expandButton = document.createElement('button');
    expandButton.type = 'button';
    expandButton.className = 'email-renderer-icon-button';
    expandButton.setAttribute('aria-label', 'Expand email');
    expandButton.title = 'Expand email';
    expandButton.appendChild(makeExpandIcon());
    actions.appendChild(expandButton);

    toolbar.appendChild(label);
    toolbar.appendChild(actions);

    var frameWrap = document.createElement('div');
    frameWrap.className = 'email-renderer-frame-wrap';
    var frame = document.createElement('iframe');
    frame.className = 'email-renderer-frame';
    frame.setAttribute('title', 'Rendered email content');
    frame.setAttribute('sandbox', 'allow-same-origin allow-popups allow-popups-to-escape-sandbox');
    frame.setAttribute('referrerpolicy', 'no-referrer');
    frameWrap.appendChild(frame);

    var note = document.createElement('p');
    note.className = 'email-renderer-note';
    note.textContent = hasImageMarkup
      ? 'Remote images are blocked until you choose Load images.'
      : 'Rendered in a sandboxed viewer.';

    plain.classList.add('email-plain-view');

    renderer.appendChild(toolbar);
    renderer.appendChild(frameWrap);
    renderer.appendChild(note);
    body.insertBefore(renderer, plain);

    var rendered = false;
    var imagesLoaded = false;
    var currentMode = 'rendered';

    function renderHtml(allowImages) {
      frame.srcdoc = buildEmailDocument(message.bodyHtml, allowImages);
      rendered = true;
      currentMode = 'rendered';
      frameWrap.hidden = false;
      note.hidden = false;
      plain.style.display = 'none';
      renderedButton.classList.add('is-active');
      textButton.classList.remove('is-active');
    }

    function showText() {
      currentMode = 'text';
      frameWrap.hidden = true;
      note.hidden = true;
      plain.style.display = 'block';
      renderedButton.classList.remove('is-active');
      textButton.classList.add('is-active');
    }

    frame.addEventListener('load', function () {
      fitFrame(frame);
      setTimeout(function () { fitFrame(frame); }, 80);
    });

    card.addEventListener('toggle', function () {
      if (card.open && !rendered) renderHtml(false);
    });

    renderedButton.addEventListener('click', function () {
      if (!rendered) renderHtml(imagesLoaded);
      else {
        currentMode = 'rendered';
        frameWrap.hidden = false;
        note.hidden = false;
        plain.style.display = 'none';
        renderedButton.classList.add('is-active');
        textButton.classList.remove('is-active');
      }
    });

    textButton.addEventListener('click', showText);

    if (imageButton) {
      imageButton.addEventListener('click', function () {
        imagesLoaded = true;
        imageButton.textContent = 'Images loaded';
        imageButton.disabled = true;
        renderHtml(true);
      });
    }

    expandButton.addEventListener('click', function () {
      openModal(message, {
        imagesLoaded: imagesLoaded,
        mode: currentMode,
        restoreFocus: expandButton
      });
    });

    if (card.open) renderHtml(false);
  }

  function enhanceCards() {
    if (!results) results = document.getElementById('results');
    if (!results || !latestMessages.length) return;

    var cards = results.querySelectorAll('.mail-card');
    cards.forEach(function (card, index) {
      enhanceCard(card, latestMessages[index]);
    });
  }

  function install() {
    results = document.getElementById('results');
    if (!results) return;

    resultsObserver = new MutationObserver(function () {
      scheduleEnhance();
    });
    resultsObserver.observe(results, { childList: true, subtree: true });
    scheduleEnhance();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
</script>`;

module.exports = { EMAIL_RENDERER_STYLE, EMAIL_RENDERER_SCRIPT };
