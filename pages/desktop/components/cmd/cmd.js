// CMD Component JavaScript

const CMD_ICON = '<svg viewBox="0 0 24 24" style="width:16px;height:16px;"><rect x="2" y="3" width="20" height="18" rx="2" fill="#000D26" stroke="#0078D4" stroke-width="1.5"/><text x="5" y="16" font-family="Courier" font-size="6" fill="#00FF00" font-weight="bold">C:\\</text><circle cx="20" cy="16" r="1.5" fill="#00FF00"/></svg>';
const BROWSER_ICON = '<svg viewBox="0 0 24 24" style="width:16px;height:16px;"><circle cx="12" cy="12" r="10" fill="#F4B400"/><circle cx="12" cy="12" r="7" fill="#0F9D58"/><circle cx="13" cy="11" r="2.5" fill="#4285F4"/><path d="M12 2 A10 10 0 0 1 19 5" fill="none" stroke="#EA4335" stroke-width="3" stroke-linecap="round"/><path d="M19 5 A10 10 0 0 1 22 12" fill="none" stroke="#F4B400" stroke-width="3" stroke-linecap="round"/><path d="M22 12 A10 10 0 0 1 12 22" fill="none" stroke="#0F9D58" stroke-width="3" stroke-linecap="round"/></svg>';
const EMAIL_ICON = '<svg viewBox="0 0 24 24" style="width:16px;height:16px;"><rect x="2" y="4" width="20" height="16" rx="2" fill="#0078D4"/><path d="M2 6l10 7 10-7" stroke="#ffffff" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>';

const PROMPT = 'jakub@momo-os:~$';

const template = `<!-- Window Content -->
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
</div>`;

