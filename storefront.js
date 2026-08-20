const API = 'https://titledesk-licensing.theharnesslab.workers.dev';

function money(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100);
}

function clampSeats(value) {
  return Math.max(1, Math.min(500, Number(value || 1) || 1));
}

function bindPlan({ seatsEl, totalEl, noteEl, statusEl, emailEl, checkoutBtn, term, defaultSeats }) {
  if (!checkoutBtn && !totalEl) return;

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
      const q = data.quote;
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
  term: 'monthly',
  defaultSeats: 1,
});

bindPlan({
  seatsEl: document.getElementById('enterprise-seats'),
  totalEl: document.getElementById('enterprise-quote-total'),
  noteEl: document.getElementById('enterprise-quote-note'),
  statusEl: document.getElementById('enterprise-status'),
  emailEl: document.getElementById('enterprise-email'),
  checkoutBtn: document.getElementById('checkout-enterprise'),
  term: 'annual',
  defaultSeats: 5,
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
