export default function decorate(block) {
  const button = document.createElement('button');
  button.classList.add('secondary');
  button.innerHTML = block.children[0].innerHTML;

  const dialog = document.createElement('dialog');
  dialog.innerHTML = block.children[1].innerHTML;

  const close = document.createElement('button');
  close.classList.add('secondary');
  close.textContent = 'x';
  dialog.prepend(close);

  button.addEventListener('click', () => {
    dialog.showModal();
  });

  close.addEventListener('click', () => {
    dialog.close();
  });

  block.innerHTML = '';
  block.append(button);
  block.append(dialog);
}
