/* Syscake — small progressive enhancements. The site works without JS. */
(() => {
  const root = document.documentElement;

  // Header: large logo at the top, compact bar once the page scrolls.
  let ticking = false;
  const onScroll = () => { root.classList.toggle('scrolled', scrollY > 24); ticking = false; };
  onScroll();
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  // Close the mobile menu after picking an in-page link.
  document.querySelectorAll('details.menu a').forEach(a =>
    a.addEventListener('click', () => a.closest('details').removeAttribute('open')));

  // Contact form: submit with fetch and show the result in place.
  const form = document.querySelector('form[data-contact]');
  if (form) {
    const status = form.querySelector('.form-status');
    const q = new URLSearchParams(location.search);
    if (q.has('sent')) { status.className = 'form-status ok'; status.textContent = form.dataset.ok; }
    if (q.has('error')) { status.className = 'form-status err'; status.textContent = form.dataset.err; }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Static hosting: compose an email in the visitor's mail client.
      if (form.dataset.mailto) {
        const d = new FormData(form);
        const lines = ['name', 'company', 'email', 'phone'].map(k => `${k}: ${d.get(k) || '-'}`);
        const subject = `[syscake.it] ${d.get('name')}${d.get('company') ? ' — ' + d.get('company') : ''}`;
        const body = lines.join('\n') + '\n\n' + (d.get('message') || '');
        location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        return;
      }
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      status.className = 'form-status';
      status.textContent = form.dataset.sending;
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.error || res.status);
        form.reset();
        status.classList.add('ok');
        status.textContent = form.dataset.ok;
        if (window.turnstile) window.turnstile.reset();
      } catch (err) {
        status.classList.add('err');
        status.textContent = form.dataset.err;
      } finally {
        btn.disabled = false;
      }
    });
  }
})();
