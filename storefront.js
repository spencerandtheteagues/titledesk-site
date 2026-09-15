/* ==========================================================================
   TitleDesk storefront — title-desk.com

   CSP: script-src 'self'. No inline handlers; everything binds from here.

   Every download starts with a plan. The download page offers four ways in
   (a 7-day Individual trial, an Individual seat, Enterprise seats, or a
   14-day Enterprise demo) plus "I already have a code"; the thank-you page
   shows the activation code the licensing service issued and the gated
   download links. Nothing on these pages hands out an installer link until
   the service has handed out a download token.

   The money rule: the number shown next to a pay button is ALWAYS the live
   quote returned by the licensing service. The page never asserts a price it
   cannot charge. Where the published rate and the service disagree, the
   button is disabled and the buyer is routed to a person instead of being
   quietly charged the wrong amount.
   ========================================================================== */

const API = 'https://titledesk-licensing.theharnesslab.workers.dev';

/* Published per-seat rates, in cents, that the service is expected to quote.
   Keep in step with the pricing pages. A divergence blocks checkout rather
   than charging an unadvertised price. */
const PUBLISHED = {
  'solo:monthly': 19900,        // Individual: $199 / month, month to month
  'enterprise:annual': 418800,  // Enterprise: $349 / seat / month, billed annually on a 12-month contract
  'founder:annual': 238800,     // Founder year one: $199 / seat / month, billed annually
};
const ENTERPRISE_MONTHLY_RATE = 34900;
const PLATFORMS = ['mac-arm64', 'mac-x64', 'windows'];

const page = document.body.dataset.page || '';
const params = new URLSearchParams(window.location.search);

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */
function $(id) { return document.getElementById(id); }

function money(cents, fraction) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: fraction ? 2 : 0, minimumFractionDigits: 0,
  }).format(cents / 100);
}

function setStatus(node, message, kind) {
  if (!node) return;
  node.textContent = message || '';
  node.className = kind ? 'status ' + kind : 'status';
}

function statusWithSalesLink(node, message, subject) {
  if (!node) return;
  node.textContent = '';
  node.className = 'status err';
  node.append(document.createTextNode(message + ' '));
  const link = document.createElement('a');
  link.href = 'mailto:sales@theharnesslab.com?subject=' + encodeURIComponent(subject);
  link.textContent = 'Email sales@theharnesslab.com';
  node.append(link, document.createTextNode('.'));
}

function customerSafeError(error, fallback) {
  const message = error instanceof Error ? error.message.trim() : '';
  if (!message || /failed to fetch|networkerror|load failed/i.test(message)) return fallback;
  return message;
}

async function api(path, options) {
  const res = await fetch(API + path, options);
  let data = null;
  try { data = await res.json(); } catch (_) { data = null; }
  if (!res.ok) {
    const error = new Error((data && data.error && data.error.message) || ('The licensing service answered HTTP ' + res.status + '.'));
    error.code = data && data.error && data.error.code;
    error.status = res.status;
    throw error;
  }
  return data;
}

