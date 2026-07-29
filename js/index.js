// Azure-portal-style interactions: global flyout menu, resource-menu filter,
// Essentials collapse, JSON View, scroll-spy, search jump, refresh, year.

document.addEventListener('DOMContentLoaded', () => {
  // Footer year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Hamburger opens the global portal menu flyout
  const menuToggle = document.getElementById('menuToggle');
  const overlay = document.getElementById('globalOverlay');

  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
  };

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
  }
  if (overlay) overlay.addEventListener('click', closeMenu);
  document.querySelectorAll('.global-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Resource menu filter (the "Search (Ctrl+/)" box)
  const menuFilter = document.getElementById('menuFilter');
  if (menuFilter) {
    menuFilter.addEventListener('input', () => {
      const query = menuFilter.value.trim().toLowerCase();
      document.querySelectorAll('.resource-menu li').forEach((li) => {
        li.style.display = li.textContent.toLowerCase().includes(query) ? '' : 'none';
      });
      document.querySelectorAll('.menu-group').forEach((group) => {
        group.style.display = query ? 'none' : '';
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        menuFilter.focus();
      }
    });
  }

  // Essentials expand/collapse
  const essentialsToggle = document.getElementById('essentialsToggle');
  if (essentialsToggle) {
    essentialsToggle.addEventListener('click', () => {
      const panel = essentialsToggle.closest('.essentials');
      const collapsed = panel.classList.toggle('collapsed');
      essentialsToggle.setAttribute('aria-expanded', String(!collapsed));
    });
  }

  // JSON View — the resource as a real portal would show it
  const jsonView = document.getElementById('jsonView');
  if (jsonView) {
    jsonView.addEventListener('click', () => {
      const resource = {
        id: '/subscriptions/portfolio/resourceGroups/aviation-platform-rg/providers/Engineers/jakub-adamczyk',
        name: 'jakub-adamczyk',
        type: 'Engineers/devops-platform',
        location: 'Letterkenny, Ireland',
        properties: {
          role: 'Software Engineer (DevOps)',
          employer: 'SITA',
          status: 'Running',
          experienceYears: 4,
          education: 'M.Sc. Software Architecture & Design (part-time)',
          rightToWork: 'Full right to work in UK and EU',
          email: 'jakub.adamczyk.software@gmail.com',
          github: 'https://github.com/MoMoiin',
          linkedin: 'https://www.linkedin.com/in/jakub-software/'
        },
        tags: {
          cloud: 'azure, aws',
          containers: 'kubernetes (aks, eks), argocd',
          iac: 'terraform, ansible',
          cicd: 'azure devops, github actions',
          observability: 'prometheus, dynatrace, kubecost'
        }
      };
      const blob = new Blob([JSON.stringify(resource, null, 2)], { type: 'application/json' });
      window.open(URL.createObjectURL(blob), '_blank');
    });
  }

  // Refresh command reloads the page, like the portal's Refresh
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) refreshBtn.addEventListener('click', () => window.location.reload());

  // Scroll-spy: highlight resource menu items and blade tabs for the section in view
  const spyLinks = Array.from(document.querySelectorAll('.resource-menu a[href^="#"], .blade-tabs a[href^="#"]'));
  const sections = [...new Set(
    spyLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean)
  )];

  if (sections.length && 'IntersectionObserver' in window) {
    const setActive = (id) => {
      spyLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    };

    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-15% 0px -75% 0px' });

    sections.forEach((section) => spy.observe(section));
  }

  // Global search: on Enter, jump to the first section whose text matches
  const search = document.getElementById('portalSearch');
  if (search) {
    search.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const query = search.value.trim().toLowerCase();
      if (!query) return;
      const target = sections.find((section) =>
        section.textContent.toLowerCase().includes(query));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
});
