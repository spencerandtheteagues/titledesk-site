/* ==========================================================================
   TitleDesk storefront — title-desk.com

   CSP: script-src 'self'. No inline handlers; everything binds from here.

   The money rule enforced in this file: the number shown next to the pay
   button is ALWAYS the live quote returned by the licensing service. The page
   never asserts a price it cannot charge. Where the published rate and the
   service disagree — the Solo 12-month contracted rate, for instance — the
   button is disabled and the buyer is routed to a person instead of being
   quietly charged the wrong amount.
   ========================================================================== */

const API = 'https://titledesk-licensing.theharnesslab.workers.dev';

/* Published per-seat rates, in cents, that the service is expected to quote.
   Keep in step with the pricing table in index.html. A divergence is treated
   as a fault and blocks checkout rather than charging an unadvertised price. */
const PUBLISHED = {
  'solo:monthly': 24900,        // $249 / seat / month, month to month
  'solo:annual': 237600,        // $198 / seat / month on a 12-month contract
  'enterprise:annual': 418800,  // $349 / seat / month, always a 12-month contract
  'founder:annual': 238800,     // $199 / seat / month, billed annually
};

const seatsEl = document.getElementById('seats');
const totalEl = document.getElementById('quote-total');
const noteEl = document.getElementById('quote-note');
const statusEl = document.getElementById('buy-status');
const emailEl = document.getElementById('email');
const checkoutBtn = document.getElementById('checkout');
const termMonthly = document.getElementById('term-monthly');
const termAnnual = document.getElementById('term-annual');
const termHint = document.getElementById('term-hint');

let term = 'monthly';
let quoteTimer = 0;
let quoteToken = 0;
let checkoutBlocked = false;

function money(cents) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(cents / 100);
}

function seats() {
  return Math.max(1, Math.min(500, Number(seatsEl && seatsEl.value) || 1));
}

function setStatus(node, message, kind) {
  if (!node) return;
  node.textContent = message || '';
  node.className = kind ? 'status ' + kind : 'status';
}

function statusWithSalesLink(node, message, subject) {
  if (!node) return;
  node.textContent = '';
  node.append(document.createTextNode(message));
  if (!/sales@theharnesslab\.com/i.test(message)) {
    node.append(document.createTextNode(' Or '));
    const link = document.createElement('a');
    link.href = 'mailto:sales@theharnesslab.com?subject=' + encodeURIComponent(subject);
    link.textContent = 'email sales@theharnesslab.com';
    node.append(link, document.createTextNode('.'));
  }
}

/* --------------------------------------------------------------------------
   Term rules. Enterprise (2+ seats) is always a 12-month contract, so the
   monthly control is locked out rather than offered and then refused.
   -------------------------------------------------------------------------- */
function applyTermRules() {
  const multiSeat = seats() >= 2;

  if (multiSeat) {
    if (term !== 'annual') term = 'annual';
    if (termMonthly) {
      termMonthly.disabled = true;
      termMonthly.classList.remove('active');
      termMonthly.title = 'Enterprise is always a 12-month contract';
    }
    if (termAnnual) termAnnual.classList.add('active');
    if (termHint) {
      termHint.textContent =
        'Enterprise (2 or more seats) is always a 12-month contract, so the monthly option does not apply.';
    }
  } else {
    if (termMonthly) {
      termMonthly.disabled = false;
      termMonthly.title = '';
      termMonthly.classList.toggle('active', term === 'monthly');
    }
    if (termAnnual) termAnnual.classList.toggle('active', term === 'annual');
    if (termHint) {
      termHint.textContent = term === 'annual'
        ? 'The Solo 12-month rate of $198/seat is arranged with us directly — use the contact form below.'
        : 'Enterprise (2 or more seats) is always a 12-month contract.';
    }
  }
}

function blockCheckout(message, kind) {
  checkoutBlocked = true;
  if (checkoutBtn) {
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Arrange this plan with us';
  }
  setStatus(statusEl, '', null);
  if (statusEl) {
    statusEl.textContent = message + ' ';
    statusEl.className = 'status ' + (kind || 'warn');
    const link = document.createElement('a');
    link.href = '#contact';
    link.textContent = 'Contact The Harness Lab';
    statusEl.append(link);
  }
}