function postJson(path, body) {
  return api(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

function downloadHref(platform, token) {
  return API + '/v1/download/' + platform + '?t=' + encodeURIComponent(token);
}

/* Point every [data-platform] button at the gated stream for this token. */
function armDownloadLinks(root, token) {
  root.querySelectorAll('[data-platform]').forEach((link) => {
    const platform = link.dataset.platform;
    if (PLATFORMS.indexOf(platform) === -1) return;
    link.href = downloadHref(platform, token);
    link.removeAttribute('aria-disabled');
  });
}

/* --------------------------------------------------------------------------
   Download page: choose a plan, or unlock with a code
   -------------------------------------------------------------------------- */
function initDownloadPage() {
  const choices = Array.prototype.slice.call(document.querySelectorAll('.choice[data-choice]'));
  const panels = {
    trial: $('panel-trial'), individual: $('panel-individual'), enterprise: $('panel-enterprise'), demo: $('panel-demo'),
  };
  const downloads = $('downloads');
  const chooser = $('choose');

  function select(name) {
    choices.forEach((button) => {
      const active = button.dataset.choice === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    Object.keys(panels).forEach((key) => { if (panels[key]) panels[key].hidden = key !== name; });
    if (name === 'enterprise') refreshEnterpriseQuote();
    const panel = panels[name];
    if (panel) {
      const first = panel.querySelector('input');
      if (first && document.activeElement && document.activeElement.classList.contains('choice')) first.focus({ preventScroll: true });
    }
  }
  choices.forEach((button) => button.addEventListener('click', () => select(button.dataset.choice)));

  function unlock(token, source) {
    if (!downloads) return;
    armDownloadLinks(downloads, token);
    downloads.hidden = false;
    if (chooser) chooser.classList.add('is-unlocked');
    const note = $('downloads-note');
    if (note) {
      note.textContent = source === 'link'
        ? 'This download link came from your activation email and is valid for 30 days.'
        : 'Unlocked. These links are valid for 30 days; the same activation code unlocks them again.';
    }
    downloads.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---- Individual: trial or purchase ---- */
  function bindCheckout(formId, statusId, trial) {
    const form = $(formId);
    if (!form) return;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = form.querySelector('input[type="email"]');
      const submit = form.querySelector('button[type="submit"]');
      const status = $(statusId);
      if (!email || !email.checkValidity()) { if (email) email.reportValidity(); return; }
      setStatus(status, 'Opening Stripe…', null);
      if (submit) submit.disabled = true;
      try {
        const quote = await api('/v1/pricing?seats=1&term=monthly');
        const unit = quote && quote.quote && quote.quote.unitAmountCents;
        if (unit !== PUBLISHED['solo:monthly']) {
          throw new Error('The Individual seat is quoting ' + money(unit) + ', which is not the $199 published here. No charge was attempted.');
        }
        const body = { seats: 1, term: 'monthly', email: email.value };
        if (trial) body.trial = true;
        const data = await postJson('/v1/checkout', body);
        if (!data.url) throw new Error('Stripe did not return a checkout URL.');
        window.location.href = data.url;
      } catch (error) {
        statusWithSalesLink(status, customerSafeError(error, 'Checkout could not open Stripe. No charge was made.'),
          trial ? 'TitleDesk 7-day trial' : 'TitleDesk Individual seat');
        if (submit) submit.disabled = false;
      }
    });
  }
  bindCheckout('trial-form', 'trial-status', true);
  bindCheckout('individual-form', 'individual-status', false);

  /* ---- Enterprise seats ---- */
  const seatsEl = $('seats');
  const totalEl = $('quote-total');
  const monthlyEl = $('quote-monthly');
  const noteEl = $('quote-note');
  const enterpriseForm = $('enterprise-form');
  const enterpriseStatus = $('enterprise-status');
  const enterpriseSubmit = enterpriseForm ? enterpriseForm.querySelector('button[type="submit"]') : null;
  let quoteToken = 0;
  let quoteTimer = 0;
  let enterpriseBlocked = true;

  function seats() { return Math.max(2, Math.min(500, Number(seatsEl && seatsEl.value) || 2)); }

  function blockEnterprise(message, kind) {
    enterpriseBlocked = true;
    if (enterpriseSubmit) enterpriseSubmit.disabled = true;
    setStatus(enterpriseStatus, message, kind || 'warn');
  }

  async function refreshEnterpriseQuote() {
    if (!totalEl) return;
    const token = ++quoteToken;
    const count = seats();
    if (seatsEl && Number(seatsEl.value) !== count) seatsEl.value = String(count);
    try {
      const data = await api('/v1/pricing?seats=' + count + '&term=annual');
      if (token !== quoteToken) return;
      const q = data.quote;
      if (!q) throw new Error('Pricing service returned no quote.');
      const key = q.plan + ':' + q.term;
      const expected = PUBLISHED[key];
      if (expected === undefined || q.unitAmountCents !== expected) {
        totalEl.textContent = 'Pricing mismatch';
        if (monthlyEl) monthlyEl.textContent = '';
        blockEnterprise('This plan is quoting ' + money(q.unitAmountCents) + ' per seat, which does not match the rate published here. We will not charge an unpublished rate.', 'err');
        return;
      }
      const perMonth = q.plan === 'founder' ? Math.round(q.unitAmountCents / 12) : ENTERPRISE_MONTHLY_RATE;
      if (monthlyEl) {
        monthlyEl.textContent = count + ' seats × ' + money(perMonth) + '/mo = ' + money(perMonth * count) + ' per month';
      }
      totalEl.textContent = 'Billed today for 12 months: ' + money(q.totalCents);
      if (noteEl) {
        noteEl.textContent = q.plan === 'founder'
          ? 'Founder year one: ' + money(q.unitAmountCents) + ' per seat for the first 12 months, then standard Enterprise at $4,188 per seat per year. One company, ever — this is it.'
          : 'Enterprise is a 12-month contract billed annually: ' + money(q.unitAmountCents) + ' per seat per year (' + money(ENTERPRISE_MONTHLY_RATE) + ' per seat per month). Each seat is one licensed computer.' +
            (q.note && /already been claimed/.test(q.note) ? ' The founder year-one rate has already been claimed.' : '');
      }
      enterpriseBlocked = false;
      if (enterpriseSubmit) enterpriseSubmit.disabled = false;
      setStatus(enterpriseStatus, '', null);
    } catch (error) {
      if (token !== quoteToken) return;
      totalEl.textContent = 'Pricing unavailable';
      if (monthlyEl) monthlyEl.textContent = '';
      blockEnterprise(customerSafeError(error, 'Could not reach the secure pricing service. No charge was attempted.'), 'err');
    }
  }
  if (seatsEl) {
    seatsEl.addEventListener('input', () => { window.clearTimeout(quoteTimer); quoteTimer = window.setTimeout(refreshEnterpriseQuote, 160); });
  }
  if (enterpriseForm) {
    enterpriseForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (enterpriseBlocked) return;
      const email = enterpriseForm.querySelector('input[type="email"]');
      if (!email || !email.checkValidity()) { if (email) email.reportValidity(); return; }
      setStatus(enterpriseStatus, 'Opening Stripe…', null);
      if (enterpriseSubmit) enterpriseSubmit.disabled = true;
      try {
        const data = await postJson('/v1/checkout', { seats: seats(), term: 'annual', email: email.value });
        if (!data.url) throw new Error('Stripe did not return a checkout URL.');
        window.location.href = data.url;
      } catch (error) {
        statusWithSalesLink(enterpriseStatus, customerSafeError(error, 'Checkout could not open Stripe. No charge was made.'), 'TitleDesk ' + seats() + ' seat purchase');
        if (enterpriseSubmit) enterpriseSubmit.disabled = false;
      }
    });
  }

  /* ---- Enterprise demo ---- */
  const demoForm = $('demo-form');
  if (demoForm) {
    demoForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = $('demo-status');
      const submit = demoForm.querySelector('button[type="submit"]');
      if (!demoForm.checkValidity()) { demoForm.reportValidity(); return; }
      const fd = new FormData(demoForm);
      setStatus(status, 'Setting up your demo…', null);
      if (submit) submit.disabled = true;
      try {
        const data = await postJson('/v1/demo/enterprise', {
          name: String(fd.get('name') || ''),
          email: String(fd.get('email') || ''),
          phone: String(fd.get('phone') || ''),
          company: String(fd.get('company') || ''),
          position: String(fd.get('position') || ''),
          address: String(fd.get('address') || ''),
          seats: Number(fd.get('seats')),
        });
        try { window.sessionStorage.setItem('titledesk.demo', JSON.stringify(data)); } catch (_) { /* private mode */ }
        window.location.href = '/thanks/?demo=1';
      } catch (error) {
        if (error && error.code === 'demo_exists') {
          setStatus(status, error.message, 'warn');
        } else {
          statusWithSalesLink(status, customerSafeError(error, 'The demo could not be set up. Nothing was charged.'), 'TitleDesk Enterprise demo');
        }
        if (submit) submit.disabled = false;
      }
    });
  }

  /* ---- Already have a code ---- */
  const unlockForm = $('unlock-form');
  if (unlockForm) {
    unlockForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = unlockForm.querySelector('input');
      const status = $('unlock-status');
      const submit = unlockForm.querySelector('button[type="submit"]');
      const code = input ? input.value.trim() : '';
      if (!code) { if (input) input.reportValidity(); return; }
      setStatus(status, 'Checking…', null);
      if (submit) submit.disabled = true;
      try {
        const data = await postJson('/v1/download/unlock', { code: code });
        setStatus(status, 'Code accepted.', 'ok');
        const url = new URL(window.location.href);
        url.searchParams.set('t', data.downloadToken);
        window.history.replaceState(null, '', url.toString());
        unlock(data.downloadToken, 'code');
      } catch (error) {
        statusWithSalesLink(status, customerSafeError(error, 'The code could not be checked.'), 'TitleDesk download');
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  }

  /* ---- Arrival ---- */
  const arrivalToken = params.get('t');
  if (arrivalToken && /^tddl_/.test(arrivalToken)) {
    unlock(arrivalToken, 'link');
  } else {
    const plan = params.get('plan');
    if (plan && panels[plan]) {
      select(plan);
      if (plan === 'enterprise' && seatsEl && params.get('seats')) seatsEl.value = params.get('seats');
      if (plan === 'enterprise') refreshEnterpriseQuote();
      if (chooser) chooser.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      select('trial');
    }
  }
}

