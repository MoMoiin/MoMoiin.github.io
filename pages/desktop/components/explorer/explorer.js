// File Explorer Component JavaScript

const FOLDER_ICON = '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mo-tabfold-back" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd977"/><stop offset="1" stop-color="#f0ab27"/></linearGradient><linearGradient id="mo-tabfold-front" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffcf5c"/><stop offset=".55" stop-color="#fcbb35"/><stop offset="1" stop-color="#e3941a"/></linearGradient><linearGradient id="mo-tabfold-sheet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#dfe7f0"/></linearGradient></defs><path d="M6 10.5h12.4l3.4 4.4H42a2.8 2.8 0 0 1 2.8 2.8v3.1H3.2v-7.5A2.8 2.8 0 0 1 6 10.5z" fill="url(#mo-tabfold-back)"/><rect x="12" y="16.4" width="24" height="7.5" rx="1.4" fill="url(#mo-tabfold-sheet)"/><path d="M3.2 20.2h41.6v14.6a2.9 2.9 0 0 1-2.9 2.9H6.1a2.9 2.9 0 0 1-2.9-2.9z" fill="url(#mo-tabfold-front)"/><path d="M3.2 20.2h41.6v2.2H3.2z" fill="#fff" fill-opacity=".35"/></svg>';

const template = `<!-- Explorer Address Bar -->
<div class="address-bar">
  <div class="nav-buttons">
    <button class="nav-btn explorer-up" title="Up">↑</button>
    <button class="nav-btn explorer-refresh" title="Refresh">↻</button>
  </div>
  <div class="address-input">
    <span class="lock-icon">📁</span>
    <span class="url">This PC</span>
  </div>
  <button class="menu-btn" title="Menu">⋮</button>
</div>

<!-- Window Content -->
<div class="window-content explorer-content">
  <div class="explorer-sidebar">
    <div class="sidebar-section">
      <div class="sidebar-item" data-path="">
        <span class="sidebar-icon">💻</span>
        <span>This PC</span>
      </div>
      <div class="sidebar-item" data-path="Projects">
        <span class="sidebar-icon">📂</span>
        <span>Projects</span>
      </div>
      <div class="sidebar-item" data-path="Documents">
        <span class="sidebar-icon">📁</span>
        <span>Documents</span>
      </div>
      <div class="sidebar-item" data-path="Links">
        <span class="sidebar-icon">🔗</span>
        <span>Links</span>
      </div>
    </div>
  </div>

  <div class="explorer-main">
    <div class="explorer-items" id="explorerItems">
      <!-- Items will be added here -->
    </div>
  </div>
</div>`;

