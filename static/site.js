const publicCosts = {"1":{"runs":1,"name":"Pay per run","total":"$249","perRun":"$249"},"2":{"runs":2,"name":"Pay per run","total":"$498","perRun":"$249"},"3":{"runs":3,"name":"Pay per run","total":"$747","perRun":"$249"},"4":{"runs":4,"name":"Pay per run","total":"$996","perRun":"$249"},"5":{"runs":5,"name":"Pay per run","total":"$1,245","perRun":"$249"},"6":{"runs":6,"name":"Solo plan","total":"$1,299","perRun":"$216.50"},"7":{"runs":7,"name":"Solo plan","total":"$1,299","perRun":"$185.57"},"8":{"runs":8,"name":"Solo plan","total":"$1,299","perRun":"$162.38"},"9":{"runs":9,"name":"Solo plan","total":"$1,518","perRun":"$168.67"},"10":{"runs":10,"name":"Solo plan","total":"$1,737","perRun":"$173.70"},"11":{"runs":11,"name":"Solo plan","total":"$1,956","perRun":"$177.82"},"12":{"runs":12,"name":"Solo plan","total":"$2,175","perRun":"$181.25"},"13":{"runs":13,"name":"Solo plan","total":"$2,394","perRun":"$184.15"},"14":{"runs":14,"name":"Solo plan","total":"$2,613","perRun":"$186.64"},"15":{"runs":15,"name":"Solo plan","total":"$2,832","perRun":"$188.80"},"16":{"runs":16,"name":"Solo plan","total":"$3,051","perRun":"$190.69"},"17":{"runs":17,"name":"Solo plan","total":"$3,270","perRun":"$192.35"},"18":{"runs":18,"name":"Solo plan","total":"$3,489","perRun":"$193.83"},"19":{"runs":19,"name":"Solo plan","total":"$3,708","perRun":"$195.16"},"20":{"runs":20,"name":"Pro plan","total":"$3,899","perRun":"$194.95"},"21":{"runs":21,"name":"Pro plan","total":"$3,899","perRun":"$185.67"},"22":{"runs":22,"name":"Pro plan","total":"$3,899","perRun":"$177.23"},"23":{"runs":23,"name":"Pro plan","total":"$3,899","perRun":"$169.52"},"24":{"runs":24,"name":"Pro plan","total":"$3,899","perRun":"$162.46"},"25":{"runs":25,"name":"Pro plan","total":"$3,899","perRun":"$155.96"},"26":{"runs":26,"name":"Pro plan","total":"$4,098","perRun":"$157.62"},"27":{"runs":27,"name":"Pro plan","total":"$4,297","perRun":"$159.15"},"28":{"runs":28,"name":"Pro plan","total":"$4,496","perRun":"$160.57"},"29":{"runs":29,"name":"Pro plan","total":"$4,695","perRun":"$161.90"},"30":{"runs":30,"name":"Pro plan","total":"$4,894","perRun":"$163.13"},"31":{"runs":31,"name":"Pro plan","total":"$5,093","perRun":"$164.29"},"32":{"runs":32,"name":"Pro plan","total":"$5,292","perRun":"$165.38"},"33":{"runs":33,"name":"Pro plan","total":"$5,491","perRun":"$166.39"},"34":{"runs":34,"name":"Pro plan","total":"$5,690","perRun":"$167.35"},"35":{"runs":35,"name":"Pro plan","total":"$5,889","perRun":"$168.26"},"36":{"runs":36,"name":"Pro plan","total":"$6,088","perRun":"$169.11"},"37":{"runs":37,"name":"Pro plan","total":"$6,287","perRun":"$169.92"},"38":{"runs":38,"name":"Pro plan","total":"$6,486","perRun":"$170.68"},"39":{"runs":39,"name":"Pro plan","total":"$6,685","perRun":"$171.41"},"40":{"runs":40,"name":"Pro plan","total":"$6,884","perRun":"$172.10"},"41":{"runs":41,"name":"Pro plan","total":"$7,083","perRun":"$172.76"},"42":{"runs":42,"name":"Pro plan","total":"$7,282","perRun":"$173.38"},"43":{"runs":43,"name":"Pro plan","total":"$7,481","perRun":"$173.98"},"44":{"runs":44,"name":"Pro plan","total":"$7,680","perRun":"$174.55"},"45":{"runs":45,"name":"Pro plan","total":"$7,879","perRun":"$175.09"},"46":{"runs":46,"name":"Pro plan","total":"$8,078","perRun":"$175.61"},"47":{"runs":47,"name":"Pro plan","total":"$8,277","perRun":"$176.11"},"48":{"runs":48,"name":"Pro plan","total":"$8,476","perRun":"$176.58"},"49":{"runs":49,"name":"Pro plan","total":"$8,675","perRun":"$177.04"},"50":{"runs":50,"name":"Pro plan","total":"$8,874","perRun":"$177.48"},"51":{"runs":51,"name":"Pro plan","total":"$9,073","perRun":"$177.90"},"52":{"runs":52,"name":"Pro plan","total":"$9,272","perRun":"$178.31"},"53":{"runs":53,"name":"Pro plan","total":"$9,471","perRun":"$178.70"},"54":{"runs":54,"name":"Pro plan","total":"$9,670","perRun":"$179.07"},"55":{"runs":55,"name":"Pro plan","total":"$9,869","perRun":"$179.44"},"56":{"runs":56,"name":"Enterprise plan","total":"$9,999","perRun":"$178.55"},"57":{"runs":57,"name":"Enterprise plan","total":"$9,999","perRun":"$175.42"},"58":{"runs":58,"name":"Enterprise plan","total":"$9,999","perRun":"$172.40"},"59":{"runs":59,"name":"Enterprise plan","total":"$9,999","perRun":"$169.47"},"60":{"runs":60,"name":"Enterprise plan","total":"$9,999","perRun":"$166.65"},"61":{"runs":61,"name":"Enterprise plan","total":"$9,999","perRun":"$163.92"},"62":{"runs":62,"name":"Enterprise plan","total":"$9,999","perRun":"$161.27"},"63":{"runs":63,"name":"Enterprise plan","total":"$9,999","perRun":"$158.71"},"64":{"runs":64,"name":"Enterprise plan","total":"$9,999","perRun":"$156.23"},"65":{"runs":65,"name":"Enterprise plan","total":"$9,999","perRun":"$153.83"},"66":{"runs":66,"name":"Enterprise plan","total":"$9,999","perRun":"$151.50"},"67":{"runs":67,"name":"Enterprise plan","total":"$9,999","perRun":"$149.24"},"68":{"runs":68,"name":"Enterprise plan","total":"$9,999","perRun":"$147.04"},"69":{"runs":69,"name":"Enterprise plan","total":"$9,999","perRun":"$144.91"},"70":{"runs":70,"name":"Enterprise plan","total":"$9,999","perRun":"$142.84"},"71":{"runs":71,"name":"Enterprise plan","total":"$10,178","perRun":"$143.35"},"72":{"runs":72,"name":"Enterprise plan","total":"$10,357","perRun":"$143.85"},"73":{"runs":73,"name":"Enterprise plan","total":"$10,536","perRun":"$144.33"},"74":{"runs":74,"name":"Enterprise plan","total":"$10,715","perRun":"$144.80"},"75":{"runs":75,"name":"Enterprise plan","total":"$10,894","perRun":"$145.25"},"76":{"runs":76,"name":"Enterprise plan","total":"$11,073","perRun":"$145.70"},"77":{"runs":77,"name":"Enterprise plan","total":"$11,252","perRun":"$146.13"},"78":{"runs":78,"name":"Enterprise plan","total":"$11,431","perRun":"$146.55"},"79":{"runs":79,"name":"Enterprise plan","total":"$11,610","perRun":"$146.96"},"80":{"runs":80,"name":"Enterprise plan","total":"$11,789","perRun":"$147.36"},"81":{"runs":81,"name":"Enterprise plan","total":"$11,968","perRun":"$147.75"},"82":{"runs":82,"name":"Enterprise plan","total":"$12,147","perRun":"$148.13"},"83":{"runs":83,"name":"Enterprise plan","total":"$12,326","perRun":"$148.51"},"84":{"runs":84,"name":"Enterprise plan","total":"$12,505","perRun":"$148.87"},"85":{"runs":85,"name":"Enterprise plan","total":"$12,684","perRun":"$149.22"},"86":{"runs":86,"name":"Enterprise plan","total":"$12,863","perRun":"$149.57"},"87":{"runs":87,"name":"Enterprise plan","total":"$13,042","perRun":"$149.91"},"88":{"runs":88,"name":"Enterprise plan","total":"$13,221","perRun":"$150.24"},"89":{"runs":89,"name":"Enterprise plan","total":"$13,400","perRun":"$150.56"},"90":{"runs":90,"name":"Enterprise plan","total":"$13,579","perRun":"$150.88"},"91":{"runs":91,"name":"Enterprise plan","total":"$13,758","perRun":"$151.19"},"92":{"runs":92,"name":"Enterprise plan","total":"$13,937","perRun":"$151.49"},"93":{"runs":93,"name":"Enterprise plan","total":"$14,116","perRun":"$151.78"},"94":{"runs":94,"name":"Enterprise plan","total":"$14,295","perRun":"$152.07"},"95":{"runs":95,"name":"Enterprise plan","total":"$14,474","perRun":"$152.36"},"96":{"runs":96,"name":"Enterprise plan","total":"$14,653","perRun":"$152.64"},"97":{"runs":97,"name":"Enterprise plan","total":"$14,832","perRun":"$152.91"},"98":{"runs":98,"name":"Enterprise plan","total":"$15,011","perRun":"$153.17"},"99":{"runs":99,"name":"Enterprise plan","total":"$15,190","perRun":"$153.43"},"100":{"runs":100,"name":"Enterprise plan","total":"$15,369","perRun":"$153.69"},"101":{"runs":101,"name":"Enterprise plan","total":"$15,548","perRun":"$153.94"},"102":{"runs":102,"name":"Enterprise plan","total":"$15,727","perRun":"$154.19"},"103":{"runs":103,"name":"Enterprise plan","total":"$15,906","perRun":"$154.43"},"104":{"runs":104,"name":"Enterprise plan","total":"$16,085","perRun":"$154.66"},"105":{"runs":105,"name":"Enterprise plan","total":"$16,264","perRun":"$154.90"},"106":{"runs":106,"name":"Enterprise plan","total":"$16,443","perRun":"$155.12"},"107":{"runs":107,"name":"Enterprise plan","total":"$16,622","perRun":"$155.35"},"108":{"runs":108,"name":"Enterprise plan","total":"$16,801","perRun":"$155.56"},"109":{"runs":109,"name":"Enterprise plan","total":"$16,980","perRun":"$155.78"},"110":{"runs":110,"name":"Enterprise plan","total":"$17,159","perRun":"$155.99"},"111":{"runs":111,"name":"Enterprise plan","total":"$17,338","perRun":"$156.20"},"112":{"runs":112,"name":"Enterprise plan","total":"$17,517","perRun":"$156.40"},"113":{"runs":113,"name":"Enterprise plan","total":"$17,696","perRun":"$156.60"},"114":{"runs":114,"name":"Enterprise plan","total":"$17,875","perRun":"$156.80"},"115":{"runs":115,"name":"Enterprise plan","total":"$18,054","perRun":"$156.99"},"116":{"runs":116,"name":"Enterprise plan","total":"$18,233","perRun":"$157.18"},"117":{"runs":117,"name":"Enterprise plan","total":"$18,412","perRun":"$157.37"},"118":{"runs":118,"name":"Enterprise plan","total":"$18,591","perRun":"$157.55"},"119":{"runs":119,"name":"Enterprise plan","total":"$18,770","perRun":"$157.73"},"120":{"runs":120,"name":"Enterprise plan","total":"$18,949","perRun":"$157.91"},"121":{"runs":121,"name":"Enterprise plan","total":"$19,128","perRun":"$158.08"},"122":{"runs":122,"name":"Enterprise plan","total":"$19,307","perRun":"$158.25"},"123":{"runs":123,"name":"Enterprise plan","total":"$19,486","perRun":"$158.42"},"124":{"runs":124,"name":"Enterprise plan","total":"$19,665","perRun":"$158.59"},"125":{"runs":125,"name":"Enterprise plan","total":"$19,844","perRun":"$158.75"},"126":{"runs":126,"name":"Enterprise plan","total":"$20,023","perRun":"$158.91"},"127":{"runs":127,"name":"Enterprise plan","total":"$20,202","perRun":"$159.07"},"128":{"runs":128,"name":"Enterprise plan","total":"$20,381","perRun":"$159.23"},"129":{"runs":129,"name":"Enterprise plan","total":"$20,560","perRun":"$159.38"},"130":{"runs":130,"name":"Enterprise plan","total":"$20,739","perRun":"$159.53"},"131":{"runs":131,"name":"Enterprise plan","total":"$20,918","perRun":"$159.68"},"132":{"runs":132,"name":"Enterprise plan","total":"$21,097","perRun":"$159.83"},"133":{"runs":133,"name":"Enterprise plan","total":"$21,276","perRun":"$159.97"},"134":{"runs":134,"name":"Enterprise plan","total":"$21,455","perRun":"$160.11"},"135":{"runs":135,"name":"Enterprise plan","total":"$21,634","perRun":"$160.25"},"136":{"runs":136,"name":"Enterprise plan","total":"$21,813","perRun":"$160.39"},"137":{"runs":137,"name":"Enterprise plan","total":"$21,992","perRun":"$160.53"},"138":{"runs":138,"name":"Enterprise plan","total":"$22,171","perRun":"$160.66"},"139":{"runs":139,"name":"Enterprise plan","total":"$22,350","perRun":"$160.79"},"140":{"runs":140,"name":"Enterprise plan","total":"$22,529","perRun":"$160.92"},"141":{"runs":141,"name":"Enterprise plan","total":"$22,708","perRun":"$161.05"},"142":{"runs":142,"name":"Enterprise plan","total":"$22,887","perRun":"$161.18"},"143":{"runs":143,"name":"Enterprise plan","total":"$23,066","perRun":"$161.30"},"144":{"runs":144,"name":"Enterprise plan","total":"$23,245","perRun":"$161.42"},"145":{"runs":145,"name":"Enterprise plan","total":"$23,424","perRun":"$161.54"},"146":{"runs":146,"name":"Enterprise plan","total":"$23,603","perRun":"$161.66"},"147":{"runs":147,"name":"Enterprise plan","total":"$23,782","perRun":"$161.78"},"148":{"runs":148,"name":"Enterprise plan","total":"$23,961","perRun":"$161.90"},"149":{"runs":149,"name":"Enterprise plan","total":"$24,140","perRun":"$162.01"},"150":{"runs":150,"name":"Enterprise plan","total":"$24,319","perRun":"$162.13"},"151":{"runs":151,"name":"Enterprise plan","total":"$24,498","perRun":"$162.24"},"152":{"runs":152,"name":"Enterprise plan","total":"$24,677","perRun":"$162.35"},"153":{"runs":153,"name":"Enterprise plan","total":"$24,856","perRun":"$162.46"},"154":{"runs":154,"name":"Enterprise plan","total":"$25,035","perRun":"$162.56"},"155":{"runs":155,"name":"Enterprise plan","total":"$25,214","perRun":"$162.67"},"156":{"runs":156,"name":"Enterprise plan","total":"$25,393","perRun":"$162.78"},"157":{"runs":157,"name":"Enterprise plan","total":"$25,572","perRun":"$162.88"},"158":{"runs":158,"name":"Enterprise plan","total":"$25,751","perRun":"$162.98"},"159":{"runs":159,"name":"Enterprise plan","total":"$25,930","perRun":"$163.08"},"160":{"runs":160,"name":"Enterprise plan","total":"$26,109","perRun":"$163.18"},"161":{"runs":161,"name":"Enterprise plan","total":"$26,288","perRun":"$163.28"},"162":{"runs":162,"name":"Enterprise plan","total":"$26,467","perRun":"$163.38"},"163":{"runs":163,"name":"Enterprise plan","total":"$26,646","perRun":"$163.47"},"164":{"runs":164,"name":"Enterprise plan","total":"$26,825","perRun":"$163.57"},"165":{"runs":165,"name":"Enterprise plan","total":"$27,004","perRun":"$163.66"},"166":{"runs":166,"name":"Enterprise plan","total":"$27,183","perRun":"$163.75"},"167":{"runs":167,"name":"Enterprise plan","total":"$27,362","perRun":"$163.84"},"168":{"runs":168,"name":"Enterprise plan","total":"$27,541","perRun":"$163.93"},"169":{"runs":169,"name":"Enterprise plan","total":"$27,720","perRun":"$164.02"},"170":{"runs":170,"name":"Enterprise plan","total":"$27,899","perRun":"$164.11"},"171":{"runs":171,"name":"Enterprise plan","total":"$28,078","perRun":"$164.20"},"172":{"runs":172,"name":"Enterprise plan","total":"$28,257","perRun":"$164.28"},"173":{"runs":173,"name":"Enterprise plan","total":"$28,436","perRun":"$164.37"},"174":{"runs":174,"name":"Enterprise plan","total":"$28,615","perRun":"$164.45"},"175":{"runs":175,"name":"Enterprise plan","total":"$28,794","perRun":"$164.54"},"176":{"runs":176,"name":"Enterprise plan","total":"$28,973","perRun":"$164.62"},"177":{"runs":177,"name":"Enterprise plan","total":"$29,152","perRun":"$164.70"},"178":{"runs":178,"name":"Enterprise plan","total":"$29,331","perRun":"$164.78"},"179":{"runs":179,"name":"Enterprise plan","total":"$29,510","perRun":"$164.86"},"180":{"runs":180,"name":"Enterprise plan","total":"$29,689","perRun":"$164.94"},"181":{"runs":181,"name":"Enterprise plan","total":"$29,868","perRun":"$165.02"},"182":{"runs":182,"name":"Enterprise plan","total":"$30,047","perRun":"$165.09"},"183":{"runs":183,"name":"Enterprise plan","total":"$30,226","perRun":"$165.17"},"184":{"runs":184,"name":"Enterprise plan","total":"$30,405","perRun":"$165.24"},"185":{"runs":185,"name":"Enterprise plan","total":"$30,584","perRun":"$165.32"},"186":{"runs":186,"name":"Enterprise plan","total":"$30,763","perRun":"$165.39"},"187":{"runs":187,"name":"Enterprise plan","total":"$30,942","perRun":"$165.47"},"188":{"runs":188,"name":"Enterprise plan","total":"$31,121","perRun":"$165.54"},"189":{"runs":189,"name":"Enterprise plan","total":"$31,300","perRun":"$165.61"},"190":{"runs":190,"name":"Enterprise plan","total":"$31,479","perRun":"$165.68"},"191":{"runs":191,"name":"Enterprise plan","total":"$31,658","perRun":"$165.75"},"192":{"runs":192,"name":"Enterprise plan","total":"$31,837","perRun":"$165.82"},"193":{"runs":193,"name":"Enterprise plan","total":"$32,016","perRun":"$165.89"},"194":{"runs":194,"name":"Enterprise plan","total":"$32,195","perRun":"$165.95"},"195":{"runs":195,"name":"Enterprise plan","total":"$32,374","perRun":"$166.02"},"196":{"runs":196,"name":"Enterprise plan","total":"$32,553","perRun":"$166.09"},"197":{"runs":197,"name":"Enterprise plan","total":"$32,732","perRun":"$166.15"},"198":{"runs":198,"name":"Enterprise plan","total":"$32,911","perRun":"$166.22"},"199":{"runs":199,"name":"Enterprise plan","total":"$33,090","perRun":"$166.28"},"200":{"runs":200,"name":"Enterprise plan","total":"$33,269","perRun":"$166.35"}};
// Small enhancements. Every page works without this file; it only saves steps.
(() => {
  'use strict';
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const MARKS = { tick: 'M4.5 10.5l3.5 3.5 7.5-8', bar: 'M4 10h12', diamond: 'M10 3.5l6.5 6.5-6.5 6.5L3.5 10z' };
  function state(kind, tone, word) {
    const wrap = el('span', `state state-${tone}`);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', `mark mark-${tone}`); svg.setAttribute('viewBox', '0 0 20 20');
    svg.setAttribute('width', '20'); svg.setAttribute('height', '20'); svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', MARKS[kind]); svg.append(path);
    wrap.append(svg, el('span', '', word));
    return wrap;
  }

  // Cost calculator
  for (const calc of document.querySelectorAll('[data-calc]')) {
    const input = calc.querySelector('[data-calc-input]');
    let timer;
    input.addEventListener('input', () => {
      calc.querySelector('[data-calc-runs]').textContent = input.value;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          const cost = publicCosts[Number(input.value)];
          if (String(cost.runs) !== input.value) return;
          calc.querySelector('[data-calc-name]').textContent = cost.name;
          calc.querySelector('[data-calc-total]').textContent = cost.total;
          calc.querySelector('[data-calc-per]').textContent = cost.perRun;
        } catch { /* keep the last figures */ }
      }, 80);
    });
  }

  // Monthly or annual plan prices
  for (const root of document.querySelectorAll('[data-billing-root]')) {
    for (const button of root.querySelectorAll('[data-billing-set]')) {
      button.addEventListener('click', () => {
        const period = button.dataset.billingSet;
        for (const other of root.querySelectorAll('[data-billing-set]')) other.setAttribute('aria-pressed', String(other === button));
        for (const price of root.querySelectorAll('[data-billing]')) price.hidden = price.dataset.billing !== period;
        for (const field of root.querySelectorAll('[data-billing-field]')) field.value = period;
      });
    }
  }

  // Public assignment check
  for (const form of document.querySelectorAll('[data-checker]')) {
    const out = form.querySelector('[data-check-result]');
    let checkVersion = 0;
    form.addEventListener('input', () => { checkVersion++; out.replaceChildren(el('p', 'help', 'Assignment changed. Check again for current results.')); });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const version = ++checkVersion;
      const data = new FormData(form);
      const body = {
        assignment_text: data.get('assignment_text'), county: data.get('county'), total_acres: data.get('total_acres'),
        tract_label: data.getAll('tract_label[]'), tract_acres: data.getAll('tract_acres[]'), tract_abstracts: data.getAll('tract_abstracts[]'),
      };
      out.replaceChildren(el('p', 'help', 'Checking…'));
      try {
        const response = await fetch('/api/check', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
        const result = await response.json();
        if (version !== checkVersion) return;
        if (!response.ok) { out.replaceChildren(el('p', 'error', result.error || 'The check could not be run. Try again.')); return; }
        const parts = [];
        if (result.ok) {
          const heading = el('h3'); heading.append(state('tick', 'pass', 'This assignment passes the check'));
          const acres = result.totalGrossAcres ? `${result.totalGrossAcres} gross acres in ` : '';
          parts.push(heading, el('p', '', `${acres}${result.tracts.length} ${result.tracts.length === 1 ? 'tract' : 'tracts'}, ${result.county} County. With documents uploaded and every page read, this run could start.`));
        } else {
          const heading = el('h3'); heading.append(state('bar', 'ember', `${result.errors.length === 1 ? 'One thing needs' : `${result.errors.length} things need`} attention`));
          const list = el('ul', 'issues');
          for (const issue of result.errors) { const item = el('li'); item.append(state('bar', 'ember', issue.where), el('p', '', issue.message)); list.append(item); }
          parts.push(heading, list, el('p', 'help', 'A run like this would be stopped here, before any charge.'));
        }
        if (result.warnings.length) {
          const list = el('ul', 'issues');
          for (const issue of result.warnings) { const item = el('li'); item.append(state('diamond', 'ember', issue.where), el('p', '', issue.message)); list.append(item); }
          parts.push(el('p', 'help', 'Worth knowing (these do not stop a run):'), list);
        }
        out.replaceChildren(...parts);
      } catch { if (version === checkVersion) out.replaceChildren(el('p', 'error', 'The check could not be reached. Try again.')); }
    });
  }

  // Add another tract row on the setup page
  for (const form of document.querySelectorAll('[data-tract-form]')) {
    const list = form.querySelector('[data-tract-list]'), add = form.querySelector('[data-tract-add]');
    if (!list || !add) continue;
    add.hidden = false;
    add.addEventListener('click', () => {
      const rows = list.querySelectorAll('[data-tract]');
      const copy = rows[rows.length - 1].cloneNode(true), n = rows.length;
      for (const field of copy.querySelectorAll('input, select')) {
        if (field.type !== 'hidden') field.value = '';
        if (field.id) { const id = field.id.replace(/\d+$/, String(n)); copy.querySelector(`label[for="${field.id}"]`)?.setAttribute('for', id); field.id = id; }
      }
      list.append(copy);
      copy.querySelector('input')?.focus();
    });
  }

  // Run page: reload when the run moves on. No countdowns, no predicted finish.
  const live = document.querySelector('[data-run-poll]');
  if (live) {
    setInterval(async () => {
      try {
        const now = await (await fetch(live.dataset.runPoll, { headers: { accept: 'application/json' } })).json();
        if (now.state && now.state !== live.dataset.runState) location.reload();
      } catch { /* try again on the next pass */ }
    }, 4000);
  }
})();

// The public check takes any number of tracts: "+ Add a tract" copies the last row, empty, with its own labels.
document.querySelectorAll('[data-add-tract]').forEach(button => button.addEventListener('click', () => {
  const rows = button.closest('fieldset').querySelectorAll('.tract-row');
  const last = rows[rows.length - 1], n = rows.length + 1;
  const copy = last.cloneNode(true);
  copy.querySelectorAll('input').forEach(input => { input.id = input.id.replace(/\d+$/, String(n)); input.value = input.name === 'tract_label[]' ? `Tract ${n}` : ''; });
  copy.querySelectorAll('label').forEach(label => { label.htmlFor = label.htmlFor.replace(/\d+$/, String(n)); });
  last.after(copy);
  copy.querySelector('input[name="tract_acres[]"]')?.focus();
  if (n >= 20) button.hidden = true;
}));