/* --------------------------------------------------------------------------
   Thank-you page
   -------------------------------------------------------------------------- */
function initThanksPage() {
  const kicker = $('thanks-kicker');
  const title = $('thanks-title');
  const lede = $('thanks-lede');
  const status = $('thanks-status');
  const ready = $('thanks-ready');
  const codeEl = $('activation-code');
  const emailEl = $('thanks-email');
  const seatsEl = $('thanks-seats');
  const portal = $('portal-link');
  const trialNote = $('thanks-trial');
  const demoNote = $('thanks-demo');
  const copy = $('copy-code');

  function show(fields) {
    if (kicker && fields.kicker) kicker.textContent = fields.kicker;
    if (title && fields.title) title.textContent = fields.title;
    if (lede && fields.lede) lede.textContent = fields.lede;
  }

  function reveal(result) {
    if (codeEl) codeEl.textContent = result.activationCode;
    if (emailEl) emailEl.textContent = result.email || '';
    if (seatsEl) {
      const n = Number(result.seats || result.deviceLimit || 1);
      seatsEl.textContent = n === 1 ? 'one computer' : 'up to ' + n + ' computers';
    }
    if (ready) {
      armDownloadLinks(ready, result.downloadToken);
      ready.hidden = false;
    }
    if (trialNote) trialNote.hidden = !result.trial;
    if (demoNote) demoNote.hidden = result.plan !== 'enterprise-demo';
    if (portal) portal.hidden = result.plan === 'enterprise-demo';
    setStatus(status, '', null);
  }

  if (copy && codeEl) {
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeEl.textContent || '');
        copy.textContent = 'Copied';
        window.setTimeout(() => { copy.textContent = 'Copy'; }, 1800);
      } catch (_) {
        const range = document.createRange();
        range.selectNodeContents(codeEl);
        const selection = window.getSelection();
        if (selection) { selection.removeAllRanges(); selection.addRange(range); }
      }
    });
  }

  const sessionId = params.get('session_id');
  if (params.get('demo') === '1') {
    let demo = null;
    try { demo = JSON.parse(window.sessionStorage.getItem('titledesk.demo') || 'null'); } catch (_) { demo = null; }
    if (!demo || !demo.activationCode) {
      show({ kicker: 'Enterprise demo', title: 'Your demo details were emailed to you.',
        lede: 'This page could not reload the demo record in this browser, but the activation code and download link are in the email we just sent. Spencer will call you to set the demo up.' });
      return;
    }
    show({ kicker: 'Enterprise demo · 14 days', title: 'Thank you, ' + demo.name + '. Your TitleDesk demo is ready.',
      lede: 'Your activation code is below and in the email we sent to ' + demo.email + '. Spencer will call you to set the demo up, walk through the workflow and handle anything in the way. The 14 days start when the first computer activates.' });
    reveal(demo);
    return;
  }

  if (!sessionId) {
    show({ kicker: 'Receipt', title: 'Nothing to show yet.', lede: 'Open this page from the link Stripe sends you after checkout, or from your activation email.' });
    return;
  }

  show({ kicker: 'Thank you', title: 'Thank you for purchasing TitleDesk Agent.', lede: 'Your activation code will appear here in a moment — it is also being emailed to you.' });
  let attempts = 0;
  let portalArmed = false;

  if (portal) {
    portal.addEventListener('click', async (event) => {
      event.preventDefault();
      if (portalArmed) return;
      portalArmed = true;
      portal.textContent = 'Opening the billing portal…';
      try {
        const data = await postJson('/v1/billing/portal-by-session', { sessionId: sessionId });
        window.location.href = data.url;
      } catch (error) {
        portalArmed = false;
        portal.textContent = 'Manage or cancel your subscription';
        statusWithSalesLink(status, customerSafeError(error, 'The billing portal could not be opened.'), 'TitleDesk billing');
      }
    });
  }

  async function poll() {
    attempts += 1;
    let result;
    try {
      result = await api('/v1/checkout/result?session_id=' + encodeURIComponent(sessionId));
    } catch (error) {
      if (error && error.status === 404) {
        show({ kicker: 'Receipt', title: 'We could not find that checkout.', lede: 'If you completed a purchase, your activation email is on its way. Otherwise start again from the download page.' });
        setStatus(status, '', null);
        return;
      }
      if (attempts < 60) { window.setTimeout(poll, 5000); }
      setStatus(status, 'Still confirming with Stripe… this page keeps trying on its own.', 'warn');
      return;
    }
    switch (result.state) {
      case 'ready':
        show({
          kicker: result.trial ? 'Your 7-day trial has started' : 'Thank you for purchasing TitleDesk Agent',
          title: result.trial ? 'Your TitleDesk trial is ready.' : 'Thank you for purchasing TitleDesk Agent.',
          lede: 'Your activation code is below' + (result.emailSent ? ' and in the email we sent to ' + result.email + '.' : '. The same code is being emailed to ' + result.email + '.') +
            ' Enter it into your downloaded copy of TitleDesk to activate it.',
        });
        reveal(result);
        return;
      case 'card_declined':
        show({ kicker: 'Trial not started', title: 'Your card was declined, so the trial was not started.',
          lede: 'The $1 verification could not be completed (' + (result.reason || 'declined') + '). Nothing was charged and no subscription exists. Start again with another card from the download page.' });
        setStatus(status, '', null);
        return;
      case 'incomplete':
        show({ kicker: 'Checkout not finished', title: 'The checkout was not completed.', lede: 'No charge was made. Start again from the download page whenever you are ready.' });
        setStatus(status, '', null);
        return;
      case 'manual':
        show({ kicker: 'Thank you', title: 'Payment received.', lede: 'This purchase is provisioned by hand. Your activation email arrives from licenses@theharnesslab.com shortly; write sales@theharnesslab.com if it has not arrived within the hour.' });
        setStatus(status, '', null);
        return;
      case 'payment_pending':
        setStatus(status, 'Stripe is still settling the payment. This page keeps checking; your email arrives when it clears.', 'warn');
        break;
      case 'verifying':
        setStatus(status, 'Verifying your card ($1, refunded immediately)…', 'warn');
        break;
      default:
        setStatus(status, 'Issuing your licence…', 'warn');
    }
    if (attempts < 60) {
      window.setTimeout(poll, attempts < 6 ? 2500 : 5000);
    } else {
      setStatus(status, 'This is taking longer than usual. Your activation email will still arrive; write sales@theharnesslab.com if it has not within the hour.', 'warn');
    }
  }
  poll();
}