function init(ctx) {
  const windowElement = ctx.root;
  const { wm, launcher, windowId } = ctx;
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
      '  history [-c]  Show or clear saved command history',
      '  open <browser|cmd|email|explorer>, mail, exit',
      '',
      'Tip: try the tools you would expect a DevOps engineer to have installed.',
      'Use ↑/↓ for history and Tab to complete.'
    ],
    whoami: ['jakub-adamczyk — DevOps Engineer'],
    ls: ['Documents/', 'Projects/', 'README.md'],
    pwd: ['/home/jakub'],
    version: ['MoMo-OS v1.0.0 - Dream Edition'],
    about: [
      'DevOps Engineer with four years in Azure and on-prem infrastructure.',
      '',
      'At SITA I build Terraform-managed AKS platforms with GitOps, monitoring,',
      'and cost tracking for 1,000+ airports and 400+ airlines across 200+ countries.',
      '',
      'Before that I owned on-prem servers and internal tooling at Bruss.',
      '',
      'Full right to work in the UK and EU.'
    ],
    experience: [
      'SITA — Software Engineer (DevOps)                        2025 – Present',
      '  Letterkenny, Ireland',
      '  * Built Azure platform from empty subscription to working AKS cluster',
      '    with peering, ArgoCD, Gateway API ingress, workload identity, Cosmos DB,',
      '    and Service Bus.',
      '  * Set up monitoring, logging, and cost tracking with Prometheus, Dynatrace,',
      '    and Kubecost, plus ADO alert-to-work-item automation.',
      '  * Moved Terraform state off shared storage, added backups and apply approvals,',
      '    prevent_destroy on production, and private endpoints across key services.',
      '  * Cut non-production Azure spend by scaling node pools to zero out of hours',
      '    and removing unused VMs and pools.',
      '  * Ran Kubernetes upgrades on production clusters across AKS and EKS.',
      '',
      'Bruss — Software Engineer                                2022 – 2025',
      '  Sligo, Ireland',
      '  * Built the CI/CD setup with GitHub Actions, moving the team off editing',
      '    production directly.',
      '  * Replaced a paper-based safety log process with a web app and SAP',
      '    integration, used daily on the shop floor.',
      '  * Sole software engineer for the site, owning the LAMP stack, Arduino-based',
      '    machine sensors, and on-site vSphere server.'
    ],
    projects: [
      'messaging-aks-platform/ Azure AKS platform with ArgoCD, Gateway API, Cosmos DB',
      'observability-cost/     Prometheus, Dynatrace, Kubecost, auto-raised ADO alerts',
      'state-security-gov/     Terraform governance + private endpoints + backups',
      'factory-safety-log/     Web app replacing paper logs with SAP integration',
      'home-infra-platform/    Proxmox + Terraform VMs + Docker/LXC + reverse proxy',
      'interactive-desktop/   You are looking at it right now',
      '',
      'Run "portfolio" to see them in detail.'
    ],
    skills: [
      'Languages ................. Python, Bash, HCL, YAML',
      'Cloud ..................... Azure, AWS',
      'Kubernetes ................ AKS, EKS, ArgoCD, Helm, Gateway API',
      'IaC & CI/CD ............... Terraform, Ansible, Azure DevOps YAML, GitHub Actions',
      'Observability & Cost ...... Prometheus, Grafana, Dynatrace, Kubecost',
      'Data & Messaging .......... PostgreSQL, MongoDB, Elasticsearch, Kafka',
      'Security .................. Entra ID, workload identity, private networking',
      'Other ..................... Linux, Docker, vSphere, Proxmox, Git'
    ],
    education: [
      'M.Sc. Software Architecture and Design (Part-Time) MTU      2025 – 2027',
      'B.E. Mechatronic Systems (with full-time work)     ATU      2021 – 2024'
    ],
    contact: [
      'email     jakub.adamczyk.software@gmail.com',
      'phone     +353 85 860 6319',
      'github    https://github.com/MoMoiin',
      'linkedin  https://linkedin.com/in/jakub-software',
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
    'clear', 'echo', 'date', 'time', 'cat', 'open', 'mail', 'exit', 'portfolio', 'cv', 'history'
  ];

  // Seeded from the persisted session; capped so the blob stays small.
  const HISTORY_LIMIT = 100;
  const history = [...(ctx.storage?.get()?.history ?? [])];
  let historyIndex = history.length;
  const persistHistory = () => {
    ctx.storage?.set({ history: history.slice(-HISTORY_LIMIT) });
  };

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
    if (name === 'history') {
      if (!history.length) {
        appendLine('(no history yet)');
        return;
      }
      if (args[0] === '-c' || args[0] === '--clear') {
        history.length = 0;
        historyIndex = 0;
        persistHistory();
        appendLine('History cleared.');
        return;
      }
      history.forEach((entry, i) => appendLine(`${String(i + 1).padStart(4)}  ${entry}`));
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
      const type = (args[0] || '').toLowerCase();
      if (!launcher?.isImplemented(type)) {
        appendLine('Usage: open <browser|cmd|email|explorer>');
        return;
      }
      launcher.launch(type);
      return;
    }
    if (name === 'mail') {
      launcher?.launch('email');
      return;
    }
    if (name === 'exit') {
      // The close button belongs to the manager-generated frame now, so ask the
      // manager directly rather than synthesising a click.
      wm.close(windowId);
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

  // Focus the proxy when window is clicked (use capture phase for reliability).
  // Registered with onDestroy so closing the terminal detaches it.
  const focusProxy = (e) => {
    if (e.target.closest('.control-btn, .tab-close, .new-tab-button')) return;
    e.preventDefault();
    proxy.focus();
  };
  windowElement.addEventListener('mousedown', focusProxy, true);
  ctx.onDestroy(() => windowElement.removeEventListener('mousedown', focusProxy, true));

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
          persistHistory();
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
    appendLine('Jakub Adamczyk — DevOps Engineer');
    appendLine('Azure · AWS · Kubernetes · Terraform · GitOps · CI/CD');
    appendLine('');
    appendLine('Type "help" to see what this terminal can do.');
    appendLine('Start with "about", or try "kubectl get pods" if you feel at home.');
    appendLine('');
  }
}

export default {
  title: 'MoMo Terminal',
  icon: CMD_ICON,
  template,
  init
};
