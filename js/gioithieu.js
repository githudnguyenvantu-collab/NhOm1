const CONFIG = {
    CART_KEY: 'kingofflower_cart',
    TOAST_DURATION: 3000
};
let cart = [];
const parsePrice = text => parseInt(text.replace(/[^\d]/g, '')) || 0;
const formatPrice = price => price.toLocaleString('vi-VN') + ' vnđ';

const showNotification = message => {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#28a745;color:white;padding:15px 25px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:10000;transition:opacity 0.3s';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
};

function loadCart() {
    try {
        const saved = localStorage.getItem(CONFIG.CART_KEY);
        cart = saved ? JSON.parse(saved) : [];
        console.log('📦 Cart loaded:', cart.length, 'items');
    } catch (e) {
        console.error('Cart load error:', e);
        cart = [];
    }
}

function updateCartBadge() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    console.log('🔔 Updating badge:', total);
    ['.cart-badge', '.cart-count', '.badge', 'a[href*="giohang"] span'].forEach(sel => {
        document.querySelectorAll(sel).forEach(badge => {
            if (badge.closest('nav, header, .main-nav')) {
                badge.textContent = total || '';
                badge.style.display = total > 0 ? 'inline-block' : 'none';
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
    document.querySelectorAll('nav span, header span').forEach(el => {
        if (/^\d+$/.test(el.textContent.trim())) {
            const link = el.closest('a');
            if (link?.href.includes('giohang')) {
                el.textContent = total || '';
                el.style.display = total > 0 ? 'inline-block' : 'none';
            }
        }
    });
}

document.addEventListener('click', e => {
    const t = e.target;
    
    const addBtn = t.closest('.add-to-cart');
    if (addBtn) {
        e.preventDefault();
        const card = addBtn.closest('.product-card, .mini-product');
        const name = card.querySelector('h3, h4')?.textContent.trim();
        const price = parsePrice(card.querySelector('.price')?.textContent || '0');
        const image = card.querySelector('img')?.src || 'img/default.png';
        
        if (!name || !price) {
            showNotification('Lỗi: Không thể thêm sản phẩm');
            return;
        }
        
        const existing = cart.find(item => item.name === name);
        existing ? existing.quantity++ : cart.push({ name, price, image, quantity: 1 });
        localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(cart));
        updateCartBadge();
        
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
});

const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.moment-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    obs.observe(el);
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

function init() {
    console.log('🌸 King of Flower - About Page');
    loadCart();
    updateCartBadge();
    
    setTimeout(() => {
        console.log('🔄 Cleaning static numbers...');
        document.querySelectorAll('nav *, header *').forEach(el => {
            if (el.children.length === 0 && /^\d+$/.test(el.textContent.trim())) {
                const link = el.closest('a');
                if (link?.href.includes('giohang')) {
                    console.log('🗑️ Removed static:', el.textContent);
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