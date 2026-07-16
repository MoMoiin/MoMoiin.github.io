// CMD Component JavaScript

const CMD_ICON = '<svg viewBox="0 0 24 24" style="width:16px;height:16px;"><rect x="2" y="3" width="20" height="18" rx="2" fill="#000D26" stroke="#0078D4" stroke-width="1.5"/><text x="5" y="16" font-family="Courier" font-size="6" fill="#00FF00" font-weight="bold">C:\\</text><circle cx="20" cy="16" r="1.5" fill="#00FF00"/></svg>';
const BROWSER_ICON = '<svg viewBox="0 0 24 24" style="width:16px;height:16px;"><circle cx="12" cy="12" r="10" fill="#F4B400"/><circle cx="12" cy="12" r="7" fill="#0F9D58"/><circle cx="13" cy="11" r="2.5" fill="#4285F4"/><path d="M12 2 A10 10 0 0 1 19 5" fill="none" stroke="#EA4335" stroke-width="3" stroke-linecap="round"/><path d="M19 5 A10 10 0 0 1 22 12" fill="none" stroke="#F4B400" stroke-width="3" stroke-linecap="round"/><path d="M22 12 A10 10 0 0 1 12 22" fill="none" stroke="#0F9D58" stroke-width="3" stroke-linecap="round"/></svg>';
const EMAIL_ICON = '<svg viewBox="0 0 24 24" style="width:16px;height:16px;"><rect x="2" y="4" width="20" height="16" rx="2" fill="#0078D4"/><path d="M2 6l10 7 10-7" stroke="#ffffff" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>';

const PROMPT = 'jakub@momo-os:~$';

