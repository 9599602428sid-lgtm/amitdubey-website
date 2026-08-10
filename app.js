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
    const caseworkTitle = document.getElementById('casework-modal-title');
    const caseworkSummary = document.getElementById('casework-modal-summary');
    const caseworkDetail = document.getElementById('casework-modal-detail');
    const caseworkImage = document.getElementById('casework-modal-image');
    const caseworkSourceLink = document.getElementById('casework-source-link');
    const caseworkMeta = document.getElementById('casework-modal-meta');
    const caseworkMetrics = document.getElementById('casework-modal-metrics');
    const caseworkFindingsWrap = document.getElementById('casework-modal-findings-wrap');
    const caseworkFindings = document.getElementById('casework-modal-findings');
    const caseworkLessonsWrap = document.getElementById('casework-modal-lessons-wrap');
    const caseworkLessons = document.getElementById('casework-modal-lessons');
    const caseworkTimelineWrap = document.getElementById('casework-modal-timeline-wrap');
    const caseworkTimeline = document.getElementById('casework-modal-timeline');
    const caseworkPlaybookWrap = document.getElementById('casework-modal-playbook-wrap');
    const caseworkPlaybook = document.getElementById('casework-modal-playbook');
    const caseworkCloseButtons = document.querySelectorAll('[data-case-close]');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let previouslyFocusedCaseworkElement = null;

    const caseworkContent = {
        kidnapping: {
            label: 'Case study 01 · National security & VIP extortion',
            title: 'The Independence Day eve kidnapping & cyber ransom',
            summary: 'On 14 August—on the eve of India’s Independence Day—Balwant Singh, a senior public-sector executive, vanished. Hours later his spouse received an anonymous ₹2 crore extortion demand delivered through burner mobiles and spoofed VoIP gateways.',
            detail: 'The high-profile abduction left zero physical clues and threatened national-security reputations because of the timing and status of the official. Traditional CDR analysis failed: perpetrators switched SIM cards and handsets after short 15-second transmissions.',
            meta: ['VIP kidnapping', '₹2 crore ransom', 'CBI & State Cyber Cell'],
            metrics: [
                { value: '₹2 Cr', label: 'extortion demand' },
                { value: 14, label: 'cell towers correlated' },
                { value: '200m', label: 'final search-grid radius' }
            ],
            timeline: [
                'Cell tower dump correlation: extracted logs from 14 towers along the suspected movement vector, isolating overlapping active handset identifiers (IMEI ∩ IMSI).',
                'Handset handoff latency: calculated signal propagation delays between base transceiver stations to determine vehicle velocity and route trajectory.',
                'Voice-over-IP decryption: identified an unencrypted SIP trunk session used for one ransom call and resolved the originating public IP to a rogue proxy in a neighbouring district.',
                'Multi-tower CDR triangulation and BTS timing-advance mapping narrowed the hideout in real time.'
            ],
            findings: [
                'Ground tactical teams raided the hideout before the Independence Day deadline.',
                'Balwant Singh was safely rescued.',
                'All three members of the armed gang were arrested.'
            ],
            lessons: [
                'Shifting from static phone-number tracking to dynamic BTS timing-advance analysis bypassed the criminals’ handset-swapping evasion tactic.'
            ],
            playbook: [
                'Target / victim: Balwant Singh (Director, Public Sector Undertaking)',
                'Primary crime: VIP kidnapping, high-stakes extortion & ransom demand (₹2 crore)',
                'Investigating bodies: Central Bureau of Investigation (CBI) & State Cyber Cell',
                'Key technical tools: CDR/IPDR tower-dump triangulation, IMEI masking decryption, geo-fencing'
            ],
            image: 'images/casework-enterprise-response.jpg',
            imageAlt: 'Conceptual visualisation of telecom triangulation and VIP extortion response'
        },
        coldcase: {
            label: 'Case study 02 · Cold case & AI profiling',
            title: 'Cracking the 19-year-old unsolved homicide via AI forensics',
            summary: 'A brutal homicide from 19 years earlier remained unsolved. The primary suspect had vanished, leaving only a single low-resolution grainy identity-card photograph. Manual distribution of the image yielded zero leads for nearly two decades.',
            detail: 'Primitive surveillance and broken eye-witness continuity had frozen the case. Amit Dubey revitalised it with AI facial aging, neural super-resolution and cross-database biometric vector search.',
            meta: ['Cold case homicide', '19 years unresolved', 'AI facial embeddings'],
            metrics: [
                { value: 19, suffix: ' yrs', label: 'cold before breakthrough' },
                { value: '99.4%', label: 'structural biometric match' },
                { value: '512-D', label: 'facial embedding space' }
            ],
            timeline: [
                'AI facial aging & feature projection: generated age-progressed 3D biometric mesh renders simulating 19 years of facial aging, bone-density change and hair thinning.',
                'Resolution enhancement: deployed GANs to reconstruct high-frequency facial landmarks from a pixelated ~150×150 source photo.',
                'Automated database scraping & vector search: converted profiles into 512-dimensional facial embeddings and ran similarity comparisons against newly digitised public registration databases.',
                'A cosine-distance hit (distance < 0.12) flagged a candidate living under a forged identity in another state.'
            ],
            findings: [
                'Biometric verification confirmed a 99.4% structural match.',
                'The suspect was arrested while living under an assumed identity.',
                'He confessed to the 19-year-old murder.'
            ],
            lessons: [
                'Modern AI facial vector embeddings can transcend physical aging and low image resolution to reopen dormant cold cases.'
            ],
            playbook: [
                'Crime category: cold-case homicide / murder investigation',
                'Time lapse: 19 years cold (unresolved since mid-2000s)',
                'Technology applied: AI facial aging reconstruction, neural-network super-resolution, cross-database matching',
                'Outcome: identification and apprehension of the prime suspect living under an assumed identity'
            ],
            image: 'images/casework-identity-theft.jpg',
            imageAlt: 'Conceptual visualisation of AI facial aging and biometric matching'
        },
        banking: {
            label: 'Case study 03 · Financial malware & banking fraud',
            title: 'The ₹82 lakh unsolicited-call financial drain',
            summary: 'A high-net-worth victim answered a brief incoming phone call, then noticed minor screen flickering. Within hours, ₹82 lakhs was drained across 24 rapid RTGS/NEFT transactions—without OTP disclosure or visible SMS alerts.',
            detail: 'No explicit phishing link had been clicked, raising panic about a cellular exploit. Deep mobile memory forensics revealed a covert Remote Access Trojan woken by the call, intercepting bank OTPs and deleting local SMS evidence.',
            meta: ['Mobile RAT', '₹82 lakh loss', '140 mule accounts'],
            metrics: [
                { value: 82, suffix: 'L', label: 'rupees drained from victim' },
                { value: 24, label: 'rapid RTGS/NEFT transfers' },
                { value: 54, suffix: 'L', label: 'rupees recovered' }
            ],
            timeline: [
                'RAM & storage memory dump: recovered a covert Android RAT pre-installed via a malicious SMS payload masquerading as a carrier update.',
                'Trigger analysis: the inbound call acted as a wake-up signal for a dormant Trojan that elevated privileges through an OS accessibility API exploit.',
                'SMS & notification interception: malware hid bank OTP messages, forwarded them over encrypted MQTT to a C2 server, then deleted local SMS logs.',
                'Financial mule tracing: mapped dispersion of ₹82 lakhs across 140 layered mule accounts within 45 minutes using graph analysis.'
            ],
            findings: [
                'Automated freeze requests to destination banks were issued inside the investigative window.',
                'C2 traffic decryption helped dismantle a syndicate operating across three states.',
                '₹54 lakhs was recovered for the victim.'
            ],
            lessons: [
                'Accessibility API abuse on mobile devices, combined with fast-track banking liens, is decisive against zero/one-click RAT fraud.'
            ],
            playbook: [
                'Financial loss: ₹82 lakhs ($100,000+ USD equivalent)',
                'Attack vector: zero-click / one-click mobile RAT malware',
                'Modus operandi: phone-call trigger → background APK payload → OTP interception',
                'Forensic field: mobile firmware analysis, reverse engineering, banking mule tracking'
            ],
            image: 'images/casework-financial-fraud.jpg',
            imageAlt: 'Conceptual visualisation of banking malware and mule-account tracing'
        },
        sextortion: {
            label: 'Case study 04 · Cyber extortion & darknet profiling',
            title: 'The anonymized sextortion & digital blackmail network',
            summary: 'A young female student was targeted by an anonymous blackmailer who possessed compromising private media and demanded recurring payments under threat of public release.',
            detail: 'The attacker used virtual numbers, Tor routing and dynamic Telegram channels, making traditional IP tracking ineffective. Dubey shifted to socio-technical profiling and behavioural digital forensics.',
            meta: ['Sextortion', 'Tor & VPN', 'Browser fingerprinting'],
            metrics: [
                { value: 'Tor', label: 'anonymity layer bypassed' },
                { value: 'Stylometry', label: 'writing-signature match' },
                { value: 'Canary', label: 'device fingerprint capture' }
            ],
            timeline: [
                'Linguistic & stylometric profiling: analysed punctuation, typing rhythm, slang and spelling errors to build a unique writing signature.',
                'Honey-token / tracking canary: crafted a custom payment-confirmation link carrying an embedded pixel payload.',
                'Device artefact capture: when opened, the payload performed zero-privilege browser fingerprinting—canvas hashes, WebGL vendor ID, timezone and battery-status readings.',
                'Digital footprint cross-referencing: correlated captured device parameters with local historical logs, matching an acquaintance of the victim.'
            ],
            findings: [
                'The perpetrator was identified as a close acquaintance who had briefly accessed the victim’s unencrypted secondary device months earlier.',
                'The suspect was apprehended.',
                'All primary digital copies were confiscated and destroyed.'
            ],
            lessons: [
                'Human behavioural markers and browser-layer device fingerprinting can breach multi-layer VPN and proxy anonymity when network tracing fails.'
            ],
            playbook: [
                'Crime category: digital blackmail, sextortion & privacy breach',
                'Anonymity layers: VPN tunnelling, Tor network, encrypted messaging (Telegram)',
                'Forensic approach: OSINT, stylometry, digital-footprint correlation',
                'Public archive: featured in Live Hindustan & RedFM Hidden Files case archives'
            ],
            image: 'images/casework-identity-theft.jpg',
            imageAlt: 'Conceptual visualisation of darknet profiling and digital blackmail response'
        },
        identity: {
            label: 'Case study 05 · Identity theft & financial impersonation',
            title: 'The deceased man’s digital identity bank heist',
            summary: 'A family discovered that their deceased relative’s bank savings—untouched for 2.5 years after death—had been systematically drained through online transfers authenticated with valid OTPs and re-verified KYC documents.',
            detail: 'The perplexing question: how could a deceased individual execute modern digital banking? Historical telecom and banking-ledger analysis exposed recycled SIMs, obituary targeting and forged e-KYC resets.',
            meta: ['Post-mortem ID theft', 'SIM recycling', 'e-KYC hijack'],
            metrics: [
                { value: '2.5 yrs', label: 'after account holder’s death' },
                { value: 'SIM', label: 'number deliberately re-acquired' },
                { value: 'Policy', label: 'banking guideline changes prompted' }
            ],
            timeline: [
                'SIM lifecycle analysis: telecom operators re-allocated deactivated numbers after inactivity; the criminal targeted obituaries and matched names to leaked banking databases.',
                'Re-allocated SIM acquisition: the fraudster deliberately obtained the mobile number formerly owned by the deceased.',
                'Forged e-KYC hijack: using forged Aadhaar modifications, the attacker requested a mobile-banking password reset and received OTPs on the re-issued SIM.',
                'Findings exposed a systemic vulnerability in telecom number re-allocation protocols.'
            ],
            findings: [
                'The investigation forced recognition of recycled-number risk in digital banking.',
                'Updated banking guidelines were prompted to require death-registry cross-verification before mobile-banking reactivation on dormant accounts.',
                'The case is detailed in Hidden Files with IPS Prof. Triveni Singh.'
            ],
            lessons: [
                'Security risks in recycled cellular numbers demand structural policy change in e-KYC re-authentication—not only case-by-case freezes.'
            ],
            playbook: [
                'Anomaly type: post-mortem identity theft & synthetic credential fraud',
                'Time post-demise: 2.5 years after the account holder’s death',
                'Primary vector: SIM-swap / recycled-number fraud, e-KYC exploitation, bank portal bypass',
                'Co-author reference: detailed in Hidden Files with IPS Prof. Triveni Singh'
            ],
            image: 'images/casework-financial-fraud.jpg',
            imageAlt: 'Conceptual visualisation of post-mortem identity theft and e-KYC fraud'
        },
        youth: {
            label: 'Case study 06 · Youth cybercrime & ransomware',
            title: 'The 14-year-old cyber prodigy & institutional extortion',
            summary: 'A major educational board and administrative server network suffered persistent disruptions, database corruption and extortion threats. Attack patterns looked sophisticated enough that authorities suspected an international state-sponsored adversary.',
            detail: 'Packet captures and server logs told a different story: TTL values, TCP window sizes and code artefacts pointed to a local residential broadband connection—and a 14-year-old student operating from a bedroom with an unpatched home router.',
            meta: ['Juvenile hacker', 'Institutional extortion', 'Ethical rehab'],
            metrics: [
                { value: 14, label: 'year-old self-taught perpetrator' },
                { value: 'Local ISP', label: 'origin vs suspected nation-state' },
                { value: 'Rehab', label: 'resolution over incarceration' }
            ],
            timeline: [
                'Packet TTL & subnet profiling: IP TTL values and TCP window sizes showed attacks originated from a local residential broadband ISP, not an overseas server farm.',
                'Code artefact analysis: decompiled custom Python exploit scripts; comments contained gaming handles and anime-culture references.',
                'OSINT reconnaissance: traced handles across Discord and GitHub forums to a 14-year-old student.',
                'Technical neutralization followed by advocacy for constructive legal diversion into ethical hacking mentorship.'
            ],
            findings: [
                'The threat actor was a juvenile operating from home infrastructure, not a nation-state unit.',
                'Systems were technically neutralized.',
                'Dubey advocated redirecting the juvenile into ethical hacking mentorship and cyber-defence training rather than traditional incarceration.'
            ],
            lessons: [
                'Deep packet inspection and source-code artefact analysis can distinguish nation-state theatre from localised juvenile talent—and change the justice outcome.'
            ],
            playbook: [
                'Perpetrator profile: 14-year-old self-taught hacker',
                'Target systems: educational institutions & regional government servers',
                'Technique used: DDoS, SQL injection, custom Python ransomware scripts',
                'Resolution strategy: technical neutralization & ethical rehabilitation protocol'
            ],
            image: 'images/casework-enterprise-response.jpg',
            imageAlt: 'Conceptual visualisation of youth cybercrime investigation and institutional response'
        }
    };

    const fillCaseworkList = (wrap, listEl, items, ordered = false) => {
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
        if (ordered) wrap.classList.add('is-ordered');
    };

    const fillCaseworkMetrics = (metrics) => {
        if (!caseworkMetrics) return;
        caseworkMetrics.innerHTML = '';
        if (!metrics?.length) {
            caseworkMetrics.hidden = true;
            return;
        }
        metrics.forEach((metric) => {
            const item = document.createElement('div');
            const valueEl = document.createElement('strong');
            const labelEl = document.createElement('span');
            const numeric = typeof metric.value === 'number';
            valueEl.textContent = numeric ? `0${metric.suffix || ''}` : String(metric.value);
            if (numeric) {
                valueEl.dataset.countTo = String(metric.value);
                valueEl.dataset.countSuffix = metric.suffix || '';
            }
            labelEl.textContent = metric.label;
            item.appendChild(valueEl);
            item.appendChild(labelEl);
            caseworkMetrics.appendChild(item);
        });
        caseworkMetrics.hidden = false;
    };

    const animateModalMetrics = () => {
        if (!caseworkMetrics) return;
        caseworkMetrics.querySelectorAll('[data-count-to]').forEach((node) => {
            const target = Number(node.dataset.countTo);
            const suffix = node.dataset.countSuffix || '';
            if (!Number.isFinite(target)) {
                node.textContent = `${node.dataset.countTo}${suffix}`;
                return;
            }
            if (prefersReducedMotion) {
                node.textContent = `${target}${suffix}`;
                return;
            }
            const duration = 1200;
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

    function closeCaseworkModal() {
        if (!caseworkModal) return;
        caseworkModal.classList.remove('is-open');
        caseworkModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('casework-modal-open');
        previouslyFocusedCaseworkElement?.focus();
    }

    const openCaseworkModal = (caseId, triggerButton = null) => {
        const content = caseworkContent[caseId];
        if (!content || !caseworkModal) return false;
        previouslyFocusedCaseworkElement = triggerButton;
        const labelEl = document.getElementById('casework-modal-label');
        if (labelEl) labelEl.textContent = content.label;
        if (caseworkTitle) caseworkTitle.textContent = content.title;
        if (caseworkSummary) caseworkSummary.textContent = content.summary;
        if (caseworkDetail) caseworkDetail.textContent = content.detail;
        if (caseworkImage) {
            caseworkImage.src = content.image || '';
            caseworkImage.alt = content.imageAlt || '';
            caseworkImage.hidden = !content.image;
        }
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
        fillCaseworkMetrics(content.metrics);
        fillCaseworkList(caseworkTimelineWrap, caseworkTimeline, content.timeline, true);
        fillCaseworkList(caseworkFindingsWrap, caseworkFindings, content.findings);
        fillCaseworkList(caseworkLessonsWrap, caseworkLessons, content.lessons);
        fillCaseworkList(caseworkPlaybookWrap, caseworkPlaybook, content.playbook);
        if (caseworkSourceLink) {
            if (content.sourceUrl) {
                caseworkSourceLink.href = content.sourceUrl;
                caseworkSourceLink.textContent = content.sourceLabel || 'View public reference';
                caseworkSourceLink.hidden = false;
            } else {
                caseworkSourceLink.removeAttribute('href');
                caseworkSourceLink.textContent = '';
                caseworkSourceLink.hidden = true;
            }
        }
        caseworkModal.classList.add('is-open');
        caseworkModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('casework-modal-open');
        caseworkModal.querySelector('.casework-modal-panel')?.scrollTo({ top: 0 });
        animateModalMetrics();
        caseworkModal.querySelector('.casework-modal-close')?.focus();
        return true;
    };

    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-case]');
        if (!trigger) return;
        event.preventDefault();
        openCaseworkModal(trigger.getAttribute('data-case'), trigger);
    });

    caseworkCloseButtons.forEach(button => button.addEventListener('click', closeCaseworkModal));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && caseworkModal?.classList.contains('is-open')) closeCaseworkModal();
    });

    // Casework reveal + tilt "magic"
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
            }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
            revealNodes.forEach((node) => revealObserver.observe(node));
            // Guarantee first paint on short viewports / content-visibility quirks
            requestAnimationFrame(() => {
                revealNodes.forEach((node) => {
                    const rect = node.getBoundingClientRect();
                    if (rect.top < window.innerHeight * 0.92) node.classList.add('is-visible');
                });
            });
        }
    }

    if (!prefersReducedMotion) {
        document.querySelectorAll('[data-casework-tilt]').forEach((card) => {
            card.addEventListener('pointermove', (event) => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;
                const rotateY = (x - 0.5) * 10;
                const rotateX = (0.5 - y) * 10;
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
