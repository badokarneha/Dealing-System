/**
 * SaleFinder - Sale Details Dynamic Renderer & Interactive Engine
 */

// Sample Sales Database
const salesDatabase = [
    {
        id: '1',
        title: 'Super Tech Weekend: 45% Off Smart Laptops & Gadgets',
        category: 'Electronics',
        originalPrice: 1299,
        salePrice: 714,
        discountPercent: 45,
        rating: 4.8,
        reviewsCount: 128,
        status: 'Active Sale',
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 2 days 6 hours ahead
        couponCode: 'TECH45OFF',
        description: 'Upgrade your workstation with massive discounts on top-tier ultrabooks, mechanical keyboards, noise-canceling headphones, and wireless accessories. Valid in-store and online while stocks last.',
        images: [
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80'
        ],
        store: {
            name: 'Apex Digital Hub',
            verified: true,
            address: '442 Market Avenue, Downtown Tech Plaza, Suite 104',
            phone: '+1 (555) 234-8900',
            hours: 'Mon - Sat: 9:00 AM - 8:30 PM',
            locationUrl: 'https://maps.google.com'
        },
        highlights: [
            'Includes full 1-year official brand warranty',
            'Free instant delivery within city limits',
            'Exclusive 10% additional cashback on card payments',
            'Zero contact store pickup available'
        ],
        reviews: [
            {
                name: 'Sarah Jenkins',
                rating: 5,
                comment: 'Grabbed the ultrabook yesterday! The discount code worked instantly and the store staff was super helpful.'
            },
            {
                name: 'Michael Chang',
                rating: 5,
                comment: 'Best deal I have seen all month. Saved over $500 on my laptop setup.'
            },
            {
                name: 'David Miller',
                rating: 4,
                comment: 'Great sale, genuine products with warranty. Highly recommend checking out the store.'
            }
        ]
    }
];

let countdownInterval = null;
let currentSale = null;

/**
 * Initialize and render sale details
 */
document.addEventListener('DOMContentLoaded', () => {
    // Get sale ID from URL parameter (e.g. ?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const saleId = urlParams.get('id') || '1';

    // Find sale item or fallback to first
    currentSale = salesDatabase.find(s => s.id === saleId) || salesDatabase[0];

    renderSaleDetails(currentSale);
    initCountdown(currentSale.expiryDate);
    checkBookmarkState(currentSale.id);
});

/**
 * Render Sale Details into <main id="sale">
 * @param {Object} sale
 */
