interface Accordion {
  $el: HTMLDetailsElement;
  $summary: HTMLElement;
  $content: HTMLDivElement;
  fxDurationMs: number;
  isOpen: boolean;
  currentAnimation?: Animation;
}

const sel = {
  summary: "summary",
  content: ".details__content",
};

export const setupAccordion = (selector: string, fxDurationMs: number) => {
  document.querySelectorAll(selector).forEach((el) => {
    const $el = el as HTMLDetailsElement;
    const $summary = el.querySelector(sel.summary) as HTMLElement;
    const $content = el.querySelector(sel.content) as HTMLDivElement;

    if (!$summary) {
      throw new Error(
        `Accordion with selector "${selector}" lacks summary element ("${sel.summary}")`
      );
    }
    if (!$content) {
      throw new Error(
        `Accordion with selector "${selector}" lacks content element ("${sel.content}")`
      );
    }

    const acc: Accordion = {
      $el,
      $summary,
      $content,
      fxDurationMs,
      isOpen: false,
    };

    $summary.addEventListener("click", (ev) => handleClick(ev, acc));
  });
};

const handleClick = (ev: MouseEvent, acc: Accordion) => {
  ev.preventDefault();
  acc.isOpen = !acc.isOpen;

  if (acc.currentAnimation) acc.currentAnimation.cancel();
  acc.currentAnimation = acc.isOpen ? open(acc) : close(acc);
  acc.currentAnimation.onfinish = () => handleAnimationEnd(acc);
  acc.currentAnimation.oncancel = () => (acc.currentAnimation = undefined);

  if (acc.isOpen) acc.$el.open = true;
};

const handleAnimationEnd = (acc: Accordion) => {
  acc.$el.open = acc.isOpen;
};

const open = (acc: Accordion) => {
  const hStart = acc.$el.offsetHeight + "px";
  const hEnd = acc.$summary.offsetHeight + acc.$content.offsetHeight + 1 + "px"; // add border-bottom

  console.log("open", hStart, hEnd);

  return acc.$el.animate(
    { height: [hStart, hEnd] },
    {
      duration: acc.fxDurationMs,
      easing: "ease-out",
    }
  );
};

const close = (acc: Accordion) => {
  const hStart = acc.$el.offsetHeight + "px";
  const hEnd = acc.$summary.offsetHeight + 1 + "px"; // add border-bottom

  console.log("close", hStart, hEnd);

  return acc.$el.animate(
    { height: [hStart, hEnd] },
    {
      duration: acc.fxDurationMs,
      easing: "ease-out",
    }
  );
};
