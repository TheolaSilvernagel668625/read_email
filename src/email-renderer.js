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
  .email-renderer-button:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
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

  @media (max-width: 620px) {
    .email-renderer-toolbar {
      align-items: flex-start;
      flex-direction: column;
    }
    .email-renderer-frame {
      height: 300px;
    }
  }
</style>`;

const EMAIL_RENDERER_SCRIPT = String.raw`<script id="read-email-renderer-script">
(function () {
  var latestMessages = [];
  var nativeFetch = window.fetch.bind(window);
  var results = null;
  var resultsObserver = null;

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

    function renderHtml(allowImages) {
      frame.srcdoc = buildEmailDocument(message.bodyHtml, allowImages);
      rendered = true;
      frameWrap.hidden = false;
      note.hidden = false;
      plain.style.display = 'none';
      renderedButton.classList.add('is-active');
      textButton.classList.remove('is-active');
    }

    function showText() {
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
