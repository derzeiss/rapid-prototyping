window._setupHamburgerMenu = (() => {
  const cls = {
    hamburgerOpen: 'hamburger_open',
    menu: 'menu',
    menuNav: 'menu__nav',
    menuOpen: 'menu_open',
  };

  const sel = {
    hamburger: '.hamburger',
    menu: '.menu',
  };

  function setupHamburgerMenu() {
    document.querySelector(sel.hamburger).addEventListener('click', (ev) => {
      ev.stopPropagation();

      const { $hamburger, $menu } = _getElements();

      $hamburger.classList.toggle(cls.hamburgerOpen);
      $menu.classList.toggle(cls.menuOpen);
    });

    document.addEventListener('click', (ev) => {
      const clsList = ev.target.classList;
      if (clsList.contains(cls.menu) || clsList.contains(cls.menuNav)) return;

      const { $hamburger, $menu } = _getElements();
      $hamburger.classList.remove(cls.hamburgerOpen);
      $menu.classList.remove(cls.menuOpen);
    });
  }

  function _getElements() {
    /** @type HTMLDivElement */
    const $hamburger = document.querySelector('.hamburger');
    /** @type HTMLDivElement */
    const $menu = $hamburger.parentElement.querySelector(sel.menu);

    return { $hamburger, $menu };
  }

  return setupHamburgerMenu;
})();
