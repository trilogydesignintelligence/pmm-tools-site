/* ──────────────────────────────────────────────────────
   PMM Tools — site behavior
   - interactive flow detail panel
   - tool search + filtering
   - keyboard "/" focus
   - intersection-based reveals
   ────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ─── Flow detail panel ─────────────────────────── */
  const FLOW_DATA = {
    revit: {
      name: 'Revit',
      meta: 'Stage 01 · Architecture',
      desc: "The architect's authoritative model. Geometry, IFC classes, and engineering data originate here. We never touch Revit directly — we receive it as IFC.",
      tools: []
    },
    sketchup: {
      name: 'SketchUp',
      meta: 'Stage 02 · Design Intelligence',
      desc: "Where designers actually live. We import the IFC, layer in design intelligence — fixtures, finishes, furniture, decor — and tag every component with its PMM attributes. The IFC structure is preserved; the design imagination is added on top.",
      tools: [
        { name: 'PMM Connection', href: 'guides/pmm-connection.html' },
        { name: 'PMM Converter', href: 'guides/pmm-converter.html' }
      ]
    },
    drive: {
      name: 'PMM in the Sky',
      meta: 'Stage 03 · Canonical Data',
      desc: "A Google Sheet, sized to the project. One tab per cost category, one row per component. This is the single source of truth — vendors, prices, deadlines, allowances all live here. Designers push the model; project managers edit commercial. Subs read live on their phones via PMM on the Ground.",
      tools: [
        { name: 'PMM Horizon', href: 'guides/pmm-horizon.html' },
        { name: 'PMM in the Sky', href: 'guides/pmm-in-the-sky.html' },
        { name: 'PMM on the Ground', href: 'guides/pmm-on-the-ground.html' },
        { name: 'PMM Compass', href: 'guides/pmm-compass.html' }
      ]
    },
    bt: {
      name: 'Buildertrend',
      meta: 'Stage 04 · Construction Management',
      desc: "Where the build actually runs — schedules, change orders, draw requests, client communication. Until we have direct API access, PMM Bridge formats CSVs to BT's import templates and PMM Relay automates the Sheet→BT sync. PO data flows back into the model so SketchUp always reflects what was actually ordered.",
      tools: [
        { name: 'PMM Bridge', href: 'guides/pmm-bridge.html' },
        { name: 'PMM Relay', href: 'guides/pmm-relay.html' }
      ]
    }
  };

  function setActiveStep(key) {
    document.querySelectorAll('.flow-step').forEach(el => {
      el.classList.toggle('is-active', el.dataset.step === key);
    });
    const data = FLOW_DATA[key];
    if (!data) return;
    const detail = document.querySelector('.flow-detail');
    if (!detail) return;
    detail.style.opacity = '0';
    setTimeout(() => {
      detail.querySelector('h3').textContent = data.name;
      detail.querySelector('.detail-meta').textContent = data.meta;
      detail.querySelector('p').textContent = data.desc;
      const tools = detail.querySelector('.detail-tools');
      tools.innerHTML = '';
      data.tools.forEach(t => {
        const a = document.createElement('a');
        a.className = 'tool-pill';
        a.href = t.href;
        a.textContent = t.name;
        tools.appendChild(a);
      });
      detail.style.opacity = '1';
    }, 180);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.flow-step').forEach(el => {
      el.addEventListener('click', () => setActiveStep(el.dataset.step));
      el.addEventListener('mouseenter', () => setActiveStep(el.dataset.step));
    });

    /* ─── Filter pills ───────────────────────────── */
    const pills = document.querySelectorAll('.filter-pill');
    const cards = document.querySelectorAll('.tool-card');
    const searchInput = document.querySelector('.tools-search input');

    function applyFilters() {
      const activeCat = document.querySelector('.filter-pill.is-active')?.dataset.cat || 'all';
      const q = (searchInput?.value || '').trim().toLowerCase();
      cards.forEach(card => {
        const cat = card.dataset.cat || '';
        const text = (card.textContent || '').toLowerCase();
        const catMatch = activeCat === 'all' || cat === activeCat;
        const textMatch = !q || text.includes(q);
        card.style.display = (catMatch && textMatch) ? '' : 'none';
      });
    }

    pills.forEach(p => {
      p.addEventListener('click', () => {
        pills.forEach(x => x.classList.remove('is-active'));
        p.classList.add('is-active');
        applyFilters();
      });
    });

    let searchTimer;
    searchInput?.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(applyFilters, 60);
    });

    /* "/" focuses search */
    document.addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput?.focus();
      }
    });

    /* ─── Intersection reveals ───────────────────── */
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && reveals.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
      reveals.forEach(r => io.observe(r));
    } else {
      reveals.forEach(r => r.classList.add('in'));
    }
  });
})();
