// PWA Controller: Service Worker Registration & Cross-Platform Install Prompt
(() => {
  'use strict';

  let deferredPrompt = null;
  let isPromptCaptured = false;

  // 1. Detect if running in standalone installed app mode
  const isStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
  };

  // 2. Register Service Worker with robust relative scope
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = './sw.js';
      navigator.serviceWorker.register(swUrl)
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
          // Check for SW updates
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New version available! Reloading for update.');
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err.message);
        });
    });
  }

  // 3. Immediately capture beforeinstallprompt at top-level
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent mini-infobar on Android
    e.preventDefault();
    deferredPrompt = e;
    isPromptCaptured = true;
    console.log('[PWA] beforeinstallprompt event captured');

    // Update UI if DOM is already ready
    updateInstallButtons(true);

    // Show mobile banner if mobile and not dismissed
    if (!sessionStorage.getItem('pwa_banner_dismissed') && window.innerWidth <= 820) {
      showMobileInstallBanner();
    }
  });

  // 4. Handle successful installation
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    isPromptCaptured = false;
    console.log('[PWA] App successfully installed on device!');

    updateInstallButtons(false);
    hideMobileInstallBanner();

    if (window.showToast) {
      window.showToast('R-Tech Pure Water installed successfully!', 'success');
    }
  });

  // 5. Update Visibility of Install Buttons across the page
  function updateInstallButtons(visible) {
    if (isStandalone()) {
      visible = false;
    }

    const headerBtn = document.getElementById('pwaInstallBtn');
    if (headerBtn) {
      headerBtn.classList.toggle('pwa-visible', visible);
      if (visible) headerBtn.onclick = triggerInstall;
    }

    const navMobileBtn = document.getElementById('pwaMobileNavInstall');
    if (navMobileBtn) {
      navMobileBtn.classList.toggle('pwa-visible', visible);
      if (visible) navMobileBtn.onclick = triggerInstall;
    }

    const floatBtn = document.getElementById('floatPwaInstall');
    if (floatBtn) {
      floatBtn.classList.toggle('pwa-visible', visible);
      if (visible) floatBtn.onclick = triggerInstall;
    }
  }

  // 6. Trigger Native or Guided Installation
  async function triggerInstall() {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        console.log('[PWA] Install prompt outcome:', choiceResult.outcome);
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] User accepted installation prompt');
        }
        deferredPrompt = null;
        updateInstallButtons(false);
        hideMobileInstallBanner();
      } catch (err) {
        console.warn('[PWA] Error launching install prompt:', err);
      }
    } else {
      // Fallback for iOS Safari or browsers where prompt was already dismissed
      showIosOrBrowserGuide();
    }
  }

  // 7. Mobile Install Banner UI
  function showMobileInstallBanner() {
    if (isStandalone() || document.getElementById('pwaMobileBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'pwaMobileBanner';
    banner.className = 'pwa-mobile-banner';
    banner.innerHTML = `
      <div class="pwa-banner-content">
        <img src="icons/icon-192.png" alt="R-Tech App Icon" class="pwa-banner-icon">
        <div class="pwa-banner-text">
          <strong>Install R-Tech RO App</strong>
          <span>Instant booking, offline receipts & direct technician calls</span>
        </div>
      </div>
      <div class="pwa-banner-actions">
        <button type="button" id="pwaBannerInstallBtn" class="btn-pwa-install">Install</button>
        <button type="button" id="pwaBannerCloseBtn" class="btn-pwa-close" aria-label="Close banner">&times;</button>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('pwaBannerInstallBtn')?.addEventListener('click', () => {
      triggerInstall();
    });

    document.getElementById('pwaBannerCloseBtn')?.addEventListener('click', () => {
      hideMobileInstallBanner();
      sessionStorage.setItem('pwa_banner_dismissed', 'true');
    });
  }

  function hideMobileInstallBanner() {
    const banner = document.getElementById('pwaMobileBanner');
    if (banner) {
      banner.classList.add('pwa-banner-hiding');
      setTimeout(() => banner.remove(), 320);
    }
  }

  // 8. Cross-Platform Install Guidance Dialog (iOS Safari & Desktop)
  function showIosOrBrowserGuide() {
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    
    // Remove any existing modal
    document.querySelectorAll('.pwa-ios-modal').forEach(m => m.remove());

    const modal = document.createElement('div');
    modal.className = 'pwa-ios-modal';
    
    if (isIos) {
      modal.innerHTML = `
        <div class="pwa-ios-backdrop"></div>
        <div class="pwa-ios-dialog">
          <div class="pwa-ios-header">
            <img src="icons/icon-192.png" alt="R-Tech App Icon" class="pwa-modal-icon">
            <div>
              <h3>Install R-Tech Pure Water</h3>
              <p>Add to your iPhone / iPad Home Screen</p>
            </div>
          </div>
          <ol class="pwa-ios-steps">
            <li>Tap the <strong>Share</strong> button <i class="ri-share-box-line modal-step-icon"></i> in Safari's bottom toolbar.</li>
            <li>Scroll down and tap <strong>Add to Home Screen</strong> <i class="ri-add-box-line modal-step-icon"></i>.</li>
            <li>Tap <strong>Add</strong> in the top-right corner to finish.</li>
          </ol>
          <button type="button" class="btn primary-btn pwa-modal-close-btn">Got It</button>
        </div>
      `;
    } else {
      modal.innerHTML = `
        <div class="pwa-ios-backdrop"></div>
        <div class="pwa-ios-dialog">
          <div class="pwa-ios-header">
            <img src="icons/icon-192.png" alt="R-Tech App Icon" class="pwa-modal-icon">
            <div>
              <h3>Install R-Tech RO App</h3>
              <p>Run standalone on Windows, Mac, or ChromeOS</p>
            </div>
          </div>
          <ol class="pwa-ios-steps">
            <li>Click the <strong>Install</strong> icon <i class="ri-download-cloud-2-line modal-step-icon"></i> in your browser address bar.</li>
            <li>Or click browser menu (<strong>⋮</strong> or <strong>⋯</strong>) &rarr; select <strong>"Install R-Tech Pure Water"</strong>.</li>
            <li>Launch directly from your desktop, taskbar, or start menu!</li>
          </ol>
          <button type="button" class="btn primary-btn pwa-modal-close-btn">Understood</button>
        </div>
      `;
    }

    modal.querySelector('.pwa-ios-backdrop').addEventListener('click', () => modal.remove());
    modal.querySelector('.pwa-modal-close-btn').addEventListener('click', () => modal.remove());
    document.body.appendChild(modal);
  }

  // 9. Initial DOM check
  function init() {
    if (isStandalone()) {
      console.log('[PWA] Running in standalone mode');
      updateInstallButtons(false);
      return;
    }

    // Always reveal buttons so users can install or view instructions
    // (If beforeinstallprompt fired, deferredPrompt will be used; else guided instructions open)
    updateInstallButtons(true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose global methods
  window.triggerPwaInstall = triggerInstall;
  window.isPwaStandalone = isStandalone;
})();