function unblockCheckout() {
  checkoutBlocked = false;
  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = 'Continue to Stripe';
  }
}

/* --------------------------------------------------------------------------
   Live quote
   -------------------------------------------------------------------------- */
async function refreshQuote() {
  if (!totalEl) return;
  applyTermRules();

  const token = ++quoteToken;
  try {
    const url = API + '/v1/pricing?seats=' + encodeURIComponent(String(seats())) +
      '&term=' + encodeURIComponent(term);
    const res = await fetch(url);
    const data = await res.json();
    if (token !== quoteToken) return; // a newer request has superseded this one
    if (!res.ok) throw new Error((data && data.error && data.error.message) || 'Could not load pricing.');

    const q = data.quote;
    if (!q) throw new Error('Pricing service returned no quote.');

    totalEl.textContent = q.label + ' · ' + money(q.totalCents);
    if (noteEl) noteEl.textContent = q.note || '';

    /* Guard: refuse to sell at a rate this page does not publish. */
    const key = q.plan + ':' + q.term;
    const expected = PUBLISHED[key];
    if (expected !== undefined && q.unitAmountCents !== expected) {
      blockCheckout(
        'This plan is quoting ' + money(q.unitAmountCents) + ' per seat, which does not match the ' +
        money(expected) + ' published here. We will not charge you an unpublished rate.',
        'err',
      );
      return;
    }
    if (expected === undefined) {
      blockCheckout('This combination is arranged directly rather than through checkout.', 'warn');
      return;
    }

    unblockCheckout();
    setStatus(statusEl, '', null);
  } catch (error) {
    if (token !== quoteToken) return;
    if (noteEl) {
      noteEl.textContent = error instanceof Error ? error.message : 'Pricing unavailable.';
    }
    totalEl.textContent = 'Pricing unavailable';
    blockCheckout('Checkout is unavailable right now.', 'err');
  }
}

function scheduleQuote() {
  window.clearTimeout(quoteTimer);
  quoteTimer = window.setTimeout(refreshQuote, 140);
}

if (termMonthly) {
  termMonthly.addEventListener('click', () => {
    if (termMonthly.disabled) return;
    term = 'monthly';
    refreshQuote();
  });
}
if (termAnnual) {
  termAnnual.addEventListener('click', () => {
    term = 'annual';
    refreshQuote();
  });
}
if (seatsEl) seatsEl.addEventListener('input', scheduleQuote);

/* --------------------------------------------------------------------------
   Checkout
   -------------------------------------------------------------------------- */
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', async () => {
    if (checkoutBlocked) {
      window.location.hash = '#contact';
      return;
    }
    if (!emailEl || !emailEl.checkValidity()) {
      if (emailEl) emailEl.reportValidity();
      return;
    }
    setStatus(statusEl, 'Opening Stripe…', null);
    checkoutBtn.disabled = true;
    try {
      const res = await fetch(API + '/v1/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seats: seats(), term: term, email: emailEl.value || '' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data && data.error && data.error.message) || 'Checkout failed.');
      if (!data.url) throw new Error('Stripe did not return a checkout URL.');
      window.location.href = data.url;
    } catch (error) {
      statusWithSalesLink(
        statusEl,
        error instanceof Error ? error.message : 'Checkout failed.',
        'TitleDesk ' + seats() + ' seat purchase',
      );
      if (statusEl) statusEl.className = 'status err';
      checkoutBtn.disabled = false;
    }
  });
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
      const res = await fetch(API + '/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(fd.get('name') || ''),
          email: String(fd.get('email') || ''),
          message: String(fd.get('message') || ''),
          seats: fd.get('seats') ? Number(fd.get('seats')) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data && data.error && data.error.message) || 'Could not send.');
      setStatus(status, 'Sent. Spencer will reply from sales@theharnesslab.com.', 'ok');
      form.reset();
    } catch (error) {
      statusWithSalesLink(
        status,
        error instanceof Error ? error.message : 'Could not send.',
        'TitleDesk inquiry',
      );
      if (status) status.className = 'status err';
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

refreshQuote();
