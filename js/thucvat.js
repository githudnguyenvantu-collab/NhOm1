let cart = [];

function loadCart() {
    try {
        const saved = localStorage.getItem('kingofflower_cart');
        cart = saved ? JSON.parse(saved) : [];
        console.log('📦 Loaded cart:', cart.length, 'items');
    } catch (e) {
        console.error('❌ Error loading cart:', e);
        cart = [];
    }
}

loadCart();

function parsePrice(priceText) {
    return parseInt(priceText.replace(/[^\d]/g, '')) || 0;
}

function formatPrice(price) {
    return price.toLocaleString('vi-VN') + ' vnđ';
}

function showNotification(message) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#28a745;color:white;padding:15px 25px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:10000;transition:opacity 0.3s';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function saveCart() {
    localStorage.setItem('kingofflower_cart', JSON.stringify(cart));
    console.log('💾 Saved cart');
}

function addToCart(product) {
    const existing = cart.find(item => item.name === product.name);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    updateCartBadge();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartBadge() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    console.log('🔔 Updating cart badge to:', total);
    
    const badgeSelectors = [
        '.badge',
        '.cart-badge',
        '.cart-count',
        '[data-count]',
        'a[href*="giohang"] .badge',
        'a[href*="giohang"] span.badge'
    ];
    
    let badgeFound = false;
    badgeSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(badge => {
            const isInNav = badge.closest('nav, header, .main-nav, .nav-list, .header-actions');
            if (isInNav) {
                badge.textContent = total;
                badge.style.display = total > 0 ? 'inline-block' : 'none';
                badge.style.opacity = total > 0 ? '1' : '0';
                badgeFound = true;
                console.log('✅ Updated badge:', badge, 'to:', total);
            }
        });
    });
    
    const cartLinks = document.querySelectorAll('a[href*="giohang"]');
    cartLinks.forEach(link => {
        const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT, null);
        let node;
        while (node = walker.nextNode()) {
            const text = node.textContent.trim();
            if (/^\d+$/.test(text)) {
                console.log('🔍 Found number in cart link:', text, '→ Replacing with:', total || '');
                if (total > 0) {
                    node.textContent = total;
                } else {
                    node.textContent = '';
                }
                badgeFound = true;
            }
        }
        
        const badgeInLink = link.querySelector('.badge, [class*="badge"], [class*="count"]');
        if (badgeInLink) {
            badgeInLink.textContent = total;
            badgeInLink.style.display = total > 0 ? 'inline-block' : 'none';
            console.log('✅ Updated badge in link:', badgeInLink);
            badgeFound = true;
        }
    });
    
    if (!badgeFound) {
        document.querySelectorAll('nav span, header span, .nav-link span').forEach(span => {
            const text = span.textContent.trim();
            if (/^\d+$/.test(text) && parseInt(text) > 0) {
                const parent = span.closest('a');
                if (parent && parent.href.includes('giohang')) {
                    console.log('🔍 Found static number:', text, '→ Replacing with:', total);
                    span.textContent = total || '';
                    span.style.display = total > 0 ? 'inline-block' : 'none';
                }
            }
        });
    }
    
    console.log('🔔 Badge update complete. Total items:', total);
}

document.addEventListener('click', e => {
    const t = e.target;
    
    const addBtn = t.closest('.add-to-cart');
    if (addBtn) {
        e.preventDefault();
        const card = addBtn.closest('.product-card, .mini-product');
        const name = card.querySelector('h3, h4')?.textContent.trim();
        const priceText = card.querySelector('.price')?.textContent.trim();
        const image = card.querySelector('img')?.src || 'img/default.png';
        const price = parsePrice(priceText);
        
        if (!name || !price) {
            showNotification('Lỗi: Không thể thêm sản phẩm');
            return;
        }
        
        addToCart({ name, price, image });
        
        const orig = addBtn.textContent.trim();
        addBtn.textContent = '✓ Đã thêm';
        addBtn.style.backgroundColor = '#28a745';
        setTimeout(() => {
            addBtn.textContent = orig;
            addBtn.style.backgroundColor = '';
        }, 2000);
        
        showNotification(`Đã thêm "${name}"`);
        return;
    }
    
    if (t.matches('.btn-learn-more')) {
        document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
        showNotification('Đến giới thiệu...');
        return;
    }
    
    if (t.matches('.btn-view-more')) {
        document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' });
        showNotification('Xem sản phẩm!');
        return;
    }
});

document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href && href !== '#') {
            e.preventDefault();
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.product-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    obs.observe(el);
});

function init() {
    console.log('🌸 King of Flower - Plants Page');
    loadCart();
    updateCartBadge();
    
    setTimeout(() => {
        updateCartBadge();
        console.log('🔄 Force badge update completed');
    }, 200);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

window.addEventListener('storage', e => {
    if (e.key === 'kingofflower_cart') {
        loadCart();
        updateCartBadge();
    }
});

window.addEventListener('focus', () => {
    loadCart();
    updateCartBadge();
});