// Virtual file system with real portfolio content
const FILE_SYSTEM = {
  '': [
    { name: 'Projects', type: 'folder', icon: '📂', path: 'Projects' },
    { name: 'Documents', type: 'folder', icon: '📁', path: 'Documents' },
    { name: 'Links', type: 'folder', icon: '🔗', path: 'Links' },
    {
      name: 'README.md', type: 'text', icon: '📄',
      text: 'Cloud infrastructure engineer building production platforms on Azure and AWS.\n\nTechnical lead for infrastructure across a team of 9 at SITA, running 8 platform projects over 32 subscriptions in four regions. Built the platform behind SITA\'s airline messaging services from an empty subscription through to a live cutover off decades-old private cloud infrastructure, and wrote the cross-cloud Terraform modules now used by 25+ engineers.\n\nBefore that I owned the production reporting and traceability system at Bruss.\n\nFull right to work in the UK and EU.\n\nBrowse the Projects folder, or open the Terminal and type "help".'
    }
  ],
  'Projects': [
    {
      name: 'messaging-aks-platform.md', type: 'text', icon: '☁️',
      text: 'Messaging AKS Platform (SITA)\n\nBuilt the Azure platform for Messaging Integration from an empty subscription to production, covering AKS, landing zone peering, ArgoCD GitOps delivery, Gateway API ingress, workload identity, Cosmos DB, Service Bus and IBM MQ.\n\nThe platform underpins SITA\'s operational messaging and data APIs, the layer most SITA products depend on.\n\nStack: Azure · AKS · ArgoCD · Gateway API · Terraform · IBM MQ'
    },
    {
      name: 'cross-cloud-terraform-modules.md', type: 'text', icon: '🧩',
      text: 'Cross-Cloud Terraform Modules (SITA)\n\nAuthored the Terraform module set for AWS and Azure, built to drop into any subscription. Now used by 25+ engineers across 3+ teams, so engineers write once and target either cloud.\n\nAlso automated Terraform, Ansible, Docker image builds and application releases through CI/CD tooling written in Go, Python and Bash.\n\nStack: Terraform · AWS · Azure · Go · Python · Bash'
    },
    {
      name: 'legacy-cloud-migration.md', type: 'text', icon: '✈️',
      text: 'Legacy Airline Messaging Migration (SITA)\n\nDelivered the Azure infrastructure for migrating two legacy airline messaging products off decades-old private cloud infrastructure (SITATEX Online and Messaging Integration Mercury).\n\nRan phased and in parallel with a customer pilot group before cutover, with no customer-facing message loss.\n\nStack: Azure · Terraform · AKS · Phased cutover'
    },
    {
      name: 'production-traceability.md', type: 'text', icon: '🏭',
      text: 'Production Reporting and Traceability (Bruss)\n\nBuilt and owned the plant\'s production reporting and traceability system end to end. PHP and Python backend services, REST APIs and a React frontend, used daily by 200+ operators, supervisors and quality staff across 14 lines, replacing a mix of spreadsheets and paper records.\n\nScrap rate fell from 15% to 10% over the period the system was in use, and the plant passed its IATF 16949 audit with the system providing lot-level traceability.\n\nStack: PHP · Python · REST · React · MySQL'
    },
    {
      name: 'home-infrastructure-platform.md', type: 'text', icon: '🏠',
      text: 'Home Infrastructure Platform\n\nProxmox cluster running Docker and LXC workloads. Terraform-provisioned VMs, containerised services behind a Cloudflare reverse proxy, and automated backups. Used as a test bed for new technologies.\n\nStack: Proxmox · Terraform · Docker/LXC · Cloudflare'
    },
    {
      name: 'pocket-scholar.md', type: 'text', icon: '📚',
      text: 'Pocket-Scholar\n\nPortable e-ink flashcard and dictionary device built on an ESP32. Hardware and firmware built from scratch in embedded C++. Used for spaced-repetition learning across languages, history and computer science.\n\nSource: https://github.com/MoMoiin/Pocket-Scholar\n\nStack: ESP32 · Embedded C++ · E-ink'
    },
    {
      name: 'interactive-desktop.md', type: 'text', icon: '🖥️',
      text: 'Interactive Desktop Experience\n\nThe environment you are using right now: a Windows-style desktop built in vanilla JS — draggable/resizable windows, snap zones, a working terminal with a command system, email client and this file explorer. No framework, deployed by GitHub Actions.\n\nStack: Vanilla JS · anime.js · GitHub Actions'
    }
  ],
  'Documents': [
    {
      name: 'experience.txt', type: 'text', icon: '📄',
      text: 'SITA — Software Engineer · Apr 2025 – Present · Letterkenny, Ireland\nTechnical lead for infrastructure across a team of 9. 8 platform projects, 32 subscriptions, four regions.\n\nBruss — Software Engineer · May 2022 – Apr 2025 · Sligo, Ireland\nBuilt and owned the plant\'s production reporting and traceability system.\n\nBruss — Mechatronic Engineer · May 2021 – May 2022 · Sligo, Ireland\nPLC-controlled cells, robot handling cells and machine-vision inspection.\n\nOpen the Terminal and type "experience" for the full history.'
    },
    {
      name: 'education.txt', type: 'text', icon: '🎓',
      text: 'M.Sc. Software Architecture and Design (Part-Time)\nMunster Technological University · 2025 – 2027\n\nB.E. Mechatronic Systems (2.1 Honours)\nAtlantic Technological University · 2021 – 2024\nFinal year project: virtual reality force-feedback tracking gloves.'
    },
    {
      name: 'skills.txt', type: 'text', icon: '📄',
      text: 'Languages: Python, Bash, HCL, Go, Java, C++, PHP, JavaScript, YAML\nCloud: Azure (AKS, Landing Zones, Event Hubs, Service Bus, Cosmos DB, ACR, OpenAI, Private Endpoints), AWS (EKS, EC2, S3, IAM)\nKubernetes: AKS, EKS, ArgoCD, Helm, Gateway API, Cert Manager, External DNS\nIaC and CI/CD: Terraform, Ansible, Azure DevOps YAML, self-hosted agents, GitHub Actions, GitLab CI\nObservability and Cost: Prometheus, Grafana, Dynatrace, Kubecost\nData and Messaging: PostgreSQL, MongoDB, Elasticsearch, Kafka, IBM MQ, Service Bus\nSecurity: Entra ID, workload identity, private networking, Defender for Endpoint, CrowdStrike Falcon\nOther: Linux, Docker, Git, vSphere, Proxmox, React'
    },
    {
      name: 'contact.txt', type: 'text', icon: '✉️',
      text: 'Email: jakub.adamczyk.software@gmail.com\nPhone: +353 85 860 6319\nGitHub: github.com/MoMoiin\nLinkedIn: linkedin.com/in/jakub-software\nSite: momoiin.github.io\nLocation: UK / Ireland\n\nFull right to work in UK and EU'
    }
  ],
  'Links': [
    { name: 'Portfolio site', type: 'link', icon: '🌐', url: '../../index.html' },
    { name: 'GitHub profile', type: 'link', icon: '💻', url: 'https://github.com/MoMoiin' },
    { name: 'LinkedIn', type: 'link', icon: '💼', url: 'https://www.linkedin.com/in/jakub-software/' },
    { name: 'Site source code', type: 'link', icon: '📦', url: 'https://github.com/MoMoiin/MoMoiin.github.io' },
    { name: 'Pocket-Scholar', type: 'link', icon: '📚', url: 'https://github.com/MoMoiin/Pocket-Scholar' }
  ]
};

