// The land illustration is a visual explanation, never a live survey or run.
(() => {
  'use strict';
  const scene = document.querySelector('[data-survey]');
  if (!scene) return;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = scene.querySelector('[data-scan-toggle]');
  const label = scene.querySelector('[data-scan-label]');
  const description = scene.querySelector('[data-survey-description]');
  const pins = [...scene.querySelectorAll('.land-pin')];
  const viewport = scene.querySelector('.survey-viewport');
  const calloutOverlay = scene.querySelector('.survey-callouts');
  const callouts = [...scene.querySelectorAll('[data-survey-callout]')];
  // Fixed feature coordinates in the same 900 x 600 space as the land image.
  const calloutAnchors = {
    land: [[300,294], [744,360]],
    minerals: [[396,466], [703,404]],
    record: [[445,401], [744,360]],
  };
  const layers = {
    land: ['Start with the tract, its legal description, and its gross acres.', 'THE ASSIGNMENT', 'Define the land.', 'THE OWNERSHIP', 'Follow what was conveyed.'],
    minerals: ['Mineral rights can be divided and reserved separately from the surface.', 'THE MINERAL ESTATE', 'Surface ≠ mineral ownership.', 'THE INTEREST', 'Trace each reservation.'],
    record: ['The instruments establish the chain. Every conclusion needs its source.', 'THE SOURCE', 'Deeds. Probate. Reservations.', 'THE DELIVERABLE', 'Ownership, with the evidence.'],
  };
  const svgNS = 'http://www.w3.org/2000/svg';
  const instrument = scene.querySelector('[data-iris-instrument]');
  const mesh = scene.querySelector('[data-iris-mesh]');
  const optic = scene.querySelector('[data-iris-optic]');
  const ignition = scene.querySelector('[data-iris-ignition]');
  const materialization = scene.querySelector('[data-iris-materialization]');
  const wake = scene.querySelector('[data-iris-wake]');
  const fan = scene.querySelector('[data-laser-fan]');
  const volume = scene.querySelector('[data-laser-volume]');
  const inner = scene.querySelector('[data-laser-inner]');
  const envelope = scene.querySelector('[data-laser-envelope]');
  const rays = [...scene.querySelectorAll('[data-laser-rays] path')];
  const activeRay = scene.querySelector('[data-laser-active-ray]');
  const ground = ['[data-laser-ground-light]', '[data-laser-ground-halo]', '[data-laser-ground]', '[data-laser-ground-core]'].map(selector => scene.querySelector(selector));
  const contact = scene.querySelector('[data-laser-contact]');
  const mix = (from, to, fraction) => from + (to - from) * fraction;
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const point = (x, y) => `${x.toFixed(2)} ${y.toFixed(2)}`;
  const length = vector => Math.hypot(...vector) || 1;
  const unit = vector => vector.map(n => n / length(vector));
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a.reduce((sum, n, i) => sum + n * b[i], 0);
  const light = unit([-0.6, 1, 0.8]);
  const view = unit([-0.16, .5, 1]);
  const highlight = unit(light.map((n, i) => n + view[i]));
  const tau = Math.PI * 2;
  const CYCLE = 11800;
  const SCAN_START = 1550, SCAN_END = 9100;
  const SCANNER_ALTITUDE = 265;
  let manuallyPaused = false, onScreen = true;
  let frame = 0, previousTime = 0, previousPaint = 0, elapsed = 0;

  // An articulated hologram: three projected plates unfold around one lens.
  // It is projected and depth sorted, not a flat icon scaled to imply folding.
  const faces = [];
  const addFace = (points, material = 'titanium', part = -1, edge = false) => {
    const node = document.createElementNS(svgNS, 'path');
    node.setAttribute('stroke-width', edge ? '.85' : '.32');
    mesh.append(node);
    faces.push({ points, material, part, edge, node, depth: 0 });
  };
  const ring = (radius, y, angle) => [Math.cos(angle) * radius, y, Math.sin(angle) * radius];
  const joinRings = (outer, innerRing, material) => {
    for (let i = 0; i < 24; i++) {
      const a = tau * i / 24, b = tau * (i + 1) / 24;
      addFace([ring(...outer, a), ring(...outer, b), ring(...innerRing, b), ring(...innerRing, a)], material);
    }
  };
  joinRings([10, 18], [15, 8], 'graphite');
  joinRings([15, 8], [18, 4], 'titanium');
  joinRings([18, 4], [17, 0], 'titanium');
  joinRings([17, 0], [10, 0], 'copper');

  // Coordinates are radial distance, tangential distance, and plate relief.
  const blade = [[0,-5,0],[6,-11,2],[17,-14,4],[27,-10,5],[31,-2,5],[24,5,4],[12,9,2],[0,5,0]];
  const crown = [[2,-3.5,1.6],[7.5,-8.5,3.6],[17,-11,5.6],[25,-8,6.6],[27.5,-2,6.6],[23,2.5,5.6],[12,6,3.6],[2,3.5,1.6]];
  for (let part = 0; part < 3; part++) {
    addFace(blade.map(([u,v,h]) => [u,v,h-2]), 'graphite', part);
    for (let i = 0; i < blade.length; i++) {
      const j = (i + 1) % blade.length;
      addFace([blade[i], blade[j], [blade[j][0],blade[j][1],blade[j][2]-2], [blade[i][0],blade[i][1],blade[i][2]-2]], 'titanium', part);
      addFace([blade[i], blade[j], crown[j], crown[i]], 'edge', part);
    }
    addFace(crown, 'titanium', part);
    addFace([[8,-5,3.9],[17,-8,5.9],[23,-5.5,6.9],[23,-2,6.9],[15,1,5.1],[8,2,3.9]], 'graphite', part);
    addFace([[9,-7,4],[17,-9.5,6],[23,-6.7,7]], 'light', part, true);
    // The projected hinge keeps the opening plates connected to the core.
    addFace([[-1,-5,0],[3,-5,.5],[3,5,.5],[-1,5,0]], 'copper', part);
  }
  const rotate = ([x,y,z], angle) => [x * Math.cos(angle) - z * Math.sin(angle), y, x * Math.sin(angle) + z * Math.cos(angle)];
  const project = ([x,y,z]) => [x * .96 + z * .28, x * .08 + z * .47 - y * .9];
  const hologramSurface = (material, normal) => {
    if (material === 'light') return '#c3ffec';
    const diffuse = Math.abs(dot(normal, light));
    const specular = Math.pow(Math.abs(dot(normal, highlight)), material === 'copper' ? 18 : 28);
    const base = material === 'graphite' ? [31,112,111] : material === 'copper' ? [111,241,203] : material === 'edge' ? [158,255,227] : [77,216,196];
    const shade = .42 + diffuse * .66;
    return `rgb(${base.map((n, i) => Math.min(255, Math.round(n * shade + specular * (material === 'graphite' ? 30 : [135,128,108][i])))).join(' ')})`;
  };
  function drawInstrument(source, deploy, visibility, power, time) {
    const yaw = .28 + Math.sin(time / 3800) * .09;
    const emerge = .7 + visibility * .3;
    instrument.setAttribute('transform', `translate(${point(source[0], source[1] - 1.5)}) scale(${emerge.toFixed(4)})`);
    instrument.setAttribute('opacity', visibility.toFixed(4));
    instrument.dataset.deployed = deploy.toFixed(3);
    ignition.setAttribute('opacity', power.toFixed(4));
    optic.setAttribute('opacity', (.3 + .7 * deploy).toFixed(3));
    wake.setAttribute('opacity', (power * .4 + (1 - visibility) * .8).toFixed(3));
    materialization.setAttribute('opacity', ((1 - visibility) * .7).toFixed(3));
    for (const face of faces) {
      let vertices = face.points;
      if (face.part >= 0) {
        // Slightly stagger the three hinges; each really rotates out of the capsule.
        const extension = smooth((deploy - face.part * .055) / .89);
        const hinge = mix(1.42, .09, extension);
        const angle = face.part * tau / 3 + .35;
        vertices = vertices.map(([u,v,h]) => {
          const radial = 9 + u * Math.cos(hinge) - h * Math.sin(hinge);
          const y = 11 + u * Math.sin(hinge) + h * Math.cos(hinge);
          return rotate([radial, y, v], angle);
        });
      }
      vertices = vertices.map(v => rotate(v, yaw));
      const normal = unit(cross(vertices[1].map((n,i)=>n-vertices[0][i]), vertices[2].map((n,i)=>n-vertices[0][i])));
      const projected = vertices.map(project);
      face.node.setAttribute('d', `M${projected.map(p=>point(...p)).join(' ')}Z`);
      face.node.setAttribute('fill', hologramSurface(face.material, normal));
      face.node.setAttribute('fill-opacity', face.material === 'light' ? '.65' : face.material === 'graphite' ? '.025' : face.material === 'edge' ? '.09' : '.045');
      face.node.setAttribute('stroke', face.material === 'light' ? '#d6fff1' : face.material === 'graphite' ? '#55d6c3' : '#9cffe3');
      face.node.setAttribute('stroke-opacity', face.material === 'light' ? '.95' : String(.22 + .36 * Math.abs(dot(normal, view))));
      face.depth = vertices.reduce((sum,v) => sum + dot(v, view), 0) / vertices.length;
    }
    // Reordering the existing paths avoids allocating an animated DOM tree.
    for (const face of [...faces].sort((a,b) => a.depth - b.depth)) mesh.append(face.node);
  }

  // Scene-space rises stay attached to the land as the footprint passes them.
  const terrainRises = [[280,330,34,22,4.2], [378,348,24,15,3.4], [637,314,30,20,4.8], [750,296,23,16,3.6]];
  function terrainHeight(x, y) {
    const lowRelief = 1.25 * Math.sin(x * .027 + y * .041);
    const fineRelief = .85 * Math.sin(x * .093 + y * .067) + .4 * Math.sin(x * .21 - y * .12);
    return lowRelief + fineRelief + terrainRises.reduce((height, [cx,cy,rx,ry,rise]) => height + rise * Math.exp(-(((x-cx)/rx)**2 + ((y-cy)/ry)**2)), 0);
  }

  function drawLaser(position, source, power, time) {
    // Quarter-turn in the land plane: use the projected parcel depth axis.
    // Ground axes are foreshortened, so they are not perpendicular on screen.
    const center = [mix(160,805,position), mix(349,302.5,position)];
    const slope = .46;
    // The illustration's left cyan cutaway stands in front of the surface.
    const left = Math.max(center[0] - 120, 224);
    const frontEdge = (503 - center[1] + slope * center[0]) / (slope + .195) - 8;
    const right = Math.min(center[0] + 120, 884, frontEdge);
    const groundAt = fraction => {
      const x = mix(left, right, fraction);
      const y = center[1] + slope * (x - center[0]);
      return [x, y - terrainHeight(x, y)];
    };
    const apex = point(...source);
    const profile = Array.from({length:97}, (_,i) => point(...groundAt(i / 96))).join(' ');
    fan.setAttribute('opacity', power.toFixed(4));
    volume.setAttribute('d', `M${apex} ${profile}Z`);
    inner.setAttribute('d', `M${apex} ${point(...groundAt(.22))} ${point(...groundAt(.78))}Z`);
    envelope.setAttribute('d', `M${point(...groundAt(0))} ${apex} ${point(...groundAt(1))}`);
    for (const node of ground) node.setAttribute('d', `M${profile}`);
    rays.forEach((ray,i) => {
      ray.setAttribute('d', `M${apex} ${point(...groundAt(i / (rays.length - 1)))}`);
      ray.setAttribute('stroke-opacity', String(.035 + .095 * (1 + Math.sin(i * 1.9 - time / 1500)) / 2));
    });
    const hit = groundAt(.5 + .44 * Math.sin(time / 2300));
    activeRay.setAttribute('d', `M${apex} ${point(...hit)}`);
    contact.setAttribute('cx', hit[0].toFixed(2));
    contact.setAttribute('cy', hit[1].toFixed(2));
    contact.setAttribute('transform', `rotate(${Math.atan(slope)*180/Math.PI} ${point(...hit)})`);
  }

  function render(time, still = false) {
    const t = still ? 5200 : time % CYCLE;
    const visibility = still ? 1 : smooth(t / 480) * (1 - smooth((t - 10100) / 550));
    const deploy = still ? 1 : smooth((t - 360) / 680) * (1 - smooth((t - 9550) / 550));
    const power = still ? 1 : smooth((t - 1110) / 330) * (1 - smooth((t - 9250) / 250));
    const progress = smooth((t - SCAN_START) / (SCAN_END - SCAN_START));
    const position = mix(.035,.965,progress);
    const back = [mix(95,745,position),mix(252,279,position)];
    const front = [mix(225,865,position),mix(446,326,position)];
    const source = [(back[0]+front[0])/2, (back[1]+front[1])/2 - SCANNER_ALTITUDE];
    const phase = t < 360 ? 'appearing' : t < 1110 ? 'unfolding' : t < SCAN_START ? 'igniting' : t < SCAN_END ? 'scanning' : t < 9550 ? 'finishing' : t < 10100 ? 'folding' : t < 10650 ? 'disappearing' : 'rest';
    scene.dataset.scanPhase = phase;
    scene.dataset.scanPosition = position.toFixed(4);
    drawLaser(position,source,power,t);
    drawInstrument(source,deploy,visibility,power,t);
  }
  function animate(time) {
    if (previousTime) elapsed += Math.min(time - previousTime, 64);
    previousTime = time;
    if (time - previousPaint >= 32) { render(elapsed); previousPaint = time; }
    frame = requestAnimationFrame(animate);
  }
  function updateMotion() {
    const stopped = manuallyPaused || motionPreference.matches || document.hidden || !onScreen;
    scene.classList.toggle('scan-paused', stopped);
    toggle.setAttribute('aria-pressed', String(manuallyPaused || motionPreference.matches));
    label.textContent = motionPreference.matches ? 'Motion reduced' : manuallyPaused ? 'Resume scan' : 'Pause scan';
    toggle.disabled = motionPreference.matches;
    if (stopped && frame) { cancelAnimationFrame(frame); frame = 0; previousTime = 0; }
    else if (!stopped && !frame) frame = requestAnimationFrame(animate);
  }
  toggle.addEventListener('click', () => { manuallyPaused = !manuallyPaused; updateMotion(); });
  motionPreference.addEventListener('change', () => { if (motionPreference.matches) render(5200, true); else render(elapsed); updateMotion(); });
  document.addEventListener('visibilitychange', updateMotion);
  const observer = new IntersectionObserver(entries => {
    onScreen = entries[0].isIntersecting;
    scene.classList.toggle('scan-offscreen', !onScreen);
    updateMotion();
  });
  observer.observe(scene);
  function positionCallouts() {
    const bounds = viewport.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const scaleX = 900 / bounds.width, scaleY = 600 / bounds.height;
    const targets = calloutAnchors[scene.dataset.layer] || calloutAnchors.land;
    pins.forEach((pin, index) => {
      const box = pin.getBoundingClientRect();
      const x = (index === 0 ? box.right - 8 : box.left + 8) - bounds.left;
      const start = [x * scaleX, (box.bottom - bounds.top) * scaleY];
      const target = targets[index];
      const elbowY = Math.min(start[1] + 24, target[1] - 12);
      callouts[index].querySelector('[data-callout-line]').setAttribute('d', `M${point(...start)} V${elbowY.toFixed(2)} L${point(...target)}`);
      const anchor = callouts[index].querySelector('[data-callout-anchor]');
      anchor.setAttribute('cx', target[0]);
      anchor.setAttribute('cy', target[1]);
    });
    calloutOverlay.dataset.ready = '';
  }
  const calloutResize = new ResizeObserver(positionCallouts);
  calloutResize.observe(viewport);
  pins.forEach(pin => calloutResize.observe(pin));
  document.fonts.ready.then(positionCallouts);
  for (const button of scene.querySelectorAll('[data-survey-layer]')) {
    button.addEventListener('click', () => {
      const key = button.dataset.surveyLayer;
      if (!layers[key]) return;
      scene.dataset.layer = key;
      for (const other of scene.querySelectorAll('[data-survey-layer]')) other.setAttribute('aria-pressed', String(other === button));
      const [copy, firstLabel, firstText, secondLabel, secondText] = layers[key];
      description.textContent = copy;
      for (const [i, values] of [[firstLabel, firstText], [secondLabel, secondText]].entries()) {
        pins[i].querySelector('.pin-kicker').textContent = values[0];
        pins[i].querySelector('strong').textContent = values[1];
      }
      positionCallouts();
    });
  }
  render(0, motionPreference.matches);
  positionCallouts();
  updateMotion();
})();
