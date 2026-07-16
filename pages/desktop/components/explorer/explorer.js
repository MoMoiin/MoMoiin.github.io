// File Explorer Component JavaScript

const FOLDER_ICON = '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="folderGradSmall" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#FFD54F;stop-opacity:1" /><stop offset="100%" style="stop-color:#FFC107;stop-opacity:1" /></linearGradient></defs><path d="M8 8C5.8 8 4 9.8 4 12v24c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V16c0-2.2-1.8-4-4-4H23l-3-4H8z" fill="url(#folderGradSmall)"/><path d="M8 16h32v20H8z" fill="#FFE082" opacity="0.5"/></svg>';

export const htmlTemplate = `<!-- Explorer Window Component -->
<div class="chrome-tabs">
  <div class="tab-container">
    <div class="tab active">
      <div class="tab-content">
        <span class="tab-icon">${FOLDER_ICON}</span>
        <span class="tab-title">This PC</span>
        <button class="tab-close" title="Close tab">×</button>
      </div>
    </div>
    <button class="new-tab-button" title="New tab">+</button>
  </div>
  <div class="window-controls">
    <button class="control-btn minimize-btn" title="Minimize">−</button>
    <button class="control-btn maximize-btn" title="Maximize">□</button>
    <button class="control-btn close-btn" title="Close">×</button>
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
    { name: 'Links', type: 'folder', icon: '🔗', path: 'Links' },
    {
      name: 'README.md', type: 'text', icon: '📄',
      text: 'DevOps/Platform Engineer with 4 years\' experience owning cloud infrastructure end-to-end, from architecture design to security remediation.\n\nCurrently designing and running Azure/AWS infrastructure for SITA, supporting IT for 1,000+ airports and 400+ airlines across 200+ countries.\n\nPursuing an MSc in Software Architecture & Design; targeting remote platform and MLOps roles in regulated, high-availability environments.\n\nBrowse the Projects folder, or open the Terminal and type "help".'
    }
  ],
  'Projects': [
    {
      name: 'ai-pr-reviewer.md', type: 'text', icon: '🤖',
      text: 'AI-Powered PR Reviewer (SITA)\n\nDesigned and built an automated PR review pipeline integrating Azure OpenAI with Azure DevOps, architecting the summarization and comment-posting workflow; adopted across multiple engineering teams.\n\nStack: Azure OpenAI · Azure DevOps · Python'
    },
    {
      name: 'azure-landing-zone.md', type: 'text', icon: '🏗️',
      text: 'Azure Landing Zone (SITA)\n\nOwned end-to-end implementation of a new Azure landing zone for private cloud migration, covering 2 core products. Given the target architecture, independently designed the Terraform module structure and CI/CD pipelines now used by developers, QA, and DevOps engineers across both teams.\n\nStack: Terraform · Azure · CI/CD'
    },
    {
      name: 'aks-hardening.md', type: 'text', icon: '🛡️',
      text: 'AKS Security Hardening (SITA)\n\nRemediated security gaps across Azure Kubernetes Service (AKS), including access control (IAM/RBAC), root permission restrictions, and node configuration hardening, raising Azure Defender security score from 32% to 71%.\n\nStack: AKS · IAM/RBAC · Azure Defender'
    },
    {
      name: 'factory-safety-log.md', type: 'text', icon: '🏭',
      text: 'Factory Safety-Log Platform (Bruss GmbH)\n\nReplaced a manual paper safety log process across 300 machines with a self-built app, feeding data into a SQL database and integrating with SAP via a custom API.\n\nStack: LAMP · SQL · SAP API'
    },
    {
      name: 'homelab.md', type: 'text', icon: '🏠',
      text: 'Homelab\n\nSelf-hosted Proxmox server running containerized services (Docker, LXC), including VPN-routed container networking and media/automation services; hands-on Linux networking, storage, and virtualization troubleshooting.\n\nStack: Proxmox · Docker/LXC · Linux'
    },
    {
      name: 'interactive-desktop.md', type: 'text', icon: '🖥️',
      text: 'Interactive Desktop Experience\n\nThe environment you are using right now: a Windows-style desktop built in vanilla JS — draggable/resizable windows, snap zones, a working terminal with a command system, email client and this file explorer. No framework, deployed by GitHub Actions.\n\nStack: Vanilla JS · anime.js · GitHub Actions'
    }
  ],
  'Documents': [
    {
      name: 'experience.txt', type: 'text', icon: '📄',
      text: 'SITA — Software Engineer (DevOps/Platform) · Apr 2025 – Present · Letterkenny, Ireland\n\nBruss GmbH — Software Engineer (Full-Stack) · May 2022 – Apr 2025 · Sligo, Ireland\n\nBruss GmbH — Mechatronic Engineering Intern · Sep 2021 – May 2022 · Sligo, Ireland\n\nOpen the Terminal and type "experience" for the full history.'
    },
    {
      name: 'education.txt', type: 'text', icon: '🎓',
      text: 'MSc Software Architecture & Design (in progress)\nMunster Technological University · 2025 – 2027\n\nBE Mechatronic Systems\nAtlantic Technological University · 2021 – 2024'
    },
    {
      name: 'skills.txt', type: 'text', icon: '📄',
      text: 'Cloud & Virtualization: Azure, AWS, vSphere\nContainers & Orchestration: Kubernetes (AKS, EKS), Docker\nIaC & Automation: Terraform, Ansible, Bash\nCI/CD: Azure DevOps, GitHub Actions\nSecurity: IAM/RBAC, AKS hardening, Azure Defender\nLanguages & Data: Python, C#/.NET, SQL, MySQL\nAI Integration: Azure OpenAI'
    },
    {
      name: 'contact.txt', type: 'text', icon: '✉️',
      text: 'Email: jakub.adamczyk.software@gmail.com\nGitHub: github.com/MoMoiin\nLinkedIn: linkedin.com/in/jakub-adamczyk-software\n\nStrabane, Northern Ireland, UK (GMT/BST) · Remote-ready\nFull right to work in UK and Ireland/EU'
    }
  ],
  'Links': [
    { name: 'Portfolio site', type: 'link', icon: '🌐', url: '../../index.html' },
    { name: 'GitHub profile', type: 'link', icon: '💻', url: 'https://github.com/MoMoiin' },
    { name: 'LinkedIn', type: 'link', icon: '💼', url: 'https://www.linkedin.com/in/jakub-adamczyk-software/' },
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
