document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Menu Behavior
    const header = document.getElementById('main-header');
    const navMenu = document.getElementById('nav-menu');
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky Navbar on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        highlightNavLink();
    });

    // Mobile Menu Toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            
            // Toggle hamburger icon animation
            const bars = menuToggle.querySelectorAll('.bar');
            if (navMenu.classList.contains('active')) {
                bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });
    }

    // Close Mobile Menu on Link Click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const bars = menuToggle.querySelectorAll('.bar');
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        });
    });

    // Highlight Current Section on Scroll
    function highlightNavLink() {
        const scrollPosition = window.scrollY + 100;
        const sections = document.querySelectorAll('section, footer');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // 2. Stats Counters Animation
    const statsSection = document.getElementById('about');
    const statNumbers = document.querySelectorAll('.stat-number');
    let animated = false;

    const countUp = (element) => {
        const target = parseInt(element.getAttribute('data-target'), 10);
        const duration = 2000; // 2 seconds
        const stepTime = Math.max(Math.floor(duration / target), 15);
        let start = 0;
        
        // Adjust step sizes for very large numbers
        const step = target > 1000 ? Math.ceil(target / (duration / stepTime)) : 1;

        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = start.toLocaleString();
            }
        }, stepTime);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                statNumbers.forEach(num => countUp(num));
                animated = true;
            }
        });
    }, { threshold: 0.3 });

    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    // 3. Tab System for UK Benefits
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Toggle active buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Toggle active content pane
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.getAttribute('id') === tabId) {
                    // Force display block then fade in using CSS classes
                    setTimeout(() => {
                        pane.classList.add('active');
                    }, 50);
                }
            });
        });
    });

    // 4. Interactive Diagnostic Widget
    const cyberForm = document.getElementById('cyber-form');
    const stepForm = document.getElementById('step-form');
    const stepLoader = document.getElementById('step-loader');
    const stepResults = document.getElementById('step-results');
    const resetBtn = document.getElementById('reset-diagnostic');
    
    const riskScore = document.getElementById('risk-score');
    const recInvestigative = document.getElementById('rec-investigative');
    const recAutomation = document.getElementById('rec-automation');

    if (cyberForm) {
        cyberForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const sector = document.getElementById('org-sector').value;
            const threat = document.getElementById('threat-vector').value;
            const maturity = document.querySelector('input[name="auto-level"]:checked').value;

            // Transition to loading step
            stepForm.style.display = 'none';
            stepLoader.style.display = 'block';

            // Simulate analysis calculations
            setTimeout(() => {
                const results = processDiagnostic(sector, threat, maturity);
                
                // Populate results text
                riskScore.className = `risk-badge ${results.riskClass}`;
                riskScore.textContent = results.riskText;
                recInvestigative.innerHTML = results.investigativeText;
                recAutomation.innerHTML = results.automationText;

                // Transition to results step
                stepLoader.style.display = 'none';
                stepResults.style.display = 'block';
            }, 1800);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            stepResults.style.display = 'none';
            stepForm.style.display = 'block';
            cyberForm.reset();
        });
    }

    // Strategic recommendation parser based on Amit Dubey's casework
    function processDiagnostic(sector, threat, maturity) {
        let riskText = 'High';
        let riskClass = 'high';
        
        // Risk evaluation logic
        if (maturity === 'high') {
            riskText = 'Medium';
            riskClass = 'medium';
        } else if (threat === 'ransom' || sector === 'infrastructure') {
            riskText = 'Critical';
            riskClass = 'critical';
        }

        // Recommendations Mapping
        const database = {
            scams: {
                investigative: `<strong>Casework Strategy (Mobi Armour App Framework):</strong> Apply Amit Dubey’s mobile vulnerability database rules. Establish spoof-detection registries to actively identify lookalike domains, SMS tags, and unauthorized payment links targeted at your client base.`,
                automation: `<strong>Automation Partners Solution:</strong> Set up automated threat feed orchestrations. When mock domains are created, automate DNS abuse reports and update firewall threat feeds across all client systems within 5 minutes.`
            },
            social: {
                investigative: `<strong>Casework Strategy (Hidden Files Playbook):</strong> Move beyond static presentations. Implement narrative-based social engineering simulations based on real case studies (such as spoofed identity, audio deepfakes, and urgent C-Suite spoofing).`,
                automation: `<strong>Automation Partners Solution:</strong> Configure automated sandboxing and analysis of external attachments. Build automated user-alert triggers inside email clients that verify unusual sender behaviors.`
            },
            insider: {
                investigative: `<strong>Casework Strategy (Forensic Data Trail):</strong> Set up rigorous behavior pattern mapping. Amit Dubey's cases demonstrate that data leaks often follow logical indicators: unusual off-hours logins, massive file staging, or bulk document transfers.`,
                automation: `<strong>Automation Partners Solution:</strong> Integrate automated user behavior analytics (UBA). Deploy automated playbook actions to quarantine user accounts and lock active directory tokens immediately upon unauthorized large downloads.`
            },
            ransom: {
                investigative: `<strong>Casework Strategy (Infiltration Recovery):</strong> Draw from over 300 investigated network intrusions. Prioritize logical micro-segmentation of critical databases. Establish a clear "incident war room" command protocol and dark-web communication policies.`,
                automation: `<strong>Automation Partners Solution:</strong> Design automated incident isolation rules. In the event of a detected ransomware payload signature, automate network port shutdowns to prevent horizontal malware spread.`
            }
        };

        const sectorContexts = {
            finance: "<strong>Banking Sector Impact:</strong> Safeguarding digital transactions is crucial. Focus on client-side authentication and real-time transaction blocking.",
            healthcare: "<strong>Healthcare Sector Impact:</strong> Securing legacy medical endpoints and patient medical records must be prioritized. Focus on privilege limitation.",
            government: "<strong>Public Sector Impact:</strong> Focus on strict alignment with MEITY/MHA equivalent national standards and police officer cyber intelligence drills.",
            infrastructure: "<strong>CNI Sector Impact:</strong> Protecting SCADA/ICS networks from state-sponsored APTs is paramount. Offline fallback automation must be tested.",
            enterprise: "<strong>Commercial Sector Impact:</strong> Focus on low-overhead automated tools, raising general employee threat awareness, and third-party vendor risk."
        };

        // Combine recommendations
        const baseRecs = database[threat];
        const sectorPrefix = sectorContexts[sector];

        return {
            riskText: riskText,
            riskClass: riskClass,
            investigativeText: `${sectorPrefix}<br><br>${baseRecs.investigative}`,
            automationText: baseRecs.automation
        };
    }

    // 5. Theme Switcher System
    const themeToggle = document.getElementById('theme-switcher-toggle');
    const themeMenu = document.getElementById('theme-menu');
    const themeOptions = document.querySelectorAll('.theme-option');

    // Toggle menu visibility
    if (themeToggle && themeMenu) {
        themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            themeMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (themeMenu && !themeMenu.contains(e.target) && e.target !== themeToggle) {
                themeMenu.classList.remove('active');
            }
        });
    }

    // Handle theme selection
    if (themeOptions) {
        themeOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                const selectedTheme = opt.getAttribute('data-theme');
                
                // Set active class in menu
                themeOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');

                // Apply theme to body
                applyTheme(selectedTheme);

                // Close menu
                if (themeMenu) themeMenu.classList.remove('active');
            });
        });
    }

    // Helper to apply theme classes
    function applyTheme(theme) {
        // Remove all theme classes
        document.body.classList.remove('theme-cyber', 'theme-executive', 'theme-stealth', 'theme-brutalist');
        
        // Add selected theme class
        const themeClass = `theme-${theme}`;
        document.body.classList.add(themeClass);
        
        // Save to localStorage
        localStorage.setItem('amit-dubey-theme', theme);
    }

    // Load saved theme on startup
    const savedTheme = localStorage.getItem('amit-dubey-theme') || 'cyber';
    const activeOpt = document.querySelector(`.theme-option[data-theme="${savedTheme}"]`);
    if (activeOpt && themeOptions) {
        themeOptions.forEach(o => o.classList.remove('active'));
        activeOpt.classList.add('active');
    }
    applyTheme(savedTheme);
});

