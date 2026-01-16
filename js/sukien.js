/**
 * KING OF FLOWER - EVENT PAGE OPTIMIZED
 */

// ==================== CONFIG ====================
const CONFIG = {
    CART_KEY: 'kingofflower_cart',
    TOAST_DURATION: 3000
};

let cart = [];

// ==================== UTILITIES ====================
const parsePrice = text => parseInt(text.replace(/[^\d]/g, '')) || 0;
const formatPrice = price => price.toLocaleString('vi-VN') + ' đ';

const showNotification = msg => {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#28a745;color:white;padding:15px 25px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:10000;transition:opacity 0.3s';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
};

// ==================== CART ====================
function loadCart() {
    try {
        cart = JSON.parse(localStorage.getItem(CONFIG.CART_KEY)) || [];
    } catch { cart = []; }
}

function saveCart() {
    localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(cart));
}

function addToCart(product) {
    const existing = cart.find(i => i.name === product.name);
    existing ? existing.quantity++ : cart.push({ ...product, quantity: 1 });
    saveCart();
    updateCartBadge();
}

function updateCartBadge() {
    const total = cart.reduce((s, i) => s + i.quantity, 0);
    
    ['.cart-badge', '.cart-count', '.badge', 'a[href*="giohang"] span'].forEach(sel => {
        document.querySelectorAll(sel).forEach(b => {
            if (b.closest('nav, header')) {
                b.textContent = total || '';
                b.style.display = total > 0 ? 'inline-block' : 'none';
            }
        });
    });
    
    document.querySelectorAll('a[href*="giohang"]').forEach(link => {
        link.querySelectorAll('span').forEach(span => {
            if (/^\d+$/.test(span.textContent.trim())) {
                span.textContent = total || '';
                span.style.display = total > 0 ? 'inline-block' : 'none';
            }
        });
    });
}

// ==================== EVENT DELEGATION ====================
document.addEventListener('click', e => {
    const t = e.target;
    
    // Add to cart
    const addBtn = t.closest('.add-to-cart');
    if (addBtn) {
        e.preventDefault();
        const card = addBtn.closest('.product-card, .mini-product');
        const name = card.querySelector('h3, h4')?.textContent.trim();
        const price = parsePrice(card.querySelector('.price')?.textContent || '0');
        const image = card.querySelector('img')?.src || 'img/default.png';
        
        if (!name || !price) return showNotification('Lỗi sản phẩm');
        
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
    
    // Workshop register
    if (t.closest('.nut-dang-ky')) {
        const name = t.closest('.nut-dang-ky').dataset.ten || 'Workshop';
        if (!t.closest('.nut-dang-ky').hasAttribute('data-bs-toggle') && confirm(`Đăng ký "${name}"?`)) {
            showNotification(`Đã đăng ký "${name}"`);
        }
        return;
    }
    
    // Service card
    const serviceCard = t.closest('.the-dich-vu');
    if (serviceCard && !t.closest('button')) {
        const name = serviceCard.querySelector('h3')?.textContent;
        const desc = serviceCard.querySelector('p')?.textContent;
        if (name) showNotification(`${name}: ${desc}`);
        return;
    }
});

// ==================== SCROLL ANIMATIONS ====================
const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.the-dich-vu').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s, transform 0.6s';
    obs.observe(el);
});

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href && href !== '#') {
            e.preventDefault();
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ==================== INIT ====================
function init() {
    console.log('🌸 King of Flower - Event Page');
    loadCart();
    updateCartBadge();
    
    document.querySelectorAll('.the-dich-vu').forEach(el => {
        el.style.cursor = 'pointer';
        el.style.transition = 'all 0.3s';
    });
    
    setTimeout(() => {
        document.querySelectorAll('nav *, header *').forEach(el => {
            if (el.children.length === 0 && /^\d+$/.test(el.textContent.trim())) {
                const link = el.closest('a');
                if (link?.href.includes('giohang')) {
                    el.textContent = '';
                    el.style.display = 'none';
                }
            }
        });
        updateCartBadge();
    }, 200);
}

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();

window.addEventListener('storage', e => {
    if (e.key === CONFIG.CART_KEY) {
        loadCart();
        updateCartBadge();
    }
});

window.addEventListener('focus', () => {
    loadCart();
    updateCartBadge();
});