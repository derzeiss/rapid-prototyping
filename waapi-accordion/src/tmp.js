const gtag = (type, data) => {
  console.log("gtag", type, data);
};

function sendGtagInputEvent(name, ev) {
  if (ev.target.tagName !== "INPUT") return;
  gtag("event", name, {
    event_category: "engagement",
    event_label: name,
    field_name: ev.target.name,
    field_is_filled: !!ev.target.value,
  });
}

document.addEventListener("click", (ev) =>
  sendGtagInputEvent("text_field_focus", ev)
);

document.addEventListener("blur", (ev) =>
  sendGtagInputEvent("text_field_blur", ev)
);

// <button data-gaid="sample GA Id">...</button>
document.addEventListener("click", (ev) => {
  if (ev.target.tagName !== "BUTTON") return;
  gtag("event", "button_click", {
    event_category: "engagement",
    event_label: "button_click",
    field_name: ev.target.dataset.gaid,
  });
});
