document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Menu Behavior
    const header = document.getElementById('main-header');
    const navMenu = document.getElementById('nav-menu');
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky Navbar on Scroll (rAF-throttled for smoother mobile scrolling)
    let scrollTicking = false;
    const onScrollFrame = () => {
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }
        highlightNavLink();
        scrollTicking = false;
    };
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            scrollTicking = true;
            requestAnimationFrame(onScrollFrame);
        }
    }, { passive: true });

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
    const resetMobileToggle = () => {
        if (!menuToggle || !navMenu) return;
        navMenu.classList.remove('active');
        menuToggle.classList.remove('active');
        const bars = menuToggle.querySelectorAll('.bar');
        if (bars.length >= 3) {
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        }
    };
    navLinks.forEach(link => {
        link.addEventListener('click', resetMobileToggle);
    });
    // Close menu on Escape / viewport resize to desktop
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') resetMobileToggle();
    });
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) resetMobileToggle();
    }, { passive: true });

    // Highlight Current Section on Scroll
    function highlightNavLink() {
        // Multi-page navigation uses explicit page URLs; retain the page's active link.
        if (![...navLinks].some(link => link.getAttribute('href').startsWith('#'))) return;
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

    // 5. Expandable casework details + magical motion
    const caseworkModal = document.getElementById('casework-modal');
    const caseworkButtons = document.querySelectorAll('[data-case]');
    const caseworkTitle = document.getElementById('casework-modal-title');
    const caseworkSummary = document.getElementById('casework-modal-summary');
    const caseworkDetail = document.getElementById('casework-modal-detail');
    const caseworkImage = document.getElementById('casework-modal-image');
    const caseworkSourceLink = document.getElementById('casework-source-link');
    const caseworkMeta = document.getElementById('casework-modal-meta');
    const caseworkFindingsWrap = document.getElementById('casework-modal-findings-wrap');
    const caseworkFindings = document.getElementById('casework-modal-findings');
    const caseworkLessonsWrap = document.getElementById('casework-modal-lessons-wrap');
    const caseworkLessons = document.getElementById('casework-modal-lessons');
    const caseworkCloseButtons = document.querySelectorAll('[data-case-close]');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let previouslyFocusedCaseworkElement = null;

    const caseworkContent = {
        platform: {
            label: 'National digital infrastructure',
            title: 'Hardening India’s population-scale contact-tracing platform',
            summary: 'In a December 2020 IMPRI panel discussion, Amit Dubey publicly outlined findings from his own study of Aarogya Setu—identity-access management weaknesses, manipulable client-side verification, location spoofing risks and SSL-pinning concerns—and noted those issues were later fixed.',
            detail: 'Aarogya Setu reached 50 million users in 13 days and later reported well over 200 million downloads (about 240 million in later government statements). The publicly relevant lesson is not vaccination delivery—that sat on CoWIN—but how a national contact-tracing service must harden authentication, sessions and client trust boundaries while under intense live scrutiny.',
            meta: ['2020', 'Aarogya Setu study', 'Public panel findings'],
            findings: [
                'Identity-access management and client-side verification could be manipulated in early versions.',
                'Location values could be altered, weakening trust in proximity/risk signals.',
                'SSL-pinning and related transport-trust concerns needed remediation.',
                'Dubey emphasised confidentiality, integrity and availability while noting no proven user-data breach had been demonstrated at the time.'
            ],
            lessons: [
                'Treat population-scale launches as continuous security programmes, not one-off audits.',
                'Protect identity and session boundaries before growth becomes irreversible.',
                'Publish remediation clarity under pressure—public trust is part of the control surface.'
            ],
            image: 'images/image73.jpg',
            imageAlt: 'Amit Dubey speaking at a digital government event',
            sourceUrl: 'https://www.counterview.net/2020/12/concern-over-fall-in-penetration-in.html',
            sourceLabel: 'Read the public panel reference'
        },
        fraud: {
            label: 'Hidden Files investigation',
            title: 'Financial fraud & scam networks',
            summary: 'Hidden Files 3.0 Episode 5 documents a fraudster taking money from a victim after accessing her WhatsApp—an account compromise that immediately became a payment-fraud event.',
            detail: 'Once a messaging account is captured, attackers inherit trust: contacts believe the request, urgency feels personal, and money moves before anyone challenges the channel. The investigation theme shows how social-graph trust becomes the attack path.',
            meta: ['WhatsApp compromise', 'Payment fraud', 'Hidden Files Ep. 5'],
            findings: [
                'Messaging-account takeover can bypass traditional banking malware.',
                'Trusted contacts become unwitting amplifiers of the scam.',
                'Speed to payment is the attacker’s main advantage.'
            ],
            lessons: [
                'Connect customer protection, fraud ops and technical controls into one journey.',
                'Detect impersonation signals early and offer an easy verification path.',
                'Interrupt high-risk payment journeys before funds leave the account.'
            ],
            image: 'images/casework-financial-fraud.jpg',
            imageAlt: 'Conceptual visualisation of payment-fraud detection',
            sourceUrl: 'https://omny.fm/shows/hidden-files-1/ep-5-whatsapp-hack-and-money-fraud-hidden-files-3',
            sourceLabel: 'Listen to the public case reference'
        },
        identity: {
            label: 'Hidden Files investigation',
            title: 'Digital identity theft',
            summary: 'A public Hidden Files loan-app fraud episode highlights how casually shared identity proofs and over-permissioned apps create durable identity risk, harassment paths and account-takeover potential.',
            detail: 'Loan-app and identity-proof scams succeed because victims hand over KYC artefacts, contacts and device permissions under the pressure of urgent credit. One weak verification step then becomes a reusable identity package for the attacker.',
            meta: ['Loan-app fraud', 'KYC misuse', 'Layered identity'],
            findings: [
                'Identity documents shared with untrusted apps are hard to revoke.',
                'Contact and media permissions expand the blackmail and social-engineering surface.',
                'A single login check rarely stops account takeover after documents leak.'
            ],
            lessons: [
                'Design layered identity verification, not a single credential gate.',
                'Limit session lifetime and privilege after sensitive proof collection.',
                'Give victims a clear recovery and reporting path before harassment escalates.'
            ],
            image: 'images/casework-identity-theft.jpg',
            imageAlt: 'Conceptual visualisation of identity protection and account takeover',
            sourceUrl: 'https://music.amazon.co.uk/podcasts/c54444e0-5daf-45de-a0cc-ef70ccb225b1/episodes/4107bce7-5a4e-424e-b1fa-5efad7b53eb7/hidden-files-ep-10-loan-app-fraud',
            sourceLabel: 'Listen to the public case reference'
        },
        espionage: {
            label: 'Hidden Files investigation',
            title: 'Corporate espionage',
            summary: 'The Hidden Files episode “Critical Alert” follows Prashant after he installs what appears to be an IT software update—only for sensitive company information to leak.',
            detail: 'The deception works because the update looks operationally normal. Once trust in the IT channel is abused, data leaves quietly and the organisation discovers the breach only after business damage is already underway.',
            meta: ['Trusted-update abuse', 'Data leak', 'Critical Alert'],
            findings: [
                'Attackers can hide inside expected IT workflows such as software updates.',
                'Sensitive data exposure may outpace detection if logging is fragmented.',
                'Business impact arrives before attribution is clear.'
            ],
            lessons: [
                'Know where sensitive information lives and who can move it.',
                'Monitor meaningful access-behaviour changes, not only perimeter alerts.',
                'Retain records that support a forensic timeline under pressure.'
            ],
            image: 'images/casework-enterprise-response.jpg',
            imageAlt: 'Conceptual visualisation of enterprise data protection and incident response',
            sourceUrl: 'https://omny.fm/shows/hidden-files-1/critical-alert',
            sourceLabel: 'Listen to Critical Alert'
        },
        extortion: {
            label: 'Hidden Files investigation',
            title: 'Online extortion',
            summary: 'The Hidden Files ransomware episode follows businessman Raghuvir after his operations are hit. Even after Amit Dubey helps crack the case, the criminal escalates surveillance and continued pressure.',
            detail: 'Ransomware is rarely only encryption. The lasting threat is decision paralysis: who leads, what is isolated first, what is communicated, and how recovery proceeds while the attacker tries to keep dictating tempo.',
            meta: ['Ransomware', 'Post-incident pressure', 'Business continuity'],
            findings: [
                'Operational freeze creates leverage before negotiations even begin.',
                'Attackers may continue surveillance after the first containment steps.',
                'Unrehearsed communications amplify uncertainty and secondary harm.'
            ],
            lessons: [
                'Pre-assign incident command, isolation priorities and decision logs.',
                'Rehearse external and internal communications before an extortion clock starts.',
                'Treat recovery as a controlled campaign, not a scramble.'
            ],
            image: 'images/casework-enterprise-response.jpg',
            imageAlt: 'Conceptual visualisation of enterprise ransomware incident response',
            sourceUrl: 'https://omny.fm/shows/hidden-files-1/ransomware',
            sourceLabel: 'Listen to the ransomware case'
        },
        terrorism: {
            label: 'Agency-supported investigation theme',
            title: 'Terrorism-linked cybercrime',
            summary: 'Public profile materials credit Amit Dubey with terrorism-linked cyber investigation experience and advisory work with agencies such as NIA, CBI and I4C. No named public case narrative is published here by design.',
            detail: 'In this class of work, speed cannot outrank integrity. Evidence must remain reliable, access must stay controlled, and organisational response has to support the wider investigation without contaminating it.',
            meta: ['High-integrity forensics', 'Multi-agency coordination', 'Anonymised'],
            findings: [
                'Public bios and profile materials cite terrorism-linked cyber casework among investigated themes.',
                'Named operational details are withheld to protect victims, methods and partner agencies.',
                'The transferable organisational value is process discipline under elevated stakes.'
            ],
            lessons: [
                'Preserve chain-of-custody and controlled evidence access from the first hour.',
                'Use clear escalation paths when matters leave ordinary corporate incident response.',
                'Document decisions accurately so support to agencies remains proportionate and useful.'
            ],
            image: 'images/casework-enterprise-response.jpg',
            imageAlt: 'Conceptual visualisation of a high-integrity cyber investigation'
        }
    };

    const fillCaseworkList = (wrap, listEl, items) => {
        if (!wrap || !listEl) return;
        listEl.innerHTML = '';
        if (!items?.length) {
            wrap.hidden = true;
            return;
        }
        items.forEach((item) => {
            const li = document.createElement('li');
            li.textContent = item;
            listEl.appendChild(li);
        });
        wrap.hidden = false;
    };

    function closeCaseworkModal() {
        if (!caseworkModal) return;
        caseworkModal.classList.remove('is-open');
        caseworkModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('casework-modal-open');
        previouslyFocusedCaseworkElement?.focus();
    }

    caseworkButtons.forEach(button => {
        button.addEventListener('click', () => {
            const content = caseworkContent[button.dataset.case];
            if (!content || !caseworkModal) return;
            previouslyFocusedCaseworkElement = button;
            document.getElementById('casework-modal-label').textContent = content.label;
            caseworkTitle.textContent = content.title;
            caseworkSummary.textContent = content.summary;
            caseworkDetail.textContent = content.detail;
            caseworkImage.src = content.image;
            caseworkImage.alt = content.imageAlt;
            caseworkImage.hidden = !content.image;
            if (caseworkMeta) {
                caseworkMeta.innerHTML = '';
                if (content.meta?.length) {
                    content.meta.forEach((chip) => {
                        const span = document.createElement('span');
                        span.textContent = chip;
                        caseworkMeta.appendChild(span);
                    });
                    caseworkMeta.hidden = false;
                } else {
                    caseworkMeta.hidden = true;
                }
            }
            fillCaseworkList(caseworkFindingsWrap, caseworkFindings, content.findings);
            fillCaseworkList(caseworkLessonsWrap, caseworkLessons, content.lessons);
            caseworkSourceLink.href = content.sourceUrl || '#';
            caseworkSourceLink.textContent = content.sourceLabel || '';
            caseworkSourceLink.hidden = !content.sourceUrl;
            caseworkModal.classList.add('is-open');
            caseworkModal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('casework-modal-open');
            caseworkModal.querySelector('.casework-modal-close').focus();
        });
    });

    caseworkCloseButtons.forEach(button => button.addEventListener('click', closeCaseworkModal));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && caseworkModal?.classList.contains('is-open')) closeCaseworkModal();
    });

    // Casework reveal, metric count-up, and tilt "magic"
    const caseworkSection = document.getElementById('casework');
    const revealNodes = document.querySelectorAll('[data-casework-reveal]');
    if (caseworkSection && revealNodes.length) {
        if (prefersReducedMotion) {
            revealNodes.forEach((node) => node.classList.add('is-visible'));
        } else {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                });
            }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
            revealNodes.forEach((node) => revealObserver.observe(node));
        }
    }

    const metricNodes = document.querySelectorAll('.casework-metrics [data-count-to]');
    let metricsAnimated = false;
    const animateCaseworkMetrics = () => {
        if (metricsAnimated) return;
        metricsAnimated = true;
        metricNodes.forEach((node) => {
            const target = Number(node.getAttribute('data-count-to'));
            const suffix = node.getAttribute('data-count-suffix') || '';
            const label = node.getAttribute('data-count-label');
            if (label) {
                node.textContent = label;
                return;
            }
            if (prefersReducedMotion || !Number.isFinite(target)) {
                node.textContent = `${target}${suffix}`;
                return;
            }
            const duration = 1400;
            const start = performance.now();
            const tick = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                node.textContent = `${Math.round(target * eased)}${suffix}`;
                if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
    };

    if (metricNodes.length) {
        const metricsObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) animateCaseworkMetrics();
            });
        }, { threshold: 0.4 });
        metricsObserver.observe(metricNodes[0].closest('.casework-metrics') || metricNodes[0]);
    }

    if (!prefersReducedMotion) {
        document.querySelectorAll('[data-casework-tilt]').forEach((card) => {
            card.addEventListener('pointermove', (event) => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;
                const rotateY = (x - 0.5) * 8;
                const rotateX = (0.5 - y) * 8;
                card.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
                card.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
                card.style.setProperty('--shine-x', `${(x * 100).toFixed(1)}%`);
                card.style.setProperty('--shine-y', `${(y * 100).toFixed(1)}%`);
                card.classList.add('is-tilting');
            });
            card.addEventListener('pointerleave', () => {
                card.classList.remove('is-tilting');
                card.style.setProperty('--tilt-x', '0deg');
                card.style.setProperty('--tilt-y', '0deg');
            });
        });
    }

    // 6. Theme Switcher System
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
    const savedTheme = localStorage.getItem('amit-dubey-theme') || 'executive';
    const activeOpt = document.querySelector(`.theme-option[data-theme="${savedTheme}"]`);
    if (activeOpt && themeOptions) {
        themeOptions.forEach(o => o.classList.remove('active'));
        activeOpt.classList.add('active');
    }
    applyTheme(savedTheme);
});