export const htmlTemplate = `<!-- CMD Window Component -->
<div class="chrome-tabs">
  <div class="tab-container">
    <div class="tab active">
      <div class="tab-content">
        <span class="tab-icon">${CMD_ICON}</span>
        <span class="tab-title">MoMo Terminal</span>
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

<!-- Window Content -->
<div class="window-content cmd-content">
  <div class="cmd-header">MoMo-OS [Version 1.0.0 - Dream Edition]</div>
  <div class="cmd-header">(c) MoMoiin Studios. All creations unlocked.</div>

  <div class="cmd-banner">▄▄▄      ▄▄▄       ▄▄▄      ▄▄▄                       ▄▄▄▄  ▄▄▄  ▄▄▄▄      ▄▄
████▄  ▄████       ████▄  ▄████       ▀▀              ▀███  ███  ███▀      ██
███▀████▀███ ▄███▄ ███▀████▀███ ▄███▄ ██  ████▄        ███  ███  ███ ▄█▀█▄ ████▄
███  ▀▀  ███ ██ ██ ███  ▀▀  ███ ██ ██ ██  ██ ██ ▀▀▀▀▀  ███▄▄███▄▄███ ██▄█▀ ██ ██
███      ███ ▀███▀ ███      ███ ▀███▀ ██▄ ██ ██         ▀████▀████▀  ▀█▄▄▄ ████▀ </div>


  <div class="cmd-output" aria-live="polite"></div>

  <!-- Hidden input proxy to capture keystrokes (moved off-screen so it can receive focus) -->
  <input type="text" class="cmd-input-proxy" autocomplete="off" spellcheck="false" tabindex="-1" style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;" />

  <!-- Display line -->
  <div class="cmd-line-display">
    <span class="cmd-prompt">${PROMPT}</span>
    <span class="cmd-display"></span>
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

export function init(windowElement) {
  // Simple terminal using invisible input proxy to capture all keystrokes
  const proxy = windowElement.querySelector('.cmd-input-proxy');
  const output = windowElement.querySelector('.cmd-output');
  const display = windowElement.querySelector('.cmd-display');
  const content = windowElement.querySelector('.window-content');

  const COMMANDS = {
    help: [
      'Portfolio commands:',
      '  about        Who I am',
      '  experience   Work history',
      '  projects     Things I have built',
      '  skills       Tech I work with',
      '  education    Degrees',
      '  contact      How to reach me',
      '  portfolio    Open the main site',
      '',
      'System commands:',
      '  ls, cat <file>, pwd, whoami, date, time, echo <text>, clear, version',
      '  open <browser|cmd|email|explorer>, mail, exit',
      '',
      'Tip: try the tools you would expect a DevOps engineer to have installed.',
      'Use ↑/↓ for history and Tab to complete.'
    ],
    whoami: ['jakub-adamczyk — DevOps/Platform Engineer'],
    ls: ['Documents/', 'Projects/', 'README.md'],
    pwd: ['/home/jakub'],
    version: ['MoMo-OS v1.0.0 - Dream Edition'],
    about: [
      'DevOps/Platform Engineer with 4 years\' experience owning cloud infrastructure',
      'end-to-end, from architecture design to security remediation.',
      '',
      'Currently designing and running Azure/AWS infrastructure for SITA, supporting',
      'IT for 1,000+ airports and 400+ airlines across 200+ countries.',
      '',
      'Pursuing an MSc in Software Architecture & Design; targeting remote platform',
      'and MLOps roles in regulated, high-availability environments.'
    ],
    experience: [
      'SITA — Software Engineer (DevOps/Platform)              Apr 2025 – Present',
      '  Letterkenny, Ireland',
      '  * Automated PR review pipeline integrating Azure OpenAI with Azure DevOps;',
      '    adopted across multiple engineering teams.',
      '  * Owned end-to-end implementation of a new Azure landing zone for private',
      '    cloud migration — Terraform module structure and CI/CD pipelines.',
      '  * Remediated AKS security gaps (IAM/RBAC, root permission restrictions,',
      '    node hardening), raising Azure Defender security score from 32% to 71%.',
      '  * Automated VM and AKS scheduling, cutting idle time by 91.7% (~669 hours).',
      '  * Extended Terraform IaC practices to AWS, incl. managed EKS upgrades.',
      '  * Mentored three engineers through the private cloud to Azure migration.',
      '',
      'Bruss GmbH — Software Engineer (Full-Stack)              May 2022 – Apr 2025',
      '  Sligo, Ireland',
      '  * Sole software engineer: LAMP stack, Arduino machine inputs, vSphere.',
      '  * Replaced paper safety logs across 300 machines with a self-built app,',
      '    feeding SQL and integrating with SAP via a custom API.',
      '  * Built a dev environment with CI/CD via GitHub Actions.',
      '',
      'Bruss GmbH — Mechatronic Engineering Intern              Sep 2021 – May 2022',
      '  * QA on inspection machines; custom components for recurring faults.'
    ],
    projects: [
      'ai-pr-reviewer/        Azure OpenAI + Azure DevOps automated PR review',
      'azure-landing-zone/    Terraform modules + CI/CD for cloud migration',
      'aks-hardening/         IAM/RBAC + node hardening, Defender 32% -> 71%',
      'factory-safety-log/    Web app replacing paper logs on 300 machines (SAP API)',
      'homelab/               Proxmox, Docker/LXC, VPN-routed networking',
      'interactive-desktop/   You are looking at it right now',
      '',
      'Run "portfolio" to see them in detail.'
    ],
    skills: [
      'Cloud & Virtualization ... Azure, AWS, vSphere',
      'Containers ............... Kubernetes (AKS, EKS), Docker',
      'IaC & Automation ......... Terraform, Ansible, Bash',
      'CI/CD .................... Azure DevOps, GitHub Actions',
      'Security ................. IAM/RBAC, AKS hardening, Azure Defender',
      'Languages & Data ......... Python, C#/.NET, SQL, MySQL',
      'AI Integration ........... Azure OpenAI'
    ],
    education: [
      'MSc Software Architecture & Design (in progress)   MTU      2025 – 2027',
      'BE Mechatronic Systems                             ATU      2021 – 2024'
    ],
    contact: [
      'email     jakub.adamczyk.software@gmail.com',
      'github    https://github.com/MoMoiin',
      'linkedin  https://linkedin.com/in/jakub-adamczyk-software',
      '',
      'Run "mail" to open the mail app.'
    ],
    neofetch: [
      '            ▄▄███▄▄            jakub@momo-os',
      '          ▄█████████▄          -------------',
      '        ▄████▀ ▀█████▄         OS:       MoMo-OS 1.0.0 Dream Edition',
      '       ████▀     ▀█████        Host:     Interactive Desktop (vanilla JS)',
      '      ████   ▄▄▄   █████       Kernel:   window-manager 2.0',
      '     ████   █████   █████      Uptime:   4 years in production',
      '    ████    ▀███▀    █████     Shell:    momo-sh',
      '   ████▄▄▄▄▄▄▄▄▄▄▄▄▄▄██████    IaC:      Terraform, Ansible',
      '  ████              ███████    Clusters: AKS, EKS',
      ' ▀▀▀▀                ▀▀▀▀▀▀    CI/CD:    Azure DevOps, GitHub Actions'
    ]
  };

  const EASTER_EGGS = {
    kubectl: (args) => {
      if (args.join(' ').startsWith('get pod')) {
        return [
          'NAMESPACE     NAME                                READY   STATUS             RESTARTS   AGE',
          'portfolio     interactive-desktop-7d9f8b-x2x4p    1/1     Running            0          4y',
          'portfolio     terminal-emulator-5c6d7e-k8s4u      1/1     Running            0          4y',
          'aviation      landing-zone-controller-8f4a2-9dk2  1/1     Running            0          1y',
          'aviation      aks-hardening-daemon-2b3c4-mm1zz    1/1     Running            0          1y',
          'kitchen       coffee-machine-0                    0/1     CrashLoopBackOff   127        3h'
        ];
      }
      return ['kubectl controls the Kubernetes cluster manager. Try: kubectl get pods'];
    },
    terraform: (args) => {
      if (args[0] === 'plan') {
        return [
          'Terraform will perform the following actions:',
          '',
          '  # jakub_career.next_role will be created',
          '  + resource "platform_engineer" "remote" {',
          '      + cloud        = ["azure", "aws"]',
          '      + kubernetes   = true',
          '      + environment  = "regulated, high-availability"',
          '      + availability = "immediate"',
          '    }',
          '',
          'Plan: 1 to add, 0 to change, 0 to destroy.',
          '',
          'Run "contact" to apply this plan.'
        ];
      }
      if (args[0] === 'apply') {
        return ['Error: approval required. Run "mail" to submit a hiring request.'];
      }
      return ['Usage: terraform [plan|apply]'];
    },
    docker: (args) => {
      if (args[0] === 'ps') {
        return [
          'CONTAINER ID   IMAGE                    STATUS         NAMES',
          'a1b2c3d4e5f6   jakub/devops:latest      Up 4 years     platform-engineering',
          'f6e5d4c3b2a1   jakub/fullstack:stable   Up 3 years     lamp-sap-integration',
          '0f1e2d3c4b5a   jakub/homelab:proxmox    Up 2 years     vpn-routed-media-stack'
        ];
      }
      return ['Usage: docker ps'];
    },
    az: () => [
      '{',
      '  "environmentName": "AzureCloud",',
      '  "name": "jakub-adamczyk — production",',
      '  "state": "Enabled",',
      '  "user": { "name": "jakub.adamczyk.software@gmail.com", "type": "engineer" }',
      '}'
    ],
    ansible: () => [
      'PLAY [hire jakub] *************************************************',
      '',
      'TASK [Gathering Facts] ********************************************',
      'ok: [your-company]',
      '',
      'TASK [Review portfolio] *******************************************',
      'changed: [your-company]',
      '',
      'PLAY RECAP ********************************************************',
      'your-company : ok=2  changed=1  unreachable=0  failed=0'
    ],
    sudo: () => ['jakub is not in the sudoers file. This incident will be reported.'],
    ssh: () => ['Permission denied (publickey). Try "contact" for an authorized channel.'],
    ping: () => [
      'PING jakub.adamczyk.software@gmail.com: 56 data bytes',
      '64 bytes: icmp_seq=0 ttl=64 time=42ms',
      '--- statistics: 1 packets transmitted, 1 received, 0.0% packet loss ---'
    ],
    vim: () => ['E37: No write since last change. (Nobody escapes vim — try "exit" instead.)'],
    htop: () => ['CPU [||||||||||||||||||||95%]  learning-new-tech', 'MEM [||||||||||          48%]  kubernetes-contexts', 'Swp [|                    2%]  legacy-php-memories']
  };

  const FILES = {
    'readme.md': COMMANDS.about
  };

  const COMPLETIONS = [
    ...Object.keys(COMMANDS),
    ...Object.keys(EASTER_EGGS),
    'clear', 'echo', 'date', 'time', 'cat', 'open', 'mail', 'exit', 'portfolio', 'cv'
  ];

  const history = [];
  let historyIndex = -1;

  function appendLine(text, cls = 'cmd-line') {
    const el = document.createElement('div');
    el.className = cls;
    el.textContent = text;
    output.appendChild(el);
    const content = windowElement.querySelector('.window-content');
    content.scrollTop = content.scrollHeight;
  }

  function runCommand(raw) {
    const cmd = String(raw || '').trim();
    if (!cmd) return;
    const parts = cmd.split(/\s+/);
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (name === 'clear') {
      output.innerHTML = '';
      return;
    }
    if (name === 'echo') {
      appendLine(args.join(' '));
      return;
    }
    if (name === 'date') {
      appendLine(new Date().toLocaleDateString());
      return;
    }
    if (name === 'time') {
      appendLine(new Date().toLocaleTimeString());
      return;
    }
    if (name === 'cat') {
      const file = (args[0] || '').toLowerCase();
      if (FILES[file]) {
        FILES[file].forEach(l => appendLine(l));
      } else {
        appendLine(`cat: ${args[0] || ''}: No such file`);
      }
      return;
    }
    if (name === 'portfolio' || name === 'cv') {
      appendLine('Opening portfolio...');
      window.open('../../index.html', '_blank');
      return;
    }
    if (name === 'open') {
      if (args[0] && window.windowManager) {
        const type = args[0].toLowerCase();
        const existing = Array.from(window.windowManager.windows.entries()).find(([, v]) => v.type === type);
        if (existing) {
          window.windowManager.handleRestore(existing[0]);
        } else {
          const iconMap = { browser: BROWSER_ICON, cmd: CMD_ICON, email: EMAIL_ICON, explorer: BROWSER_ICON };
          if (['browser', 'cmd', 'email', 'explorer'].includes(type)) {
            window.windowManager.createWindow(type, type.charAt(0).toUpperCase() + type.slice(1), iconMap[type]);
          } else {
            appendLine('Usage: open <browser|cmd|email|explorer>');
          }
        }
      } else {
        appendLine('Usage: open <browser|cmd|email|explorer>');
      }
      return;
    }
    if (name === 'mail') {
      if (window.windowManager) {
        const existing = Array.from(window.windowManager.windows.entries()).find(([, v]) => v.type === 'email');
        if (existing) window.windowManager.handleRestore(existing[0]);
        else window.windowManager.createWindow('email', 'Mail', EMAIL_ICON);
      }
      return;
    }
    if (name === 'exit') {
      const closeBtn = windowElement.querySelector('.close-btn');
      if (closeBtn) closeBtn.click();
      return;
    }
    if (EASTER_EGGS[name]) {
      EASTER_EGGS[name](args).forEach(l => appendLine(l));
      return;
    }
    if (COMMANDS[name]) {
      COMMANDS[name].forEach(l => appendLine(l));
      return;
    }
    appendLine(`${name}: command not found — type "help"`);
  }

  // Focus the proxy when window is clicked (use capture phase for reliability)
  windowElement.addEventListener('mousedown', (e) => {
    const control = e.target.closest('.control-btn, .tab-close, .new-tab-button');
    if (control) return;
    // Always focus proxy on any click in the window
    e.preventDefault();
    proxy.focus();
  }, true);

  if (proxy) {
    // Sync proxy input to display
    proxy.addEventListener('input', () => {
      display.textContent = proxy.value;
      content.scrollTop = content.scrollHeight;
    });

    // Handle Enter, history and tab completion
    proxy.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const text = proxy.value;
        appendLine(`${PROMPT} ${text}`);
        if (text.trim()) {
          history.push(text);
        }
        historyIndex = history.length;
        runCommand(text);
        proxy.value = '';
        display.textContent = '';
        content.scrollTop = content.scrollHeight;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          proxy.value = history[historyIndex];
          display.textContent = proxy.value;
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          historyIndex++;
          proxy.value = history[historyIndex];
        } else {
          historyIndex = history.length;
          proxy.value = '';
        }
        display.textContent = proxy.value;
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const current = proxy.value.trim().toLowerCase();
        if (!current) return;
        const matches = COMPLETIONS.filter(c => c.startsWith(current));
        if (matches.length === 1) {
          proxy.value = matches[0] + ' ';
          display.textContent = proxy.value;
        } else if (matches.length > 1) {
          appendLine(`${PROMPT} ${proxy.value}`);
          appendLine(matches.join('   '));
        }
      }
    });

    // Focus on init
    setTimeout(() => proxy.focus(), 50);

    // Welcome message
    appendLine('');
    appendLine('Jakub Adamczyk — DevOps/Platform Engineer');
    appendLine('Azure · AWS · Kubernetes · Terraform · CI/CD');
    appendLine('');
    appendLine('Type "help" to see what this terminal can do.');
    appendLine('Start with "about", or try "kubectl get pods" if you feel at home.');
    appendLine('');
  }
}

export default { htmlTemplate, init };
