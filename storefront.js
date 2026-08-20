const API = 'https://titledesk-licensing.theharnesslab.workers.dev';

/** Stale worker catalog: Solo annual still $249*12. Site displays $198 until the worker is updated. */
const SOLO_ANNUAL_STALE_YEAR_CENTS = 24900 * 12; // 298800
const SOLO_ANNUAL_YEAR_CENTS = 19800 * 12; // 237600

function money(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100);
}

function clampSeats(value) {
  return Math.max(1, Math.min(500, Number(value || 1) || 1));
}

function adjustSoloQuote(quote, seatCount, term) {
  if (term !== 'annual' || !quote || !Number.isFinite(quote.totalCents)) return quote;
  const perSeatYear = Math.round(quote.totalCents / seatCount);
  if (perSeatYear !== SOLO_ANNUAL_STALE_YEAR_CENTS) return quote;
  return {
    ...quote,
    totalCents: SOLO_ANNUAL_YEAR_CENTS * seatCount,
    note: '12-month contract · $198 / seat / mo billed annually ($2,376 / seat / year).',
  };
}

function bindPlan({
  seatsEl,
  totalEl,
  noteEl,
  statusEl,
  emailEl,
  checkoutBtn,
  defaultSeats,
  initialTerm,
  termMonthlyBtn,
  termAnnualBtn,
  adjustQuote,
}) {
  if (!checkoutBtn && !totalEl) return;

  let term = initialTerm;
  let quoteTimer = 0;

  function seats() {
    return clampSeats(seatsEl?.value ?? defaultSeats);
  }

  async function refreshQuote() {
    if (!totalEl) return;
    try {
      const url = `${API}/v1/pricing?seats=${encodeURIComponent(String(seats()))}&term=${term}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Could not load pricing.');
      let q = data.quote;
      if (adjustQuote) q = adjustQuote(q, seats(), term);
      totalEl.textContent = `${q.label} · ${money(q.totalCents)}`;
      if (noteEl) noteEl.textContent = q.note;
      if (statusEl) {
        statusEl.textContent = '';
        statusEl.className = 'status';
      }
    } catch (error) {
      if (noteEl) noteEl.textContent = error instanceof Error ? error.message : 'Pricing unavailable.';
    }
  }

  function scheduleQuote() {
    window.clearTimeout(quoteTimer);
    quoteTimer = window.setTimeout(refreshQuote, 120);
  }

  seatsEl?.addEventListener('input', scheduleQuote);

  termMonthlyBtn?.addEventListener('click', () => {
    term = 'monthly';
    termMonthlyBtn.classList.add('active');
    termAnnualBtn?.classList.remove('active');
    refreshQuote();
  });

  termAnnualBtn?.addEventListener('click', () => {
    term = 'annual';
    termAnnualBtn.classList.add('active');
    termMonthlyBtn?.classList.remove('active');
    refreshQuote();
  });

  checkoutBtn?.addEventListener('click', async () => {
    if (statusEl) {
      statusEl.textContent = 'Opening Stripe…';
      statusEl.className = 'status';
    }
    checkoutBtn.disabled = true;
    try {
      const res = await fetch(`${API}/v1/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seats: seats(),
          term,
          email: emailEl?.value || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Checkout failed.');
      if (!data.url) throw new Error('Stripe did not return a checkout URL.');
      window.location.href = data.url;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout failed.';
      const mail = `mailto:sales@theharnesslab.com?subject=${encodeURIComponent(`TitleDesk ${seats()} seat purchase`)}`;
      if (statusEl) {
        statusEl.innerHTML = /sales@theharnesslab\.com/i.test(message)
          ? message
          : `${message} Or <a href="${mail}">email sales@theharnesslab.com</a>.`;
        statusEl.className = 'status err';
      }
      checkoutBtn.disabled = false;
    }
  });

  refreshQuote();
}

bindPlan({
  seatsEl: document.getElementById('solo-seats'),
  totalEl: document.getElementById('solo-quote-total'),
  noteEl: document.getElementById('solo-quote-note'),
  statusEl: document.getElementById('solo-status'),
  emailEl: document.getElementById('solo-email'),
  checkoutBtn: document.getElementById('checkout-solo'),
  defaultSeats: 1,
  initialTerm: 'monthly',
  termMonthlyBtn: document.getElementById('solo-term-monthly'),
  termAnnualBtn: document.getElementById('solo-term-annual'),
  adjustQuote: adjustSoloQuote,
});

bindPlan({
  seatsEl: document.getElementById('enterprise-seats'),
  totalEl: document.getElementById('enterprise-quote-total'),
  noteEl: document.getElementById('enterprise-quote-note'),
  statusEl: document.getElementById('enterprise-status'),
  emailEl: document.getElementById('enterprise-email'),
  checkoutBtn: document.getElementById('checkout-enterprise'),
  defaultSeats: 5,
  initialTerm: 'annual',
});

const form = document.getElementById('contact-form');
form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const status = document.getElementById('contact-status');
  const fd = new FormData(form);
  status.textContent = 'Sending…';
  status.className = 'status';
  try {
    const res = await fetch(`${API}/v1/contact`, {
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
    if (!res.ok) throw new Error(data?.error?.message || 'Could not send.');
    status.textContent = 'Sent. We will reply from sales@theharnesslab.com.';
    status.className = 'status ok';
    form.reset();
  } catch (error) {
    status.innerHTML = `${error instanceof Error ? error.message : 'Could not send.'} Or email <a href="mailto:sales@theharnesslab.com">sales@theharnesslab.com</a>.`;
    status.className = 'status err';
  }
});