/* --------------------------------------------------------------------------
   Contact
   -------------------------------------------------------------------------- */
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = document.getElementById('contact-status');
    const submit = form.querySelector('button[type="submit"]');
    const fd = new FormData(form);
    setStatus(status, 'Sending…', null);
    if (submit) submit.disabled = true;
    try {
      await postJson('/v1/contact', {
        name: String(fd.get('name') || ''),
        email: String(fd.get('email') || ''),
        message: String(fd.get('message') || ''),
        seats: fd.get('seats') ? Number(fd.get('seats')) : undefined,
      });
      setStatus(status, 'Sent. Spencer will reply from sales@theharnesslab.com.', 'ok');
      form.reset();
    } catch (error) {
      statusWithSalesLink(status, error instanceof Error ? error.message : 'Could not send.', 'TitleDesk inquiry');
    } finally {
      if (submit) submit.disabled = false;
    }
  });
}

/* --------------------------------------------------------------------------
   Scroll reveal. Drives the readout meters too, via the .is-in class.
   -------------------------------------------------------------------------- */
const revealables = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!('IntersectionObserver' in window) || reduceMotion) {
  /* Leave the content in its default visible state — no gate applied. */
  revealables.forEach((el) => el.classList.add('is-in'));
} else {
  /* Only now is it safe to hide anything: the observer that brings it back
     is about to be attached in this same turn. */
  document.documentElement.classList.add('reveal-ready');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
  revealables.forEach((el) => observer.observe(el));
}

if (page === 'download') initDownloadPage();
if (page === 'thanks') initThanksPage();
