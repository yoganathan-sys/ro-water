(() => {
    const rawPath = location.pathname.split('/').pop() || 'index.html';
    const page = rawPath.endsWith('.html') ? rawPath : (rawPath + '.html');
    const active = (n) => (page === n || page === n.replace('.html', '')) ? ' aria-current="page" class="active"' : '';

    const OWNER_PHONE_RAW = '8056639518';
    const OWNER_PHONE_DISPLAY = '+91 80566 39518';
    const OWNER_PHONE_TEL = '+918056639518';
    const WHATSAPP_URL = 'https://wa.me/918056639518?text=' + encodeURIComponent('Hello R-Tech Pure Water! I would like to inquire about your RO water purifier services.');

    // Top Navigation Header: 3-Column Balanced Architecture (Left: Logo, Center: Nav Island, Right: CTAs)
    const header = `
    <header class="header">
        <div class="nav-container">
            <!-- 1. LEFT: Brand Identity -->
            <a href="index.html" class="logo" title="R-Tech Pure Water Home">
                <span class="logo-icon">
                    <i class="ri-drop-fill"></i>
                </span>
                <span class="logo-text">R-Tech Pure <span>Water</span></span>
            </a>

            <!-- 2. CENTER: Navigation Links Floating Island -->
            <nav class="navbar" id="navbar" aria-label="Main Navigation">
                <div class="nav-pill-group">
                    <a href="index.html"${active('index.html')}><span>Home</span></a>
                    <a href="about.html"${active('about.html')}><span>About</span></a>
                    <a href="services.html"${active('services.html')}><span>Services</span></a>
                    <a href="products.html"${active('products.html')}><span>Products</span></a>
                    <a href="contact.html"${active('contact.html')}><span>Contact</span></a>
                    <a href="owner-details.html"${active('owner-details.html')}><span>Owner Details</span></a>
                </div>
                <!-- Mobile Drawer Action Buttons (Visible only on mobile drawer) -->
                <div class="nav-drawer-actions">
                    <a href="booking.html" class="nav-btn nav-btn-mobile"${active('booking.html')}>
                        <i class="ri-calendar-check-line"></i> Book Service
                    </a>
                    <a href="tel:${OWNER_PHONE_TEL}" class="nav-phone-mobile">
                        <i class="ri-phone-fill"></i> Call: ${OWNER_PHONE_DISPLAY}
                    </a>
                </div>
            </nav>

            <!-- 3. RIGHT: Call-To-Action Cluster -->
            <div class="nav-actions">
                <a href="booking.html" class="nav-btn nav-btn-desktop"${active('booking.html')}>
                    <i class="ri-calendar-check-line"></i>
                    <span>Book Service</span>
                </a>
                <a href="tel:${OWNER_PHONE_TEL}" class="nav-phone-link" title="Call Owner Directly (${OWNER_PHONE_DISPLAY})">
                    <i class="ri-phone-fill"></i>
                    <span class="phone-text-desktop">${OWNER_PHONE_DISPLAY}</span>
                    <span class="phone-text-compact">Call Us</span>
                </a>
                <button class="menu-btn" id="menuBtn" type="button" aria-label="Toggle navigation menu" aria-expanded="false">
                    <i class="ri-menu-line"></i>
                </button>
            </div>
        </div>
    </header>`;

    // Footer with verified owner phone 8056639518 (Clean Floating Card Architecture)
    const footer = `
    <footer class="footer-section">
        <div class="container footer-card-wrapper">
            <div class="footer-card">
                <!-- Top Row: Brand & Columns -->
                <div class="footer-card-grid">
                    <!-- Brand Bio & Contact Icon Pills (Inspired by Reference) -->
                    <div class="footer-card-brand">
                        <a href="index.html" class="logo footer-logo" title="R-Tech Pure Water">
                            <span class="logo-icon"><i class="ri-drop-fill"></i></span>
                            R-Tech Pure <span>Water</span>
                        </a>
                        <p class="footer-tagline">
                            Providing certified RO water purification, genuine filter replacements, precision TDS testing, and express maintenance solutions across Tirupathur.
                        </p>
                        <!-- Sleek Contact Icon Row -->
                        <div class="footer-social-row">
                            <a href="tel:${OWNER_PHONE_TEL}" class="social-icon-btn" title="Call Owner Directly: ${OWNER_PHONE_DISPLAY}" aria-label="Direct Phone Call">
                                <i class="ri-phone-fill"></i>
                            </a>
                            <a href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer" class="social-icon-btn social-icon-wa" title="WhatsApp Support (+91 ${OWNER_PHONE_RAW})" aria-label="WhatsApp Support">
                                <i class="ri-whatsapp-fill"></i>
                            </a>
                            <a href="mailto:thavasikutti89@gmail.com" class="social-icon-btn" title="Email: thavasikutti89@gmail.com" aria-label="Email Us">
                                <i class="ri-mail-fill"></i>
                            </a>
                            <a href="https://maps.app.goo.gl/uCsNtSsbRwa6mUzb9?g_st=aw" target="_blank" rel="noopener noreferrer" class="social-icon-btn" title="Store Location: Bus Stop Chinnakadai, Tirupathur" aria-label="Google Maps Location">
                                <i class="ri-map-pin-2-fill"></i>
                            </a>
                        </div>
                    </div>

                    <!-- Col 1: Quick Links -->
                    <div class="footer-nav-col">
                        <h4 class="footer-col-title">Quick Links</h4>
                        <ul class="footer-col-links">
                            <li><a href="index.html">Home</a></li>
                            <li><a href="about.html">About Us</a></li>
                            <li><a href="services.html">Services</a></li>
                            <li><a href="products.html">Purifier Products</a></li>
                            <li><a href="owner-details.html">Owner Profile</a></li>
                        </ul>
                    </div>

                    <!-- Col 2: Services -->
                    <div class="footer-nav-col">
                        <h4 class="footer-col-title">Our Services</h4>
                        <ul class="footer-col-links">
                            <li><a href="booking.html?service=RO%20Installation">RO Installation</a></li>
                            <li><a href="booking.html?service=RO%20Repair">RO Repair & Fix</a></li>
                            <li><a href="booking.html?service=Filter%20Replacement">Filter Replacement</a></li>
                            <li><a href="booking.html?service=Annual%20Maintenance">Annual Maintenance</a></li>
                            <li><a href="booking.html?service=Commercial%20RO">Commercial RO</a></li>
                        </ul>
                    </div>

                    <!-- Col 3: Support -->
                    <div class="footer-nav-col">
                        <h4 class="footer-col-title">Support</h4>
                        <ul class="footer-col-links">
                            <li><a href="tel:${OWNER_PHONE_TEL}">+91 ${OWNER_PHONE_RAW}</a></li>
                            <li><a href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer">WhatsApp Support</a></li>
                            <li><a href="booking.html">Book Service</a></li>
                            <li><a href="https://maps.app.goo.gl/uCsNtSsbRwa6mUzb9?g_st=aw" target="_blank" rel="noopener noreferrer">Tirupathur Center</a></li>
                            <li><a href="contact.html">Contact Us</a></li>
                        </ul>
                    </div>
                </div>

                <!-- Divider -->
                <div class="footer-divider"></div>

                <!-- Bottom Row inside the Card -->
                <div class="footer-card-bottom">
                    <p class="footer-copyright">
                        © ${new Date().getFullYear()} R-Tech Pure Water. All Rights Reserved. Created by Yoganathan_A
                    </p>
                    <div class="footer-bottom-links">
                        <a href="admin/login.html" class="footer-owner-link">
                            <i class="ri-lock-line"></i> Owner Login
                        </a>
                    </div>
                </div>
            </div>

            <!-- Large Background Watermark (as in Reference) -->
            <div class="footer-watermark" aria-hidden="true">R-TECH PURE WATER</div>
        </div>
    </footer>`;

    // Floating Interactive Quick Contact Bar (WhatsApp, Direct Call & PWA Install)
    const floatingBar = `
    <aside class="floating-contact-bar" aria-label="Instant Contact Options">
        <button id="floatPwaInstall" class="float-btn float-install" type="button" title="Install R-Tech RO App" aria-label="Install App">
            <i class="ri-download-cloud-2-line"></i>
            <span class="float-tooltip">Install App</span>
        </button>
        <a href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer" class="float-btn float-whatsapp" title="Chat on WhatsApp (+91 80566 39518)" aria-label="Chat on WhatsApp">
            <i class="ri-whatsapp-line"></i>
            <span class="float-tooltip">Chat with us</span>
        </a>
        <a href="tel:${OWNER_PHONE_TEL}" class="float-btn float-call" title="Call Owner Directly (+91 80566 39518)" aria-label="Direct Phone Call">
            <i class="ri-phone-line"></i>
            <span class="float-tooltip">Call: ${OWNER_PHONE_RAW}</span>
        </a>
    </aside>`;

    // Inject into document
    document.getElementById('site-header')?.insertAdjacentHTML('afterbegin', header);
    document.getElementById('site-footer')?.insertAdjacentHTML('afterbegin', footer);
    document.body?.insertAdjacentHTML('beforeend', floatingBar);

    // Mobile Hamburger Menu Toggle with Outside Click & Link Click Handlers
    const menuBtn = document.getElementById('menuBtn');
    const navbar = document.getElementById('navbar');
    if (menuBtn && navbar) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navbar.classList.toggle('active');
            menuBtn.classList.toggle('is-active', isOpen);
            menuBtn.setAttribute('aria-expanded', isOpen);
            const icon = menuBtn.querySelector('i');
            if (icon) {
                icon.className = isOpen ? 'ri-close-line' : 'ri-menu-line';
            }
        });

        // Close on clicking links inside navbar
        navbar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('active');
                menuBtn.classList.remove('is-active');
                menuBtn.setAttribute('aria-expanded', 'false');
                const icon = menuBtn.querySelector('i');
                if (icon) icon.className = 'ri-menu-line';
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (navbar.classList.contains('active') && !navbar.contains(e.target) && !menuBtn.contains(e.target)) {
                navbar.classList.remove('active');
                menuBtn.classList.remove('is-active');
                menuBtn.setAttribute('aria-expanded', 'false');
                const icon = menuBtn.querySelector('i');
                if (icon) icon.className = 'ri-menu-line';
            }
        });
    }

    // Dynamic Sticky Header Scroll Effects
    const headerEl = document.querySelector('.header');
    if (headerEl) {
        const handleScroll = () => {
            if (window.scrollY > 15) {
                headerEl.classList.add('header-scrolled');
            } else {
                headerEl.classList.remove('header-scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

    // Auto-bootstrap PWA controller if not already present on page
    if (!window.triggerPwaInstall && !document.querySelector('script[src*="pwa.js"]')) {
        const pwaScript = document.createElement('script');
        pwaScript.src = 'js/pwa.js';
        pwaScript.defer = true;
        document.body.appendChild(pwaScript);
    }
})();
