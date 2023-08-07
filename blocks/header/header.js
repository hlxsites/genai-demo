import { getMetadata, decorateIcons } from '../../scripts/lib-franklin.js';
import { getConfig } from '../../scripts/scripts.js';

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  let navPath;
  // fetch nav content
  if (window.location.pathname.startsWith('/demos') || window.location.pathname.startsWith('/drafts/_template')) {
    const [,root,demo] = window.location.pathname.split('/');
    navPath = window.hlx.config.nav ? `/${root}/${demo}${window.hlx.config.nav}` : `/nav`;
  } else {
    const navMeta = getMetadata('nav');
    navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  }
  const resp = await fetch(`${navPath}.plain.html`);
  const html = await resp.text();

  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.innerHTML = html;
  nav.firstElementChild.classList.add('header-logo');

  const projectName = (window.hlx.config.projectName || '').split(' ').map((token) => `<span>${token}</span>`).join(' ');
  const name = document.createElement('div');
  name.classList.add('header-title');
  name.innerHTML = `<a href="index">${projectName}</a>`;
  nav.append(name);

  const profile = document.createElement('div');
  profile.classList.add('header-profile');
  profile.innerHTML = `
    <a href="profile"><span class="icon icon-avatar"></span></a>
    <select></select>`;
  const icon = profile.querySelector('.icon');
  const select = profile.querySelector('select');
  select.addEventListener('change', (ev) => {
    icon.style.setProperty('--color', window.hlx.config.personas[ev.target.value].color);
    window.sessionStorage.setItem('gaze-persona', ev.target.value);
  });
  const persona = window.sessionStorage.getItem('gaze-persona') || Object.keys(window.hlx.config.personas)[0];
  icon.style.setProperty('--color', window.hlx.config.personas[persona].color);
  Object.entries(window.hlx.config.personas).forEach(([k, v]) => {
    select.append(new Option(v.label, k, false, k === persona));
  })
  nav.append(profile);

  decorateIcons(nav);

  block.innerHTML = '';
  block.append(nav);
}
