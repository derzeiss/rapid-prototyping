window._setupLogoIntersectionObserver = (() => {
  const cls = {
    logoHidden: 'logo_hidden',
  };

  const sel = {
    pageTop: '.page-top',
    logoHideable: '.logo__hideable',
  };

  function setupLogoIntersectionObserver() {
    const $pageTop = document.querySelector(sel.pageTop);
    setupIntersectionObserver($pageTop, handleIntersection);
  }

  function handleIntersection(entries) {
    if (!entries || !entries.length) return;
    document
      .querySelector(sel.logoHideable)
      .classList.toggle(cls.logoHidden, !entries[0].isIntersecting);
  }

  function setupIntersectionObserver($el, onIntersection, observerInit) {
    if (
      !'IntersectionObserver' in window ||
      !'IntersectionObserverEntry' in window ||
      !'intersectionRatio' in window.IntersectionObserverEntry.prototype
    ) {
      return;
    }

    // setup observer
    const observer = new IntersectionObserver(onIntersection, observerInit);
    observer.observe($el);
  }

  return setupLogoIntersectionObserver;
})();
