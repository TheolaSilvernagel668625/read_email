const ENHANCEMENT_STYLE = String.raw`<style id="read-email-enhancements">
  .row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
  .row > .field {
    min-width: 0;
    margin-bottom: 1rem;
  }
  .row .field-label {
    min-height: 22px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: baseline;
    gap: .75rem;
  }
  .row select {
    height: 47px;
    min-height: 47px;
  }

  /* Desktop mailbox layout: Inbox mirrors the setup panel height. */
  .panel--inbox {
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .panel--inbox > .inbox-head {
    flex: 0 0 auto;
  }
  .panel--inbox > .inbox-body {
    flex: 1 1 auto;
    min-height: 0 !important;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .panel--inbox #notice {
    flex: 0 0 auto;
  }
  .panel--inbox #results {
    flex: 1 1 auto;
    min-height: 0 !important;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    scrollbar-gutter: stable;
    scrollbar-width: thin;
  }
  .panel--inbox #results > .empty,
  .panel--inbox #results > .loading {
    min-height: 100%;
  }
  .panel--inbox .mail-list {
    padding-bottom: .15rem;
  }

  .auto-fetch {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin: .15rem 0 1rem;
    padding: .8rem .85rem;
    border: 1px solid var(--color-rule);
    border-radius: 14px;
    background: var(--color-paper-2);
  }
  .auto-fetch-copy { min-width: 0; }
  .auto-fetch-title {
    display: block;
    margin: 0;
    color: var(--color-ink);
    font-size: .8rem;
    font-weight: 700;
  }
  .auto-fetch-note {
    display: block;
    margin-top: .2rem;
    color: var(--color-muted);
    font: 500 .58rem/1.45 var(--font-label);
    letter-spacing: .04em;
    text-transform: uppercase;
  }
  .auto-switch {
    position: relative;
    flex: 0 0 auto;
    width: 44px;
    height: 25px;
  }
  .auto-switch input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  .auto-switch-track {
    position: absolute;
    inset: 0;
    cursor: pointer;
    border: 1.5px solid var(--color-rule-strong);
    border-radius: 999px;
    background: var(--color-paper);
    transition: background-color 150ms, border-color 150ms;
  }
  .auto-switch-track::after {
    content: "";
    position: absolute;
    width: 17px;
    height: 17px;
    left: 3px;
    top: 2.5px;
    border: 1.5px solid var(--color-ink);
    border-radius: 50%;
    background: var(--color-white);
    transition: transform 160ms var(--ease-out), background-color 150ms;
  }
  .auto-switch input:checked + .auto-switch-track {
    border-color: var(--color-mint-deep);
    background: var(--color-mint);
  }
  .auto-switch input:checked + .auto-switch-track::after {
    transform: translateX(19px);
  }
  .auto-switch input:focus-visible + .auto-switch-track {
    outline: 3px solid var(--color-focus);
    outline-offset: 3px;
  }

  .notice.is-error {
    padding: 0;
    overflow: hidden;
    white-space: normal;
  }
  .error-shell {
    display: grid;
    gap: .85rem;
    padding: 1rem;
  }
  .error-top {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1rem;
    align-items: start;
  }
  .error-eyebrow {
    margin: 0 0 .35rem;
    color: var(--color-coral-deep);
    font: 700 .62rem/1 var(--font-label);
    letter-spacing: .12em;
    text-transform: uppercase;
  }
  .error-message {
    margin: 0;
    color: var(--color-ink);
    font-size: .9rem;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  .error-mark {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border: 1.5px solid var(--color-ink);
    border-radius: 50%;
    background: var(--color-pear);
    font: 800 .8rem/1 var(--font-label);
  }
  .error-meta {
    display: flex;
    flex-wrap: wrap;
    gap: .45rem;
  }
  .error-chip {
    display: inline-flex;
    align-items: center;
    min-height: 27px;
    max-width: 100%;
    padding: 0 .65rem;
    border: 1px solid var(--color-rule-strong);
    border-radius: var(--radius-pill);
    background: var(--color-paper);
    color: var(--color-ink-2);
    font: 600 .6rem/1 var(--font-label);
    letter-spacing: .04em;
    overflow-wrap: anywhere;
  }
  .error-details {
    border-top: 1px solid var(--color-rule);
    padding-top: .75rem;
  }
  .error-details > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 34px;
    cursor: pointer;
    list-style: none;
    color: var(--color-ink-2);
    font: 700 .68rem/1 var(--font-label);
    letter-spacing: .06em;
    text-transform: uppercase;
  }
  .error-details > summary::-webkit-details-marker { display: none; }
  .error-details > summary::after { content: "+"; font-size: 1rem; }
  .error-details[open] > summary::after { content: "−"; }
  .error-detail-actions {
    display: flex;
    justify-content: flex-end;
    margin: .5rem 0;
  }
  .error-copy {
    min-height: 31px;
    padding: 0 .7rem;
    border: 1px solid var(--color-rule-strong);
    border-radius: var(--radius-pill);
    background: var(--color-paper);
    color: var(--color-ink);
    cursor: pointer;
    font: 700 .62rem/1 var(--font-label);
  }
  .error-copy:hover { background: var(--color-paper-2); }
  .error-raw {
    margin: 0;
    max-height: 320px;
    overflow: auto;
    padding: .85rem;
    border: 1px solid var(--color-rule);
    border-radius: 12px;
    background: var(--color-paper);
    color: var(--color-ink-2);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font: 500 .68rem/1.55 var(--font-label);
    scrollbar-width: thin;
  }

  @media (max-width: 900px) {
    .panel--inbox {
      height: auto !important;
      min-height: 538px;
      overflow: visible;
    }
    .panel--inbox > .inbox-body {
      min-height: 470px !important;
      overflow: visible;
      display: block;
    }
    .panel--inbox #results {
      min-height: 435px !important;
      overflow: visible;
    }
    .panel--inbox #results > .empty,
    .panel--inbox #results > .loading {
      min-height: 435px;
    }
  }

  @media (max-width: 620px) {
    .row { grid-template-columns: minmax(0, 1fr); }
    .panel--inbox { min-height: 458px; }
    .panel--inbox > .inbox-body { min-height: 390px !important; }
    .panel--inbox #results { min-height: 360px !important; }
    .panel--inbox #results > .empty,
    .panel--inbox #results > .loading { min-height: 360px; }
    .error-top { grid-template-columns: minmax(0, 1fr); }
    .error-mark { display: none; }
    .error-raw { max-height: 260px; }
  }
</style>`;

