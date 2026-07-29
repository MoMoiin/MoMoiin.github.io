// File Explorer Component JavaScript

const FOLDER_ICON = '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="folderGradSmall" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#FFD54F;stop-opacity:1" /><stop offset="100%" style="stop-color:#FFC107;stop-opacity:1" /></linearGradient></defs><path d="M8 8C5.8 8 4 9.8 4 12v24c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V16c0-2.2-1.8-4-4-4H23l-3-4H8z" fill="url(#folderGradSmall)"/><path d="M8 16h32v20H8z" fill="#FFE082" opacity="0.5"/></svg>';

export const htmlTemplate = `<!-- Explorer Window Component -->
<div class="chrome-tabs">
  <div class="tab-container">
    <div class="tab active">
      <div class="tab-content">
        <span class="tab-icon">${FOLDER_ICON}</span>
        <span class="tab-title">This PC</span>
        <button class="tab-close" title="Close tab">�-</button>
      </div>
    </div>
    <button class="new-tab-button" title="New tab">+</button>
  </div>
  <div class="window-controls">
    <button class="control-btn minimize-btn" title="Minimize">−</button>
    <button class="control-btn maximize-btn" title="Maximize">□</button>
    <button class="control-btn close-btn" title="Close">�-</button>
  </div>
</div>

<!-- Explorer Address Bar -->
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
        <span class="sidebar-icon">�-</span>
        <span>Links</span>
      </div>
    </div>
  </div>

  <div class="explorer-main">
    <div class="explorer-items" id="explorerItems">
      <!-- Items will be added here -->
    </div>
  </div>
</div>

<!-- Resize Handles -->
<div class="resize-handle resize-top"></div>
<div class="resize-handle resize-right"></div>
<div class="resize-handle resize-bottom"></div>
<div class="resize-handle resize-left"></div>
<div class="resize-handle resize-corner-tl"></div>
<div class="resize-handle resize-corner-tr"></div>
<div class="resize-handle resize-corner-bl"></div>
<div class="resize-handle resize-corner-br"></div>`;

