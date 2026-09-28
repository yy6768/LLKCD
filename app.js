"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const scenes = {
  "bistro1-day": { name: "Bistro", credit: "Amazon Lumberyard" },
  zeroday: { name: "Zeroday", credit: "Mike Winkelmann" },
  "dining-room": { name: "Dining Room", credit: "Wig42" },
  bedroom: { name: "Bedroom", credit: "SlykDrako" },
  kitchen: { name: "Kitchen", credit: "Jay-Artist" },
};
const methods = {
  Input: "Noisy input", "NPPD-Lite": "NPPD (Small)", NPPD: "NPPD (Teacher)",
  FAN: "FAN", OptiX: "ONND / OptiX", OIDN: "OIDN", Reference: "Reference",
};
const state = { scene: "bistro1-day", crop: "A", baseline: "Input" };

// Every pair uses images of the same original frame or the same manuscript crop.
$$('.wipe-range').forEach((range) => {
  const wipe = range.closest('.wipe');
  range.addEventListener('input', () => {
    wipe.style.setProperty('--split', `${range.value}%`);
    range.setAttribute('aria-valuetext', `${range.value} percent comparison image`);
    wipe.classList.add('touched');
  });
});

function pressGroup(selector, selected) {
  $$(selector).forEach((button) => {
    const active = button === selected;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function updateCrops() {
  const scene = scenes[state.scene];
  const prefix = `assets/comparisons/${state.scene}`;
  $('#scene-image').src = `${prefix}_cor.webp`;
  $('#scene-image').alt = `${scene.name} scene overview with the two comparison crop locations marked`;
  $('#scene-credit').textContent = `${scene.name} © ${scene.credit}`;
  $('#crop-ours').src = `${prefix}_Ours_crop${state.crop}.webp`;
  $('#crop-ours').alt = `Our reconstruction, ${scene.name} detail ${state.crop}`;
  $('#crop-before').src = `${prefix}_${state.baseline}_crop${state.crop}.webp`;
  $('#crop-before').alt = `${methods[state.baseline]}, ${scene.name} detail ${state.crop}`;
  $('#crop-before-label').textContent = methods[state.baseline];
  $('#crop-status').textContent = `${scene.name} / Detail ${state.crop}`;
}
$$('[data-scene]').forEach((button) => button.addEventListener('click', () => {
  state.scene = button.dataset.scene;
  pressGroup('[data-scene]', button);
  updateCrops();
}));
$$('[data-crop]').forEach((button) => button.addEventListener('click', () => {
  state.crop = button.dataset.crop;
  pressGroup('[data-crop]', button);
  updateCrops();
}));
$('#baseline-select').addEventListener('change', (event) => { state.baseline = event.target.value; updateCrops(); });

const figureDialog = $('#figure-dialog');
$$('[data-figure]').forEach((button) => button.addEventListener('click', () => {
  $('#figure-image').src = button.dataset.figure;
  $('#figure-image').alt = button.querySelector('img').alt;
  $('#figure-caption').textContent = button.dataset.caption;
  figureDialog.showModal();
}));
$('#close-figure').addEventListener('click', () => figureDialog.close());
figureDialog.addEventListener('click', (event) => { if (event.target === figureDialog) { const rect = figureDialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) figureDialog.close(); } });

$('#copy-citation').addEventListener('click', async () => {
  const text = $('#bibtex').textContent;
  const button = $('#copy-citation');
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else {
      const field = document.createElement('textarea');
      field.value = text;
      field.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.append(field);
      field.select();
      const copied = document.execCommand('copy');
      field.remove();
      if (!copied) throw new Error('Copy unavailable');
      button.focus();
    }
    button.textContent = 'Copied ✓';
    $('#copy-status').textContent = 'BibTeX citation copied to clipboard.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents($('#bibtex'));
    const selection = window.getSelection();
    selection.removeAllRanges(); selection.addRange(range);
    button.textContent = 'Selected · press Ctrl/Cmd+C';
    $('#copy-status').textContent = 'Automatic copy unavailable. Citation selected; press Control C or Command C to copy.';
  }
});

