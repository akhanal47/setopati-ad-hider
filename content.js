console.log("Script Injection Started for Setopati");

function hideAds() {
    // --- Hide links to external domains ---
    const allLinks = document.querySelectorAll('a[href]');
    const internalHostnames = ['www.setopati.com', 'setopati.com', 'en.setopati.com'];

    allLinks.forEach(link => {
        try {
            const url = new URL(link.href, document.baseURI);

            if ((url.protocol === 'http:' || url.protocol === 'https:') &&
                !internalHostnames.includes(url.hostname)) {
                let adElement = null;
                let reasonForHiding = "No specific reason (should not hide)";

                // Check 1: Common ad container classes
                const commonAdContainer = link.closest(`
                    .main-bigyaapan,
                    .full-bigyaapan,
                    .top-bigyaapan,
                    .items.bigyaapan-item,
                    .footer-fixed-bigyaapan,
                    div[class*="bigyaapan"]
                `);

                if (commonAdContainer) {
                    adElement = commonAdContainer;
                    reasonForHiding = "Common ad container class matched";
                }

                // Check 2: Specific scenarios if not caught by common classes
                if (!adElement && link.parentElement) {
                    if (link.parentElement.classList.contains('col-md-12') &&
                        link.parentElement.children.length === 1 &&
                        link.parentElement.children[0] === link) {
                        const isPartOfHeader = link.closest('header#header, .new-header, .main-menu, .footer');

                        if (!isPartOfHeader) {
                             adElement = link.parentElement;
                             reasonForHiding = "col-md-12 with single link, not in header/nav/footer";
                        }
                    }
                    // Scenario 2: Links directly inside known top-level ad wrappers.
                    else if (link.closest('.mast-head-ad')) {
                        const specificAdWrapper = link.closest('.mast-head-ad .top-main-ads');
                        if (specificAdWrapper && !specificAdWrapper.querySelector('header#header')) { // Ensure this ad wrapper doesn't also contain the main header
                            adElement = specificAdWrapper;
                            reasonForHiding = "Link inside .mast-head-ad .top-main-ads structure";
                        } else {
                            const individualAdBlock = link.closest('.mast-head-ad .main-bigyaapan');
                            if (individualAdBlock) {
                                adElement = individualAdBlock;
                                reasonForHiding = "Link inside .mast-head-ad .main-bigyaapan block";
                            }
                        }
                        if (adElement && adElement.contains(document.getElementById('header'))) {
                           adElement = null; // Prevent hiding
                           reasonForHiding = "Prevented hiding main header wrapper";
                        }
                    }
                }

                // Check 3: Fallback for image ads if no specific container found, AND NOT in header/nav/footer/social
                if (!adElement && link.closest('body')) {
                    const isPartOfEssentialUI = link.closest('header#header, .new-header, .main-menu, .footer, .social-links');

                    if (!isPartOfEssentialUI) {
                        const imgChild = link.querySelector('img[data-src*="bigyaapan"], img[src*="bigyaapan"], img[alt*="bank"], img[alt*="Ncell"], img[alt*="Premier"]');
                        if (imgChild && link.parentElement && link.parentElement.style.display !== 'none') {
                            adElement = link.parentElement; // Potentially risky, hides immediate parent
                            reasonForHiding = "Fallback image ad, not in essential UI, hiding parent";
                        }
                    } else {
                         console.log(`DEBUG: Fallback check for ${link.href} IS part of essential UI. SKIPPING HIDE.`);
                    }
                }


                if (adElement) {
                    if (adElement.style.display !== 'none') {
                        adElement.style.display = 'none';
                    }
                } else {
                    const isPartOfHeaderForNonAd = link.closest('header#header, .new-header, .main-menu, .footer, .social-links');
                }
            }
        } catch (e) {
            console.error(`Setopati Ad Hider: Error processing link ${link ? link.href : 'unknown'}:`, e);
        }
    });

    // --- Hide "giant banner" ads ---
    const obstructiveSelectors = [
        '.sticky-footer-bigyaapan',
        '.modalbox',
        '.cube-box',
        '.cube-bigyaapan',
        '.right-column-bichar .items.bigyaapan-item',
        '.top-full.col-md-12 .desktop-bigyaapan-only',
        '.top-full.col-md-12 .mobile-bigyaapan-only',
        'section.desktop-bigyaapan-only > .container > .row > .full-bigyaapan.col-md-12',
        'section.mobile-bigyaapan-only > .container > .row > .full-bigyaapan.col-md-12'
    ];

    obstructiveSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            if (el.style.display !== 'none') {
                el.style.display = 'none';
            }
        });
    });
}



if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideAds);
} else {
    hideAds(); 
}
window.addEventListener('load', hideAds);

// Observe DOM changes for dynamically loaded ads
const observer = new MutationObserver((mutationsList) => {
    let relevantChange = false;
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            relevantChange = true;
            break;
        }
        if (mutation.type === 'attributes' && (mutation.attributeName === 'href' || mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
            relevantChange = true;
            break;
        }
    }
    if (relevantChange) {
        hideAds();
    }
});

// See the document body for added nodes and attribute changes
observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
});