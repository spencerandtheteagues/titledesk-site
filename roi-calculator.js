'use strict';

const form = document.getElementById('roi-calculator');
const numbers = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function updateEstimate() {
  const inputs = [...form.querySelectorAll('input')];
  const valid = inputs.every(input => input.value.trim() !== '' && input.validity.valid && Number.isFinite(input.valueAsNumber));
  document.getElementById('roi-input-message').textContent = valid ? '' : 'Enter a valid, nonnegative number in each field to calculate your estimate.';
  document.getElementById('roi-results').hidden = !valid;
  if (!valid) return;
  const [before, after, rate, count, software, extra] = inputs.map(input => input.valueAsNumber);
  const perAssignment = before - after;
  const hours = perAssignment * count;
  const costs = software + extra;
  const perAssignmentValue = perAssignment * rate;
  document.getElementById('roi-per-assignment').replaceChildren(document.createTextNode(numbers.format(perAssignment)), Object.assign(document.createElement('small'), { textContent: 'hours' }));
  document.getElementById('roi-hours').replaceChildren(document.createTextNode(numbers.format(hours)), Object.assign(document.createElement('small'), { textContent: 'hours' }));
  document.getElementById('roi-value').textContent = dollars.format(hours * rate - costs);
  document.getElementById('roi-break-even').textContent = costs === 0 ? '0' : perAssignmentValue > 0 ? numbers.format(Math.ceil(costs / perAssignmentValue)) : '—';
}

form.addEventListener('input', updateEstimate);
form.addEventListener('submit', event => event.preventDefault());
updateEstimate();
