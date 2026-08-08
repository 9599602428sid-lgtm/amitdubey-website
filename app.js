document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const form = document.querySelector('#consultation-form');
  if (!form) return;
  const date = form.querySelector('#consultation-date');
  const time = form.querySelector('#consultation-time');
  const confirmation = document.querySelector('#booking-confirmation');
  const today = new Date();
  today.setDate(today.getDate() + 1);
  date.min = today.toISOString().split('T')[0];

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.checkValidity()) return form.reportValidity();
    const data = Object.fromEntries(new FormData(form).entries());
    const booking = { ...data, createdAt: new Date().toISOString() };
    const bookings = JSON.parse(localStorage.getItem('amit-dubey-consultations') || '[]');
    bookings.push(booking);
    localStorage.setItem('amit-dubey-consultations', JSON.stringify(bookings));

    const formattedDate = new Date(`${data.date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const subject = encodeURIComponent(`Consultation request — ${data.name}`);
    const body = encodeURIComponent(`Hello Amit,\n\nI would like to request a ${data.service} consultation.\n\nPreferred time: ${formattedDate}, ${data.time} (IST)\nOrganisation: ${data.organisation || 'Not provided'}\nEmail: ${data.email}\nPhone: ${data.phone || 'Not provided'}\n\nBrief: ${data.message}\n\nKind regards,\n${data.name}`);
    confirmation.innerHTML = `<strong>Your consultation request is saved.</strong><p>Preferred slot: ${formattedDate} at ${data.time} IST. Open the prepared email to send the request and confirm availability.</p><a class="button button-primary" href="mailto:?subject=${subject}&body=${body}">Open prepared email</a>`;
    confirmation.hidden = false;
    confirmation.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    form.reset();
  });
});