const ENHANCEMENT_SCRIPT = String.raw`<script id="read-email-enhancements-script">
(function () {
  var AUTO_FETCH_KEY = 'read_email:auto_fetch';
  var AUTO_FETCH_MS = 30000;
  var autoTimer = null;
  var inputDebounce = null;
  var lastRequestAt = 0;
  var setupResizeObserver = null;

  function accountLooksValid(value) {
    var parts = String(value || '').trim().split('|');
    return parts.length === 4 && parts[0].includes('@') && parts[2].trim() && parts[3].trim();
  }

  function enhanceErrorNotice(notice) {
    if (!notice || !notice.classList.contains('is-error')) return;
    if (notice.querySelector('.error-shell')) return;

    var raw = String(notice.textContent || '').trim();
    if (!raw) return;

    var message = raw;
    var diagnosticText = '';
    var diagnostics = null;
    var marker = raw.indexOf('\n\n{');

    if (marker !== -1) {
      message = raw.slice(0, marker).trim();
      diagnosticText = raw.slice(marker + 2).trim();
      try { diagnostics = JSON.parse(diagnosticText); } catch (error) { diagnostics = null; }
    }

    notice.textContent = '';

    var shell = document.createElement('div');
    shell.className = 'error-shell';

    var top = document.createElement('div');
    top.className = 'error-top';

    var copy = document.createElement('div');
    var eyebrow = document.createElement('p');
    eyebrow.className = 'error-eyebrow';
    eyebrow.textContent = diagnostics && diagnostics.provider ? 'Microsoft request failed' : 'Request failed';

    var body = document.createElement('p');
    body.className = 'error-message';
    body.textContent = message;

    copy.appendChild(eyebrow);
    copy.appendChild(body);

    var mark = document.createElement('span');
    mark.className = 'error-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = '!';

    top.appendChild(copy);
    top.appendChild(mark);
    shell.appendChild(top);

    if (diagnostics) {
      var meta = document.createElement('div');
      meta.className = 'error-meta';

      [
        diagnostics.code ? 'code · ' + diagnostics.code : '',
        diagnostics.provider ? 'provider · ' + diagnostics.provider : '',
        diagnostics.providerStatus ? 'HTTP · ' + diagnostics.providerStatus : ''
      ].filter(Boolean).forEach(function (text) {
        var chip = document.createElement('span');
        chip.className = 'error-chip';
        chip.textContent = text;
        meta.appendChild(chip);
      });

      if (meta.childNodes.length) shell.appendChild(meta);
    }

    if (diagnosticText) {
      var details = document.createElement('details');
      details.className = 'error-details';

      var summary = document.createElement('summary');
      summary.textContent = 'Technical details';

      var actions = document.createElement('div');
      actions.className = 'error-detail-actions';

      var copyButton = document.createElement('button');
      copyButton.type = 'button';
      copyButton.className = 'error-copy';
      copyButton.textContent = 'Copy diagnostics';
      copyButton.addEventListener('click', async function () {
        try {
          await navigator.clipboard.writeText(raw);
          copyButton.textContent = 'Copied';
          setTimeout(function () { copyButton.textContent = 'Copy diagnostics'; }, 1400);
        } catch (error) {
          copyButton.textContent = 'Copy failed';
          setTimeout(function () { copyButton.textContent = 'Copy diagnostics'; }, 1400);
        }
      });

      var pre = document.createElement('pre');
      pre.className = 'error-raw';
      pre.textContent = diagnostics ? JSON.stringify(diagnostics, null, 2) : diagnosticText;

      actions.appendChild(copyButton);
      details.appendChild(summary);
      details.appendChild(actions);
      details.appendChild(pre);
      shell.appendChild(details);
    }

    notice.appendChild(shell);
  }

  function install() {
    var form = document.getElementById('reader-form');
    var account = document.getElementById('account');
    var apiKey = document.getElementById('api-key');
    var limit = document.getElementById('limit');
    var readButton = document.getElementById('read-button');
    var notice = document.getElementById('notice');
    var inboxTitle = document.getElementById('inbox-title');
    var inboxPanel = inboxTitle ? inboxTitle.closest('.panel') : null;

    if (account) account.removeAttribute('required');
    if (inboxPanel) inboxPanel.classList.add('panel--inbox');

    function syncInboxHeight() {
      if (!form || !inboxPanel) return;
      if (window.matchMedia('(max-width: 900px)').matches) {
        inboxPanel.style.removeProperty('height');
        return;
      }
      var setupHeight = Math.ceil(form.getBoundingClientRect().height);
      if (setupHeight > 0) inboxPanel.style.height = setupHeight + 'px';
    }

    if (form && inboxPanel) {
      syncInboxHeight();
      if ('ResizeObserver' in window) {
        setupResizeObserver = new ResizeObserver(syncInboxHeight);
        setupResizeObserver.observe(form);
      }
      window.addEventListener('resize', syncInboxHeight, { passive: true });
      setTimeout(syncInboxHeight, 0);
      setTimeout(syncInboxHeight, 150);
    }

    if (notice) {
      var observer = new MutationObserver(function () {
        if (notice.classList.contains('is-error')) enhanceErrorNotice(notice);
      });
      observer.observe(notice, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['class']
      });
      enhanceErrorNotice(notice);
    }

    if (!form || !account || !readButton) return;

    if (!document.getElementById('auto-fetch')) {
      var autoRow = document.createElement('div');
      autoRow.className = 'auto-fetch';

      var autoCopy = document.createElement('div');
      autoCopy.className = 'auto-fetch-copy';
      var autoTitle = document.createElement('span');
      autoTitle.className = 'auto-fetch-title';
      autoTitle.textContent = 'Auto fetch';
      var autoNote = document.createElement('span');
      autoNote.className = 'auto-fetch-note';
      autoNote.textContent = 'Refresh every 30 seconds';
      autoCopy.appendChild(autoTitle);
      autoCopy.appendChild(autoNote);

      var autoLabel = document.createElement('label');
      autoLabel.className = 'auto-switch';
      autoLabel.setAttribute('aria-label', 'Auto fetch inbox every 30 seconds');
      var autoInput = document.createElement('input');
      autoInput.type = 'checkbox';
      autoInput.id = 'auto-fetch';
      var autoTrack = document.createElement('span');
      autoTrack.className = 'auto-switch-track';
      autoTrack.setAttribute('aria-hidden', 'true');
      autoLabel.appendChild(autoInput);
      autoLabel.appendChild(autoTrack);

      autoRow.appendChild(autoCopy);
      autoRow.appendChild(autoLabel);
      readButton.parentNode.insertBefore(autoRow, readButton);
    }

    var autoInput = document.getElementById('auto-fetch');
    if (!autoInput) return;

    try {
      autoInput.checked = localStorage.getItem(AUTO_FETCH_KEY) === '1';
    } catch (error) {
      autoInput.checked = false;
    }

    function canFetch() {
      return autoInput.checked && accountLooksValid(account.value) && !readButton.disabled && !document.hidden;
    }

    function triggerAutoFetch(force) {
      if (!canFetch()) return;
      var now = Date.now();
      if (!force && now - lastRequestAt < 1500) return;
      lastRequestAt = now;
      form.requestSubmit();
    }

    function restartTimer() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = null;
      if (!autoInput.checked) return;
      autoTimer = setInterval(function () {
        triggerAutoFetch(false);
      }, AUTO_FETCH_MS);
    }

    function scheduleInputFetch() {
      if (inputDebounce) clearTimeout(inputDebounce);
      inputDebounce = setTimeout(function () {
        triggerAutoFetch(true);
      }, 650);
    }

    autoInput.addEventListener('change', function () {
      try {
        localStorage.setItem(AUTO_FETCH_KEY, autoInput.checked ? '1' : '0');
      } catch (error) {}
      restartTimer();
      if (autoInput.checked) triggerAutoFetch(true);
    });

    account.addEventListener('input', scheduleInputFetch);
    if (apiKey) apiKey.addEventListener('change', function () { triggerAutoFetch(true); });
    if (limit) limit.addEventListener('change', function () { triggerAutoFetch(true); });

    document.querySelectorAll('input[name="backend"]').forEach(function (input) {
      input.addEventListener('change', function () { triggerAutoFetch(true); });
    });

    form.addEventListener('submit', function () {
      lastRequestAt = Date.now();
    });

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && autoInput.checked && Date.now() - lastRequestAt >= AUTO_FETCH_MS) {
        triggerAutoFetch(true);
      }
    });

    restartTimer();
    if (autoInput.checked && accountLooksValid(account.value)) {
      setTimeout(function () { triggerAutoFetch(true); }, 120);
    }

    setTimeout(syncInboxHeight, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
</script>`;

module.exports = { ENHANCEMENT_STYLE, ENHANCEMENT_SCRIPT };