function init(ctx) {
  const windowEl = ctx.root;
    const itemsContainer = windowEl.querySelector('#explorerItems');
    const urlSpan = windowEl.querySelector('.url');
    const upBtn = windowEl.querySelector('.explorer-up');
    const refreshBtn = windowEl.querySelector('.explorer-refresh');
    const sidebarItems = windowEl.querySelectorAll('.sidebar-item');

    let currentPath = '';

    const syncSidebar = () => {
      sidebarItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-path') === currentPath);
      });
    };

    const openTextFile = (item) => {
      itemsContainer.innerHTML = '';
      const viewer = document.createElement('div');
      viewer.className = 'explorer-text-viewer';

      const backBtn = document.createElement('button');
      backBtn.textContent = '← Back';
      backBtn.className = 'explorer-text-back';
      backBtn.addEventListener('click', () => render(currentPath));

      const title = document.createElement('h3');
      title.textContent = item.name;
      title.className = 'explorer-text-title';

      const body = document.createElement('pre');
      body.textContent = item.text;
      body.className = 'explorer-text-body';

      viewer.appendChild(backBtn);
      viewer.appendChild(title);
      viewer.appendChild(body);
      itemsContainer.appendChild(viewer);

      if (urlSpan) urlSpan.textContent = `This PC${currentPath ? ' > ' + currentPath : ''} > ${item.name}`;
    };

    const openItem = (item) => {
      if (item.type === 'folder') {
        render(item.path);
      } else if (item.type === 'text') {
        openTextFile(item);
      } else if (item.type === 'link') {
        window.open(item.url, '_blank', 'noopener');
      }
    };

    const render = (path) => {
      currentPath = path;
      ctx.storage?.set({ lastPath: path });
      itemsContainer.innerHTML = '';
      const items = FILE_SYSTEM[path] || [];

      items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'explorer-item';
        itemEl.innerHTML = `
          <div class="explorer-item-icon">${item.icon}</div>
          <div class="explorer-item-name">${item.name}</div>
        `;
        itemEl.title = item.type === 'link' ? 'Double-click to open in a new tab' : 'Double-click to open';
        itemEl.addEventListener('dblclick', () => openItem(item));
        itemsContainer.appendChild(itemEl);
      });

      if (urlSpan) urlSpan.textContent = path ? `This PC > ${path}` : 'This PC';
      if (upBtn) upBtn.disabled = !path;
      syncSidebar();
    };

    if (upBtn) upBtn.addEventListener('click', () => render(''));
    if (refreshBtn) refreshBtn.addEventListener('click', () => render(currentPath));

    sidebarItems.forEach(item => {
      item.addEventListener('click', () => {
        render(item.getAttribute('data-path') || '');
      });
    });

    // Reopen where the user left off, if that folder still exists.
    const savedPath = ctx.storage?.get()?.lastPath;
    render(savedPath && FILE_SYSTEM[savedPath] ? savedPath : '');
  }

export default {
  title: 'Explorer',
  icon: FOLDER_ICON,
  template,
  init
};
