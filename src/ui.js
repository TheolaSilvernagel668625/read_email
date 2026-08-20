/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
const HOME_HTML = String.raw`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="theme-color" content="#fbf7e9" />
  <title>read_email · mailbox workbench</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --color-paper: oklch(97% 0.012 95);
      --color-paper-2: oklch(94% 0.016 95);
      --color-paper-3: oklch(91% 0.020 95);
      --color-ink: oklch(20% 0.012 250);
      --color-ink-2: oklch(31% 0.014 250);
      --color-muted: oklch(50% 0.014 90);
      --color-rule: oklch(84% 0.014 90);
      --color-rule-strong: oklch(70% 0.018 85);
      --color-pear: oklch(86% 0.18 95);
      --color-pear-deep: oklch(76% 0.20 95);
      --color-cyan: oklch(66% 0.18 235);
      --color-cyan-deep: oklch(56% 0.20 235);
      --color-coral: oklch(68% 0.24 18);
      --color-coral-deep: oklch(58% 0.26 18);
      --color-mint: oklch(80% 0.16 150);
      --color-mint-deep: oklch(70% 0.18 150);
      --color-lavender: oklch(74% 0.16 305);
      --color-focus: oklch(56% 0.20 235);
      --color-white: oklch(100% 0 0);
      --color-quiet: oklch(98% 0.006 95);
      --color-shadow: oklch(20% 0.012 250 / 0.13);
      --color-shadow-soft: oklch(20% 0.012 250 / 0.07);
      --color-cyan-soft: oklch(66% 0.18 235 / 0.09);
      --color-pear-soft: oklch(86% 0.18 95 / 0.16);
      --color-mint-soft: oklch(80% 0.16 150 / 0.16);
      --color-coral-soft: oklch(68% 0.24 18 / 0.08);
      --font-display: "Plus Jakarta Sans", "Geist", "Inter", ui-sans-serif, system-ui, sans-serif;
      --font-body: "Plus Jakarta Sans", "Geist", "Inter", ui-sans-serif, system-ui, sans-serif;
      --font-label: "JetBrains Mono", "Geist Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
      --radius-panel: 22px;
      --radius-input: 13px;
      --radius-pill: 999px;
      --page-max: 78rem;
      --page-gutter: clamp(1rem, 4vw, 3rem);
      --shadow-card: 0 16px 42px -28px var(--color-shadow), 0 2px 5px var(--color-shadow-soft);
      --shadow-card-hover: 0 22px 54px -30px var(--color-shadow), 0 4px 8px var(--color-shadow-soft);
      --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
    }

    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; overflow-x: clip; background: var(--color-paper); color: var(--color-ink); }
    html { scroll-behavior: smooth; }
    body { font-family: var(--font-body); font-size: 16px; line-height: 1.55; }
    button, input, textarea, select { font: inherit; }
    button { color: inherit; }
    a { color: inherit; }
    ::selection { background: var(--color-pear); color: var(--color-ink); }

    .skip {
      position: fixed; left: 1rem; top: -5rem; z-index: 100;
      background: var(--color-ink); color: var(--color-paper); padding: .7rem 1rem;
      border-radius: var(--radius-pill); font: 600 .75rem/1 var(--font-label);
    }
    .skip:focus { top: 1rem; }

    .nav-wrap {
      min-height: 78px;
      border-bottom: 1px solid var(--color-rule);
      background: var(--color-paper);
    }
    .nav {
      width: min(calc(100% - (var(--page-gutter) * 2)), var(--page-max));
      min-height: 78px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between; gap: 1.5rem;
      transition: min-height 180ms var(--ease-out), width 180ms var(--ease-out), border-color 180ms var(--ease-out), box-shadow 180ms var(--ease-out), background-color 180ms var(--ease-out), border-radius 180ms var(--ease-out), padding 180ms var(--ease-out);
    }
    .brand { display: inline-flex; align-items: center; gap: .7rem; text-decoration: none; font-weight: 700; letter-spacing: -.025em; white-space: nowrap; }
    .brand-mark {
      width: 25px; height: 30px; position: relative; flex: 0 0 auto;
      border: 2.5px solid var(--color-ink); border-radius: 8px; background: var(--color-quiet);
      box-shadow: inset 0 -10px 0 var(--color-pear);
    }
    .brand-mark::before {
      content: ""; position: absolute; left: 5px; right: 5px; top: -7px; height: 5px;
      border-radius: 3px 3px 0 0; background: var(--color-pear-deep); border: 2px solid var(--color-ink); border-bottom: 0;
    }
    .nav-meta { display: flex; align-items: center; gap: .75rem; }
    .nav-status {
      display: inline-flex; align-items: center; gap: .5rem; white-space: nowrap;
      font: 600 .67rem/1 var(--font-label); letter-spacing: .08em; text-transform: uppercase;
    }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-mint); box-shadow: 0 0 0 3px var(--color-mint-soft); }
    .nav-link {
      display: inline-flex; align-items: center; min-height: 38px; padding: 0 .9rem;
      border: 1px solid var(--color-rule); border-radius: var(--radius-pill); text-decoration: none;
      font-size: .85rem; font-weight: 600; white-space: nowrap;
      transition: background-color 160ms, border-color 160ms, transform 160ms var(--ease-out);
    }
    .nav-link:hover { background: var(--color-paper-2); border-color: var(--color-rule-strong); transform: translateY(-1px); }

    .page { width: min(calc(100% - (var(--page-gutter) * 2)), var(--page-max)); margin: 0 auto; padding: 4.2rem 0 5rem; }

    .intro { max-width: 72rem; margin-bottom: 2.6rem; }
    .steps { display: flex; align-items: center; gap: .45rem; flex-wrap: wrap; margin: 0 0 2rem; }
    .step {
      display: inline-flex; align-items: center; gap: .45rem; min-height: 31px;
      padding: 0 .75rem; border: 1px solid var(--color-rule); border-radius: var(--radius-pill);
      background: var(--color-paper-2); font: 600 .65rem/1 var(--font-label); letter-spacing: .12em; text-transform: uppercase; white-space: nowrap;
    }
    .step::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--step-color, var(--color-mint)); }
    .step:nth-child(2) { --step-color: var(--color-cyan); }
    .step:nth-child(3) { --step-color: var(--color-pear); }
    .step-line { width: 24px; height: 1px; background: var(--color-rule-strong); }

    h1 {
      max-width: 820px; margin: 0; font-family: var(--font-display); font-size: clamp(2.8rem, 6vw, 5.7rem);
      line-height: .98; letter-spacing: -.05em; font-weight: 600; font-style: normal; overflow-wrap: anywhere; min-width: 0;
    }
    .underline { position: relative; display: inline-block; z-index: 0; }
    .underline::after {
      content: ""; position: absolute; left: 0; right: 0; bottom: .06em; height: .14em; z-index: -1;
      background: var(--color-mint); transform: rotate(-1deg); border-radius: 999px;
    }
    .lede { max-width: 650px; margin: 1.45rem 0 0; color: var(--color-ink-2); font-size: clamp(1rem, 1.6vw, 1.16rem); }
    .microcopy { margin: 1rem 0 0; color: var(--color-muted); font: 500 .66rem/1.55 var(--font-label); text-transform: uppercase; letter-spacing: .1em; }

    .workbench {
      display: grid; grid-template-columns: minmax(0, .88fr) minmax(0, 1.45fr); gap: 1.25rem; align-items: start;
    }
    .panel {
      min-width: 0; border: 1.5px solid var(--color-rule); border-radius: var(--radius-panel);
      background: var(--color-quiet); box-shadow: var(--shadow-card); overflow: hidden;
    }
    .panel--setup { position: sticky; top: 1rem; }
    .panel-head {
      min-height: 66px; padding: 1rem 1.15rem; border-bottom: 1px solid var(--color-rule);
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    }
    .panel-kicker { margin: 0 0 .25rem; color: var(--color-muted); font: 600 .62rem/1 var(--font-label); letter-spacing: .12em; text-transform: uppercase; }
    .panel-title { margin: 0; font-size: 1.08rem; line-height: 1.15; letter-spacing: -.02em; font-weight: 700; font-style: normal; }
    .panel-chip {
      display: inline-flex; align-items: center; min-height: 28px; padding: 0 .65rem; border-radius: var(--radius-pill);
      background: var(--color-pear-soft); border: 1px solid var(--color-pear-deep); font: 600 .62rem/1 var(--font-label); letter-spacing: .08em; text-transform: uppercase; white-space: nowrap;
    }
    .panel-body { padding: 1.15rem; }

    .field { display: grid; gap: .5rem; margin-bottom: 1rem; }
    .field:last-child { margin-bottom: 0; }
    .field-label { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; font-size: .83rem; font-weight: 700; }
    .field-label small { color: var(--color-muted); font: 500 .6rem/1 var(--font-label); letter-spacing: .06em; text-transform: uppercase; }
    .account-wrap { position: relative; }
    .account-wrap::before {
      content: "01"; position: absolute; right: .8rem; top: .75rem; z-index: 2;
      color: var(--color-muted); font: 600 .6rem/1 var(--font-label); letter-spacing: .08em;
    }
    textarea, input[type="password"], select {
      width: 100%; border: 1.5px solid var(--color-rule-strong); border-radius: var(--radius-input);
      background: var(--color-paper); color: var(--color-ink); outline: 0;
      transition: border-color 140ms, box-shadow 140ms, background-color 140ms;
    }
    textarea { min-height: 116px; resize: vertical; padding: .95rem 2.4rem .95rem .95rem; font: 500 .78rem/1.55 var(--font-label); overflow-wrap: anywhere; }
    input[type="password"], select { min-height: 47px; padding: 0 .85rem; }
    textarea:focus, input[type="password"]:focus, select:focus { border-color: var(--color-cyan-deep); box-shadow: 0 0 0 4px var(--color-cyan-soft); background: var(--color-white); }
    textarea::placeholder, input::placeholder { color: var(--color-muted); opacity: .72; }

    .radio-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .65rem; }
    .radio { position: relative; min-width: 0; }
    .radio input { position: absolute; opacity: 0; pointer-events: none; }
    .radio label {
      display: block; min-height: 78px; padding: .8rem; cursor: pointer;
      border: 1.5px solid var(--color-rule); border-radius: 15px; background: var(--color-paper);
      transition: transform 150ms var(--ease-out), border-color 150ms, background-color 150ms, box-shadow 150ms;
    }
    .radio label:hover { transform: translateY(-2px); border-color: var(--color-cyan-deep); box-shadow: var(--shadow-card); }
    .radio input:checked + label { border-color: var(--color-cyan-deep); background: var(--color-cyan-soft); box-shadow: inset 0 0 0 1px var(--color-cyan-deep); }
    .radio input:focus-visible + label { outline: 3px solid var(--color-focus); outline-offset: 3px; }
    .radio-name { display: flex; align-items: center; gap: .5rem; font-weight: 700; font-size: .86rem; }
    .radio-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--color-cyan); border: 1px solid var(--color-cyan-deep); }
    .radio:nth-child(2) .radio-dot { background: var(--color-lavender); border-color: var(--color-ink); }
    .radio-note { display: block; margin-top: .28rem; color: var(--color-muted); font-size: .7rem; line-height: 1.35; }

    .row { display: grid; grid-template-columns: minmax(0, 1fr) 112px; gap: .75rem; }
    details.advanced { margin: .25rem 0 1rem; border-top: 1px solid var(--color-rule); border-bottom: 1px solid var(--color-rule); }
    details.advanced summary { min-height: 45px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; list-style: none; font-size: .8rem; font-weight: 700; }
    details.advanced summary::-webkit-details-marker { display: none; }
    details.advanced summary::after { content: "+"; font: 600 1rem/1 var(--font-label); }
    details.advanced[open] summary::after { content: "−"; }
    .advanced-body { padding: 0 0 1rem; }

    .btn {
      --btn-face: var(--color-mint); --btn-ink: var(--color-ink); --btn-edge: var(--color-mint-deep); --btn-cast: var(--color-shadow);
      width: 100%; min-height: 50px; display: inline-flex; align-items: center; justify-content: center; gap: .55rem;
      padding: .8rem 1.2rem; font-weight: 700; border: 0; border-radius: var(--radius-pill); cursor: pointer;
      color: var(--btn-ink); background: var(--btn-face); position: relative; isolation: isolate;
      box-shadow: 0 4px 0 0 var(--btn-edge), 0 6px 12px -3px var(--btn-cast); transform: translateY(0);
      transition: transform 140ms cubic-bezier(.2,.7,.3,1), box-shadow 140ms cubic-bezier(.2,.7,.3,1), background-color 160ms;
      white-space: nowrap;
    }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 6px 0 0 var(--btn-edge), 0 12px 22px -4px var(--btn-cast); }
    .btn:active { transform: translateY(3px); box-shadow: 0 1px 0 0 var(--btn-edge), 0 2px 6px -2px var(--btn-cast); transition-duration: 70ms; }
    .btn:focus-visible { outline: 3px solid var(--color-focus); outline-offset: 3px; }
    .btn[disabled] { opacity: .55; cursor: wait; pointer-events: none; transform: none; box-shadow: 0 4px 0 0 var(--btn-edge); }
    .btn-arrow { transition: transform 160ms var(--ease-out); }
    .btn:hover .btn-arrow { transform: translateX(3px); }

    .privacy-note { display: flex; align-items: flex-start; gap: .65rem; margin: 1.05rem 0 0; color: var(--color-muted); font-size: .72rem; line-height: 1.45; }
    .privacy-icon { flex: 0 0 auto; width: 21px; height: 21px; border-radius: 7px; display: grid; place-items: center; background: var(--color-pear-soft); border: 1px solid var(--color-pear-deep); font: 600 .65rem/1 var(--font-label); color: var(--color-ink); }

    .inbox-head { background: var(--color-pear-soft); }
    .count-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 38px; min-height: 30px; padding: 0 .55rem; border: 1px solid var(--color-ink); border-radius: var(--radius-pill); background: var(--color-pear); font: 700 .7rem/1 var(--font-label); }
    .inbox-body { min-height: 590px; padding: .85rem; background: var(--color-paper); }

    .empty {
      min-height: 555px; display: grid; place-items: center; padding: 2rem; text-align: center;
    }
    .empty-inner { max-width: 400px; }
    .mail-art { width: 132px; height: 104px; position: relative; margin: 0 auto 1.4rem; }
    .mail-art-envelope {
      position: absolute; left: 9px; right: 9px; bottom: 4px; height: 72px;
      border: 3px solid var(--color-ink); border-radius: 13px; background: var(--color-paper-2); overflow: hidden; box-shadow: 0 8px 0 var(--color-pear-deep);
    }
    .mail-art-envelope::before, .mail-art-envelope::after {
      content: ""; position: absolute; width: 88px; height: 88px; top: -55px; background: var(--color-pear); border: 3px solid var(--color-ink); transform: rotate(45deg);
    }
    .mail-art-envelope::before { left: -42px; }
    .mail-art-envelope::after { right: -42px; }
    .mail-art-stamp {
      position: absolute; z-index: 4; right: 0; top: 4px; width: 37px; height: 37px; display: grid; place-items: center;
      border: 2.5px solid var(--color-ink); border-radius: 11px; background: var(--color-coral); color: var(--color-white); font: 700 .7rem/1 var(--font-label); transform: rotate(6deg);
    }
    .empty-title { margin: 0; font-size: clamp(1.55rem, 3vw, 2.25rem); line-height: 1.05; letter-spacing: -.04em; font-weight: 600; font-style: normal; }
    .empty-copy { margin: .85rem auto 0; max-width: 34ch; color: var(--color-muted); font-size: .9rem; }

    .notice { display: none; margin: .15rem .15rem .85rem; padding: .85rem 1rem; border-radius: 14px; font-size: .82rem; line-height: 1.45; }
    .notice.is-error { display: block; background: var(--color-coral-soft); border: 1px solid var(--color-coral); color: var(--color-ink); }
    .notice.is-info { display: block; background: var(--color-cyan-soft); border: 1px solid var(--color-cyan); color: var(--color-ink); }

    .mail-list { display: grid; gap: .65rem; }
    .mail-card {
      min-width: 0; border: 1.5px solid var(--color-rule); border-radius: 17px; background: var(--color-quiet); overflow: hidden;
      transition: transform 170ms var(--ease-out), border-color 170ms, box-shadow 170ms, background-color 170ms;
    }
    .mail-card:hover { transform: translateY(-2px); border-color: var(--color-rule-strong); box-shadow: var(--shadow-card-hover); background: var(--color-white); }
    .mail-card[open] { border-color: var(--color-cyan-deep); background: var(--color-white); }
    .mail-summary { list-style: none; cursor: pointer; padding: 1rem; display: grid; grid-template-columns: 12px minmax(0, 1fr) auto; gap: .8rem; align-items: start; }
    .mail-summary::-webkit-details-marker { display: none; }
    .unread-dot { width: 10px; height: 10px; margin-top: .36rem; border-radius: 50%; background: var(--color-rule-strong); }
    .mail-card.is-unread .unread-dot { background: var(--color-coral); box-shadow: 0 0 0 4px var(--color-coral-soft); }
    .mail-main { min-width: 0; }
    .mail-subject { margin: 0; font-size: .97rem; font-weight: 700; line-height: 1.3; letter-spacing: -.015em; overflow-wrap: anywhere; }
    .mail-from { margin: .32rem 0 0; color: var(--color-muted); font-size: .74rem; line-height: 1.35; overflow-wrap: anywhere; }
    .mail-date { color: var(--color-muted); font: 500 .61rem/1.4 var(--font-label); text-align: right; white-space: nowrap; }
    .mail-preview { margin: .72rem 0 0 2.05rem; color: var(--color-ink-2); font-size: .81rem; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .mail-card[open] .mail-preview { display: none; }
    .mail-body { border-top: 1px solid var(--color-rule); margin: 0 1rem; padding: 1rem 0 1.15rem 2.05rem; }
    .mail-to { margin: 0 0 .75rem; color: var(--color-muted); font: 500 .63rem/1.5 var(--font-label); overflow-wrap: anywhere; }
    .mail-content { margin: 0; max-height: 360px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; font-size: .84rem; line-height: 1.62; color: var(--color-ink-2); }

    .loading { display: grid; gap: .7rem; padding: .15rem; }
    .skeleton { height: 90px; border-radius: 17px; border: 1.5px solid var(--color-rule); background: var(--color-paper-2); position: relative; overflow: hidden; }
    .skeleton::after { content: ""; position: absolute; inset: 0; background: var(--color-cyan-soft); transform: translateX(-100%); animation: sweep 1.15s ease-in-out infinite; }
    @keyframes sweep { to { transform: translateX(100%); } }

    .legend {
      margin-top: 1.25rem; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .75rem;
    }
    .legend-item { min-width: 0; padding: .95rem 1rem; border-top: 1px solid var(--color-rule); }
    .legend-n { margin: 0 0 .3rem; font: 600 .63rem/1 var(--font-label); letter-spacing: .1em; text-transform: uppercase; }
    .legend-n::before { content: ""; display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: .5rem; background: var(--dot, var(--color-mint)); }
    .legend-item:nth-child(2) { --dot: var(--color-cyan); }
    .legend-item:nth-child(3) { --dot: var(--color-pear); }
    .legend-p { margin: 0; color: var(--color-muted); font-size: .75rem; line-height: 1.45; }

    .footer {
      border-top: 1px solid var(--color-rule); padding: 1.4rem var(--page-gutter) 2rem;
    }
    .footer-inner { width: min(100%, var(--page-max)); margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 1rem; color: var(--color-muted); }
    .footer strong { color: var(--color-ink); }
    .footer-copy { font-size: .76rem; }
    .footer-code { font: 500 .62rem/1.5 var(--font-label); letter-spacing: .07em; text-transform: uppercase; text-align: right; }

    @media (max-width: 900px) {
      .page { padding-top: 3rem; }
      .workbench { grid-template-columns: minmax(0, 1fr); }
      .panel--setup { position: static; }
      .inbox-body { min-height: 470px; }
      .empty { min-height: 435px; }
    }

    @media (max-width: 620px) {
      .nav-wrap { min-height: 67px; }
      .nav { min-height: 67px; }
      .nav-status { display: none; }
      .nav-link { min-height: 36px; padding-inline: .75rem; font-size: .77rem; }
      .page { padding: 2.3rem 0 3rem; }
      .steps { gap: .35rem; margin-bottom: 1.45rem; }
      .step { min-height: 28px; padding-inline: .58rem; font-size: .56rem; }
      .step-line { width: 12px; }
      h1 { font-size: clamp(2.35rem, 13vw, 3.7rem); }
      .lede { margin-top: 1rem; font-size: .96rem; }
      .microcopy { font-size: .56rem; }
      .workbench { gap: .9rem; }
      .panel-head { min-height: 60px; padding: .9rem; }
      .panel-body { padding: .9rem; }
      .panel-chip { display: none; }
      .row { grid-template-columns: minmax(0, 1fr); }
      .radio-grid { grid-template-columns: minmax(0, 1fr); }
      .radio label { min-height: 67px; }
      .inbox-body { min-height: 390px; padding: .6rem; }
      .empty { min-height: 360px; padding: 1.3rem .8rem; }
      .mail-summary { grid-template-columns: 10px minmax(0, 1fr); gap: .62rem; padding: .85rem; }
      .mail-date { grid-column: 2; text-align: left; margin-top: -.1rem; white-space: normal; }
      .mail-preview { margin-left: 1.47rem; padding-right: .7rem; }
      .mail-body { margin-inline: .85rem; padding-left: 1.47rem; }
      .legend { grid-template-columns: minmax(0, 1fr); gap: 0; }
      .footer-inner { align-items: flex-start; flex-direction: column; }
      .footer-code { text-align: left; }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
    }
  </style>
</head>
<body>
  <a class="skip" href="#workbench">Skip to mailbox reader</a>

  <header class="nav-wrap">
    <nav class="nav" aria-label="Primary">
      <a class="brand" href="/" aria-label="read_email home">
        <span class="brand-mark" aria-hidden="true"></span>
        <span>read_email</span>
      </a>
      <div class="nav-meta">
        <span class="nav-status"><span class="status-dot" aria-hidden="true"></span>OAuth reader</span>
        <a class="nav-link" href="/health">Health</a>
      </div>
    </nav>
  </header>

  <main class="page" id="workbench">
    <section class="intro" aria-labelledby="page-title">
      <div class="steps" aria-label="How it works">
        <span class="step">01 account</span><span class="step-line" aria-hidden="true"></span>
        <span class="step">02 OAuth</span><span class="step-line" aria-hidden="true"></span>
        <span class="step">03 inbox</span>
      </div>
      <h1 id="page-title">One account in.<br />Your <span class="underline">inbox</span>, right here.</h1>
      <p class="lede">Paste the four-field account line, choose how to talk to Microsoft, and read the newest messages without leaving the page.</p>
      <p class="microcopy">Password field accepted for format compatibility · password is not used · credentials are not written to disk</p>
    </section>

    <section class="workbench" aria-label="Mailbox workbench">
      <form class="panel panel--setup" id="reader-form">
        <header class="panel-head">
          <div>
            <p class="panel-kicker">Connection</p>
            <h2 class="panel-title">Mailbox setup</h2>
          </div>
          <span class="panel-chip">4 fields</span>
        </header>

        <div class="panel-body">
          <div class="field">
            <label class="field-label" for="account">
              <span>Account line</span>
              <small>required</small>
            </label>
            <div class="account-wrap">
              <textarea id="account" name="account" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="email|password|refresh_token|client_id" required></textarea>
            </div>
          </div>

          <fieldset class="field" style="border:0;padding:0;margin-inline:0">
            <legend class="field-label" style="width:100%;margin-bottom:.5rem">
              <span>Backend</span>
              <small>choose one</small>
            </legend>
            <div class="radio-grid">
              <div class="radio">
                <input type="radio" id="backend-graph" name="backend" value="graph" checked />
                <label for="backend-graph">
                  <span class="radio-name"><span class="radio-dot"></span>Microsoft Graph</span>
                  <span class="radio-note">HTTPS · friendlier to serverless</span>
                </label>
              </div>
              <div class="radio">
                <input type="radio" id="backend-imap" name="backend" value="imap" />
                <label for="backend-imap">
                  <span class="radio-name"><span class="radio-dot"></span>IMAP OAuth2</span>
                  <span class="radio-note">Direct inbox protocol · port 993</span>
                </label>
              </div>
            </div>
          </fieldset>

          <div class="row">
            <div class="field">
              <label class="field-label" for="limit"><span>Messages</span><small>newest</small></label>
              <select id="limit" name="limit">
                <option value="5">5 messages</option>
                <option value="10" selected>10 messages</option>
                <option value="15">15 messages</option>
                <option value="25">25 messages</option>
              </select>
            </div>
            <div class="field">
              <label class="field-label" for="sort-view"><span>View</span><small>local</small></label>
              <select id="sort-view" disabled>
                <option>Newest first</option>
              </select>
            </div>
          </div>

          <details class="advanced">
            <summary>Advanced</summary>
            <div class="advanced-body">
              <div class="field">
                <label class="field-label" for="api-key"><span>API key</span><small>optional</small></label>
                <input id="api-key" name="api-key" type="password" autocomplete="off" placeholder="Only if READER_API_KEY is set" />
              </div>
            </div>
          </details>

          <button class="btn" id="read-button" type="submit">
            <span id="button-label">Read inbox</span>
            <span class="btn-arrow" aria-hidden="true">→</span>
          </button>

          <p class="privacy-note">
            <span class="privacy-icon" aria-hidden="true">✓</span>
            <span>The page sends the line only to this deployment's <code>/api/read</code> endpoint. It is not saved by the frontend.</span>
          </p>
        </div>
      </form>

      <section class="panel" aria-labelledby="inbox-title" aria-live="polite">
        <header class="panel-head inbox-head">
          <div>
            <p class="panel-kicker" id="inbox-kicker">Mailbox</p>
            <h2 class="panel-title" id="inbox-title">Inbox</h2>
          </div>
          <span class="count-badge" id="count-badge">—</span>
        </header>

        <div class="inbox-body">
          <div class="notice" id="notice" role="status"></div>
          <div id="results">
            <div class="empty">
              <div class="empty-inner">
                <div class="mail-art" aria-hidden="true">
                  <span class="mail-art-envelope"></span>
                  <span class="mail-art-stamp">@</span>
                </div>
                <h3 class="empty-title">Waiting for an account.</h3>
                <p class="empty-copy">Your newest messages will land here as a tidy, expandable stack.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>

    <section class="legend" aria-label="How the reader handles credentials">
      <article class="legend-item">
        <p class="legend-n">Account</p>
        <p class="legend-p">One four-field line per request. No bulk account list.</p>
      </article>
      <article class="legend-item">
        <p class="legend-n">Access</p>
        <p class="legend-p">Refresh token becomes a short-lived OAuth access token.</p>
      </article>
      <article class="legend-item">
        <p class="legend-n">Output</p>
        <p class="legend-p">Subject, sender, recipient, date and message text — nothing more.</p>
      </article>
    </section>
  </main>

  <footer class="footer">
    <div class="footer-inner">
      <p class="footer-copy"><strong>read_email</strong> · a small mailbox workbench</p>
      <p class="footer-code">Node.js · Graph / IMAP OAuth2 · Vercel / Heroku</p>
    </div>
  </footer>

  <script>
    (function () {
      var form = document.getElementById('reader-form');
      var account = document.getElementById('account');
      var apiKey = document.getElementById('api-key');
      var limit = document.getElementById('limit');
      var button = document.getElementById('read-button');
      var buttonLabel = document.getElementById('button-label');
      var results = document.getElementById('results');
      var notice = document.getElementById('notice');
      var countBadge = document.getElementById('count-badge');
      var inboxKicker = document.getElementById('inbox-kicker');

      function selectedBackend() {
        var checked = document.querySelector('input[name="backend"]:checked');
        return checked ? checked.value : 'graph';
      }

      function showNotice(message, type) {
        notice.className = 'notice ' + (type === 'error' ? 'is-error' : 'is-info');
        notice.textContent = message;
      }

      function clearNotice() {
        notice.className = 'notice';
        notice.textContent = '';
      }

      function setLoading(isLoading) {
        button.disabled = isLoading;
        buttonLabel.textContent = isLoading ? 'Reading…' : 'Read inbox';
        if (!isLoading) return;

        results.textContent = '';
        var loading = document.createElement('div');
        loading.className = 'loading';
        for (var i = 0; i < 4; i += 1) {
          var row = document.createElement('div');
          row.className = 'skeleton';
          loading.appendChild(row);
        }
        results.appendChild(loading);
        countBadge.textContent = '…';
      }

      function cleanText(value) {
        return typeof value === 'string' ? value.trim() : '';
      }

      function shortDate(value) {
        if (!value) return 'No date';
        var parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return String(value);
        return new Intl.DateTimeFormat(undefined, {
          month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }).format(parsed);
      }

      function listToText(value) {
        if (Array.isArray(value)) return value.filter(Boolean).join(', ');
        return cleanText(value);
      }

      function emptyResult(title, copy) {
        results.textContent = '';
        var wrap = document.createElement('div');
        wrap.className = 'empty';
        var inner = document.createElement('div');
        inner.className = 'empty-inner';
        var h = document.createElement('h3');
        h.className = 'empty-title';
        h.textContent = title;
        var p = document.createElement('p');
        p.className = 'empty-copy';
        p.textContent = copy;
        inner.appendChild(h);
        inner.appendChild(p);
        wrap.appendChild(inner);
        results.appendChild(wrap);
      }

      function renderMessages(messages) {
        results.textContent = '';
        if (!Array.isArray(messages) || messages.length === 0) {
          countBadge.textContent = '0';
          emptyResult('Inbox came back empty.', 'No messages were returned for this account and backend.');
          return;
        }

        countBadge.textContent = String(messages.length);
        var list = document.createElement('div');
        list.className = 'mail-list';

        messages.forEach(function (message) {
          var card = document.createElement('details');
          card.className = 'mail-card' + (message.unread === true ? ' is-unread' : '');

          var summary = document.createElement('summary');
          summary.className = 'mail-summary';

          var dot = document.createElement('span');
          dot.className = 'unread-dot';
          dot.setAttribute('aria-hidden', 'true');

          var main = document.createElement('div');
          main.className = 'mail-main';
          var subject = document.createElement('p');
          subject.className = 'mail-subject';
          subject.textContent = cleanText(message.subject) || '(no subject)';
          var from = document.createElement('p');
          from.className = 'mail-from';
          from.textContent = cleanText(message.from) || 'Unknown sender';
          main.appendChild(subject);
          main.appendChild(from);

          var date = document.createElement('time');
          date.className = 'mail-date';
          date.textContent = shortDate(message.date);
          if (message.date) date.dateTime = String(message.date);

          summary.appendChild(dot);
          summary.appendChild(main);
          summary.appendChild(date);

          var preview = document.createElement('p');
          preview.className = 'mail-preview';
          preview.textContent = cleanText(message.body) || 'No text body.';

          var body = document.createElement('div');
          body.className = 'mail-body';
          var to = document.createElement('p');
          to.className = 'mail-to';
          to.textContent = 'TO · ' + (listToText(message.to) || 'Unknown recipient');
          var content = document.createElement('pre');
          content.className = 'mail-content';
          content.textContent = cleanText(message.body) || 'No text body.';
          body.appendChild(to);
          body.appendChild(content);

          card.appendChild(summary);
          card.appendChild(preview);
          card.appendChild(body);
          list.appendChild(card);
        });

        results.appendChild(list);
      }

      form.addEventListener('submit', async function (event) {
        event.preventDefault();
        clearNotice();

        var line = account.value.trim();
        if (!line) {
          showNotice('Paste an account line first.', 'error');
          account.focus();
          return;
        }

        setLoading(true);
        inboxKicker.textContent = 'Connecting';

        try {
          var headers = { 'content-type': 'application/json' };
          if (apiKey.value.trim()) headers['x-api-key'] = apiKey.value.trim();

          var response = await fetch('/api/read', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
              account: line,
              backend: selectedBackend(),
              limit: Number(limit.value)
            })
          });

          var data;
          try {
            data = await response.json();
          } catch (parseError) {
            throw new Error('The server returned a non-JSON response.');
          }

          if (!response.ok || !data.ok) {
            throw new Error(data && data.error ? data.error : 'Mailbox request failed.');
          }

          inboxKicker.textContent = data.email || 'Mailbox';
          renderMessages(data.messages || []);
          showNotice('Connected with ' + String(data.backend || selectedBackend()).toUpperCase() + ' · newest messages loaded.', 'info');
        } catch (error) {
          inboxKicker.textContent = 'Mailbox';
          countBadge.textContent = '!';
          emptyResult('Could not read this inbox.', 'Check the account line, OAuth scope, token status and selected backend.');
          showNotice(error && error.message ? error.message : 'Mailbox request failed.', 'error');
        } finally {
          setLoading(false);
        }
      });
    })();
  </script>
</body>
</html>`;

module.exports = HOME_HTML;
