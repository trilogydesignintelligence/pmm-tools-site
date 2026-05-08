/* ============================================================
   PMM Tools — extensions.js
   Behavior for new sections only.

   - Stakeholders orbital diagram: hover/click/keyboard swaps
     the detail panel to the matching role.
   - Connector lines drawn from each role node to the core.
   - Reveal-on-scroll fallback for new .reveal elements (idempotent
     with main.js — only adds is-visible if it isn't already there).
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 1. Stakeholders orbital diagram ---------- */

  const orbit = document.querySelector('.stakeholders .orbit');
  const detail = document.querySelector('.stakeholders .stake-detail');

  if (orbit && detail) {
    const nodes = Array.from(orbit.querySelectorAll('.orbit-node'));
    const core  = orbit.querySelector('.orbit-core');
    const linesGroup = orbit.querySelector('.orbit-lines');
    const panels = Array.from(detail.querySelectorAll('.stake-panel'));

    // Draw faint connector lines from each role to center (SVG coords 600x600)
    if (linesGroup) {
      const cx = 300, cy = 300;
      // radius matches CSS --orbit-radius (~41% × 5.6 = ~230px ≈ 38% of 600 viewBox edge)
      // Using ~205 to land between the two guide rings
      const R = 205;
      nodes.forEach((node) => {
        const angleStr = (node.style.getPropertyValue('--angle') || '0deg').trim();
        const deg = parseFloat(angleStr);
        const rad = (deg * Math.PI) / 180;
        const x2 = cx + Math.cos(rad) * R;
        const y2 = cy + Math.sin(rad) * R;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', cx);
        line.setAttribute('y1', cy);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('class', 'orbit-line');
        line.setAttribute('stroke', 'currentColor');
        line.setAttribute('stroke-width', '0.6');
        line.setAttribute('stroke-dasharray', '2 5');
        line.setAttribute('opacity', '0.28');
        line.style.color = 'var(--pmm-gold, #b8893a)';
        line.dataset.roleLine = node.dataset.role;
        linesGroup.appendChild(line);
      });
    }

    function setActive(role) {
      if (!role) {
        nodes.forEach(n => n.classList.remove('is-active'));
        panels.forEach(p => p.classList.remove('is-active'));
        orbit.classList.remove('has-active');
        detail.classList.remove('has-active');
        if (linesGroup) {
          linesGroup.querySelectorAll('line').forEach(l => {
            l.setAttribute('opacity', '0.28');
            l.setAttribute('stroke-width', '0.6');
          });
        }
        return;
      }
      nodes.forEach(n => n.classList.toggle('is-active', n.dataset.role === role));
      panels.forEach(p => p.classList.toggle('is-active', p.dataset.rolePanel === role));
      orbit.classList.add('has-active');
      detail.classList.add('has-active');
      if (linesGroup) {
        linesGroup.querySelectorAll('line').forEach(l => {
          const isMatch = l.dataset.roleLine === role;
          l.setAttribute('opacity', isMatch ? '0.85' : '0.12');
          l.setAttribute('stroke-width', isMatch ? '1.2' : '0.6');
        });
      }
    }

    // Hover (desktop): preview only — doesn't lock unless clicked.
    let lockedRole = null;

    nodes.forEach((node) => {
      const role = node.dataset.role;

      node.addEventListener('mouseenter', () => {
        if (!lockedRole) setActive(role);
      });
      node.addEventListener('mouseleave', () => {
        if (!lockedRole) setActive(null);
      });
      node.addEventListener('focus', () => {
        if (!lockedRole) setActive(role);
      });
      node.addEventListener('click', (e) => {
        e.preventDefault();
        if (lockedRole === role) {
          lockedRole = null;
          setActive(null);
        } else {
          lockedRole = role;
          setActive(role);
        }
      });
      node.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          node.click();
        } else if (e.key === 'Escape') {
          lockedRole = null;
          setActive(null);
          node.blur();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const i = nodes.indexOf(node);
          nodes[(i + 1) % nodes.length].focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const i = nodes.indexOf(node);
          nodes[(i - 1 + nodes.length) % nodes.length].focus();
        }
      });
    });

    if (core) {
      core.addEventListener('click', () => {
        lockedRole = null;
        setActive(null);
      });
    }

    // Click outside the orbit clears the lock
    document.addEventListener('click', (e) => {
      if (!lockedRole) return;
      if (orbit.contains(e.target) || detail.contains(e.target)) return;
      lockedRole = null;
      setActive(null);
    });
  }

  /* ---------- 2. Reveal-on-scroll (idempotent fallback) ---------- */

  const reveals = document.querySelectorAll('.reveal:not(.is-visible)');
  if (reveals.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    reveals.forEach(el => io.observe(el));
  } else {
    // No IO support — show everything
    reveals.forEach(el => el.classList.add('is-visible'));
  }
})();