function renderSaleDetails(sale) {
    const container = document.getElementById('sale');
    if (!container) return;

    const savings = sale.originalPrice - sale.salePrice;

    container.innerHTML = `
        <div class="sale-layout-grid">
            <!-- Left Column: Media Gallery -->
            <div class="gallery-section">
                <div class="main-image-container">
                    <div class="badge-discount">
                        <i class="fa-solid fa-bolt"></i> ${sale.discountPercent}% OFF
                    </div>
                    <div class="badge-status">
                        <span class="status-dot"></span> ${sale.status}
                    </div>
                    <img id="main-sale-img" src="${sale.images[0]}" alt="${sale.title}">
                </div>

                <!-- Thumbnail Strip -->
                <div class="thumbnails-strip">
                    ${sale.images.map((img, idx) => `
                        <div class="thumb-item ${idx === 0 ? 'active' : ''}" onclick="switchGalleryImage('${img}', this)">
                            <img src="${img}" alt="Thumbnail ${idx + 1}">
                        </div>
                    `).join('')}
                </div>

                <!-- Live Countdown Timer -->
                <div class="timer-container">
                    <div class="timer-header">
                        <i class="fa-regular fa-clock"></i> Limited Time Offer Ends In
                    </div>
                    <div class="timer-grid">
                        <div class="time-box">
                            <div class="time-num" id="time-days">00</div>
                            <div class="time-label">Days</div>
                        </div>
                        <div class="time-box">
                            <div class="time-num" id="time-hours">00</div>
                            <div class="time-label">Hours</div>
                        </div>
                        <div class="time-box">
                            <div class="time-num" id="time-mins">00</div>
                            <div class="time-label">Mins</div>
                        </div>
                        <div class="time-box">
                            <div class="time-num" id="time-secs">00</div>
                            <div class="time-label">Secs</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Sale Details & Actions -->
            <div class="sale-info-section">
                <div class="glass-card">
                    <!-- Badges & Category -->
                    <div class="meta-badges">
                        <span class="category-tag"><i class="fa-solid fa-layer-group"></i> ${sale.category}</span>
                        <span class="rating-badge"><i class="fa-solid fa-star"></i> ${sale.rating} (${sale.reviewsCount} reviews)</span>
                    </div>

                    <!-- Title & Description -->
                    <h1 class="sale-title" style="margin-top: 1rem; margin-bottom: 0.8rem; text-align: left;">${sale.title}</h1>
                    <p class="sale-description">${sale.description}</p>

                    <!-- Price Box -->
                    <div class="price-container" style="margin: 1.5rem 0;">
                        <span class="sale-price">$${sale.salePrice}</span>
                        <span class="original-price">$${sale.originalPrice}</span>
                        <span class="savings-tag">Save $${savings}</span>
                    </div>

                    <!-- Coupon Code Card -->
                    <div class="coupon-box" style="margin-bottom: 1.5rem;">
                        <div class="coupon-details">
                            <span class="coupon-label">Exclusive Coupon Code</span>
                            <span class="coupon-code">${sale.couponCode}</span>
                        </div>
                        <button class="btn-copy-code" onclick="copyCouponCode('${sale.couponCode}')">
                            <i class="fa-regular fa-copy"></i> Copy Code
                        </button>
                    </div>

                    <!-- Action Buttons -->
                    <div class="action-buttons-group">
                        <button class="btn-claim" onclick="claimDeal()">
                            <i class="fa-solid fa-bag-shopping"></i> Claim Deal Now
                        </button>
                        <button class="btn-inquire" onclick="contactStore()">
                            <i class="fa-regular fa-comment-dots"></i> Inquire
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom Grid: Store Information & Offer Highlights -->
        <div class="details-bottom-grid">
            <!-- Store / Merchant Card -->
            <div class="glass-card">
                <div class="store-header">
                    <div class="store-avatar">
                        <i class="fa-solid fa-store"></i>
                    </div>
                    <div class="store-info-text">
                        <h3>
                            ${sale.store.name} 
                            ${sale.store.verified ? '<i class="fa-solid fa-circle-check verified-icon" title="Verified Merchant"></i>' : ''}
                        </h3>
                        <p>Official Retail Partner</p>
                    </div>
                </div>

                <div class="store-meta-list">
                    <div class="store-meta-item">
                        <i class="fa-solid fa-location-dot"></i>
                        <span>${sale.store.address}</span>
                    </div>
                    <div class="store-meta-item">
                        <i class="fa-regular fa-clock"></i>
                        <span>${sale.store.hours}</span>
                    </div>
                    <div class="store-meta-item">
                        <i class="fa-solid fa-phone"></i>
                        <span>${sale.store.phone}</span>
                    </div>
                </div>

                <div class="store-actions">
                    <a href="${sale.store.locationUrl}" target="_blank" class="btn-store-action">
                        <i class="fa-solid fa-diamond-turn-right"></i> Get Directions
                    </a>
                    <a href="tel:${sale.store.phone}" class="btn-store-action">
                        <i class="fa-solid fa-phone"></i> Call Store
                    </a>
                </div>
            </div>

            <!-- Offer Highlights Card -->
            <div class="glass-card">
                <h3 class="section-title">
                    <i class="fa-solid fa-circle-info" style="color: var(--brand-accent);"></i> Offer Terms & Highlights
                </h3>
                <ul class="highlights-list">
                    ${sale.highlights.map(item => `
                        <li><i class="fa-solid fa-check"></i> <span>${item}</span></li>
                    `).join('')}
                </ul>
            </div>
        </div>

        <!-- Customer Reviews Section -->
        <div class="reviews-section glass-card">
            <div class="reviews-header">
                <h3 class="section-title">
                    <i class="fa-solid fa-comments" style="color: var(--brand-accent);"></i> Verified Customer Reviews (${sale.reviews.length})
                </h3>
            </div>
            <div class="reviews-list">
                ${sale.reviews.map(r => `
                    <div class="review-card">
                        <div class="review-top">
                            <span class="reviewer-name">${r.name}</span>
                            <div class="review-stars">
                                ${Array(r.rating).fill('<i class="fa-solid fa-star"></i>').join('')}
                            </div>
                        </div>
                        <p class="review-text">${r.comment}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Switch the main preview image when a thumbnail is clicked
 * @param {string} src
 * @param {HTMLElement} element
 */
function switchGalleryImage(src, element) {
    const mainImg = document.getElementById('main-sale-img');
    if (mainImg) {
        mainImg.style.opacity = '0.4';
        setTimeout(() => {
            mainImg.src = src;
            mainImg.style.opacity = '1';
        }, 150);
    }

    const allThumbs = document.querySelectorAll('.thumb-item');
    allThumbs.forEach(thumb => thumb.classList.remove('active'));
    if (element) {
        element.classList.add('active');
    }
}

/**
 * Live Countdown Timer
 * @param {Date} expiryDate
 */
function initCountdown(expiryDate) {
    if (countdownInterval) clearInterval(countdownInterval);

    function update() {
        const now = new Date().getTime();
        const distance = new Date(expiryDate).getTime() - now;

        if (distance < 0) {
            clearInterval(countdownInterval);
            const daysEl = document.getElementById('time-days');
            if (daysEl) daysEl.innerText = '00';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const dEl = document.getElementById('time-days');
        const hEl = document.getElementById('time-hours');
        const mEl = document.getElementById('time-mins');
        const sEl = document.getElementById('time-secs');

        if (dEl) dEl.innerText = String(days).padStart(2, '0');
        if (hEl) hEl.innerText = String(hours).padStart(2, '0');
        if (mEl) mEl.innerText = String(minutes).padStart(2, '0');
        if (sEl) sEl.innerText = String(seconds).padStart(2, '0');
    }

    update();
    countdownInterval = setInterval(update, 1000);
}

/**
 * Copy Coupon Code to Clipboard
 * @param {string} code
 */
function copyCouponCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        showToast('Coupon Copied!', `Code "${code}" copied to clipboard. Apply at checkout!`, 'success');
    }).catch(() => {
        showToast('Coupon Ready', `Use code: ${code}`, 'info');
    });
}

