import { SearchChat } from './search.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  block.innerHTML = '';

  const searchChat = new SearchChat();
  searchChat.appendNewSearchElement(block);

  const profileView = document.createElement('div');
  profileView.classList.add('profile-view');
  profileView.classList.add('profile-view-closed');
  block.appendChild(profileView);
}
