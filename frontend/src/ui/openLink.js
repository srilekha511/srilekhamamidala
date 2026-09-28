// Opens a gallery frame's link: web links in a new isolated tab, mailto in the mail app.
export function openLink(href, win = window) {
  if (/^https?:/i.test(href)) win.open(href, '_blank', 'noopener,noreferrer')
  else if (/^mailto:/i.test(href)) win.location.href = href
}