// Virtual file system with real portfolio content
const FILE_SYSTEM = {
  '': [
    { name: 'Projects', type: 'folder', icon: '📂', path: 'Projects' },
    { name: 'Documents', type: 'folder', icon: '📁', path: 'Documents' },
    { name: 'Links', type: 'folder', icon: '�-', path: 'Links' },
    {
      name: 'README.md', type: 'text', icon: '📄',
      text: 'DevOps Engineer with four years in Azure and on-prem infrastructure.\n\nAt SITA I build Terraform-managed AKS platforms with GitOps, monitoring, and cost tracking. Before that I owned on-prem servers and internal tooling at Bruss.\n\nFull right to work in the UK and EU.\n\nBrowse the Projects folder, or open the Terminal and type "help".'
    }
  ],
  'Projects': [
    {
      name: 'messaging-aks-platform.md', type: 'text', icon: '☁️',
      text: 'Messaging AKS Platform (SITA)\n\nBuilt the Azure platform for Messaging Integration from an empty subscription up to a working AKS cluster, including peering to the landing zone, ArgoCD, Gateway API ingress, workload identity, Cosmos DB, and Service Bus.\n\nStack: Azure · AKS · ArgoCD · Gateway API · Terraform'
    },
    {
      name: 'observability-and-cost.md', type: 'text', icon: '📊',
      text: 'Observability and Cost Tracking (SITA)\n\nSet up monitoring, logging, and cost tracking using Prometheus, Dynatrace, and Kubecost, plus alerting that raises Azure DevOps items automatically so production alerts do not get lost.\n\nStack: Prometheus · Dynatrace · Kubecost · Azure DevOps'
    },
    {
      name: 'state-security-governance.md', type: 'text', icon: '🛡️',
      text: 'Terraform State, Security and Governance (SITA)\n\nMoved Terraform state off a shared storage account, added backups and approvals on apply, enforced prevent_destroy on production, and rolled out private endpoints for Event Hubs, ACR, and Databricks.\n\nStack: Terraform · Azure Networking · Security Controls'
    },
    {
      name: 'factory-safety-log.md', type: 'text', icon: '🏭',
      text: 'Factory Safety-Log Platform (Bruss)\n\nReplaced a paper-based safety log process with a web app and SAP integration, used daily on the shop floor.\n\nStack: LAMP · SQL · SAP API'
    },
    {
      name: 'home-infrastructure-platform.md', type: 'text', icon: '🏠',
      text: 'Home Infrastructure Platform\n\nProxmox cluster running Docker and LXC workloads, with Terraform-provisioned VMs, containerized services behind a reverse proxy, and automated backups. Used as a testbed for patterns I also use at SITA.\n\nStack: Proxmox · Terraform · Docker/LXC · Reverse Proxy'
    },
    {
      name: 'interactive-desktop.md', type: 'text', icon: '🖥️',
      text: 'Interactive Desktop Experience\n\nThe environment you are using right now: a Windows-style desktop built in vanilla JS — draggable/resizable windows, snap zones, a working terminal with a command system, email client and this file explorer. No framework, deployed by GitHub Actions.\n\nStack: Vanilla JS · anime.js · GitHub Actions'
    }
  ],
  'Documents': [
    {
      name: 'experience.txt', type: 'text', icon: '📄',
      text: 'SITA — Software Engineer (DevOps) · 2025 – Present · Letterkenny, Ireland\n\nBruss — Software Engineer · 2022 – 2025 · Sligo, Ireland\n\nOpen the Terminal and type "experience" for the full history.'
    },
    {
      name: 'education.txt', type: 'text', icon: '🎓',
      text: 'M.Sc. Software Architecture and Design (Part-Time)\nMunster Technological University · 2025 – 2027\n\nB.E. Mechatronic Systems (alongside full-time work)\nAtlantic Technological University · 2021 – 2024'
    },
    {
      name: 'skills.txt', type: 'text', icon: '📄',
      text: 'Languages: Python, Bash, HCL, YAML\nCloud: Azure (AKS, Landing Zones, Event Hubs, Service Bus, Cosmos DB, ACR, Private Endpoints), AWS (EKS, EC2, S3, IAM)\nKubernetes: AKS, EKS, ArgoCD, Helm, Gateway API, Cert Manager, External DNS\nIaC and CI/CD: Terraform, Ansible, Azure DevOps YAML, self-hosted agents, GitHub Actions\nObservability and Cost: Prometheus, Grafana, Dynatrace, Kubecost\nData and Messaging: PostgreSQL, MongoDB, Elasticsearch, Kafka\nSecurity: Entra ID, workload identity, private networking, Defender for Endpoint, CrowdStrike Falcon\nOther: Linux, Docker, vSphere, Proxmox, Git'
    },
    {
      name: 'contact.txt', type: 'text', icon: '✉️',
      text: 'Email: jakub.adamczyk.software@gmail.com\nPhone: +353 85 860 6319\nGitHub: github.com/MoMoiin\nLinkedIn: linkedin.com/in/jakub-software\nLocation: Letterkenny, Ireland\n\nFull right to work in UK and EU'
    }
  ],
  'Links': [
    { name: 'Portfolio site', type: 'link', icon: '🌐', url: '../../index.html' },
    { name: 'GitHub profile', type: 'link', icon: '💻', url: 'https://github.com/MoMoiin' },
    { name: 'LinkedIn', type: 'link', icon: '💼', url: 'https://www.linkedin.com/in/jakub-software/' },
    { name: 'Site source code', type: 'link', icon: '📦', url: 'https://github.com/MoMoiin/MoMoiin.github.io' }
  ]
};

class ExplorerComponent {
  static init(windowEl) {
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
      viewer.style.cssText = 'grid-column:1/-1;width:100%;padding:8px 12px;';

      const backBtn = document.createElement('button');
      backBtn.textContent = '← Back';
      backBtn.style.cssText = 'margin-bottom:12px;padding:5px 14px;cursor:pointer;border:1px solid #ccc;border-radius:4px;background:#fff;font-size:13px;';
      backBtn.addEventListener('click', () => render(currentPath));

      const title = document.createElement('h3');
      title.textContent = item.name;
      title.style.cssText = 'margin:0 0 10px;font-size:15px;';

      const body = document.createElement('pre');
      body.textContent = item.text;
      body.style.cssText = 'white-space:pre-wrap;font-family:inherit;font-size:13.5px;line-height:1.6;margin:0;';

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

    render('');
  }
}

export default ExplorerComponent;