/**
 * Claim Deal Action
 */
function claimDeal() {
    showToast('Deal Claimed!', `You have unlocked the ${currentSale.discountPercent}% discount. Present this code in-store or online.`, 'success');
}

/**
 * Contact Store Action
 */
function contactStore() {
    showToast('Connecting to Merchant', `Calling ${currentSale.store.name} at ${currentSale.store.phone}...`, 'info');
    window.location.href = `tel:${currentSale.store.phone}`;
}

/**
 * Toggle Bookmark / Wishlist State
 */
function toggleBookmark() {
    const btn = document.getElementById('btn-bookmark');
    const icon = document.getElementById('bookmark-icon');
    if (!btn || !icon || !currentSale) return;

    const savedKey = `bookmark_${currentSale.id}`;
    const isSaved = localStorage.getItem(savedKey) === 'true';

    if (isSaved) {
        localStorage.removeItem(savedKey);
        btn.classList.remove('active');
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        showToast('Removed from Saved', 'Sale removed from your saved list.', 'info');
    } else {
        localStorage.setItem(savedKey, 'true');
        btn.classList.add('active');
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        showToast('Sale Saved!', 'Sale added to your saved wishlist.', 'success');
    }
}

/**
 * Check initial bookmark state
 * @param {string} saleId
 */
function checkBookmarkState(saleId) {
    const btn = document.getElementById('btn-bookmark');
    const icon = document.getElementById('bookmark-icon');
    if (!btn || !icon) return;

    const isSaved = localStorage.getItem(`bookmark_${saleId}`) === 'true';
    if (isSaved) {
        btn.classList.add('active');
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
    }
}

/**
 * Share Sale Action
 */
function shareSale() {
    if (navigator.share) {
        navigator.share({
            title: currentSale ? currentSale.title : 'SaleFinder Deal',
            text: `Check out this hot deal on SaleFinder: ${currentSale ? currentSale.title : ''}`,
            url: window.location.href
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link Copied!', 'Deal link copied to your clipboard.', 'success');
    }
}

/**
 * Display toast notification
 * @param {string} title
 * @param {string} message
 * @param {'success'|'info'} type
 */
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = type === 'success' ? 'fa-circle-check' : 'fa-circle-info';

    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-desc">${message}</div>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s cubic-bezier(0.4, 0, 1, 1) forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}