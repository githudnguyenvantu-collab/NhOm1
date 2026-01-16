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
    return price.toLocaleString('vi-VN') + ' đ';
}
function showNotification(message) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#28a745;color:white;padding:15px 25px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:10000;transition:opacity 0.3s;animation:slideIn 0.3s ease';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
function saveCart() {
    localStorage.setItem('kingofflower_cart', JSON.stringify(cart));
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
            }
        });
    });
    const cartLinks = document.querySelectorAll('a[href*="giohang"]');
    cartLinks.forEach(link => {
        const walker = document.createTreeWalker(
            link,
            NodeFilter.SHOW_TEXT,
            null
        );
        let node;
        while (node = walker.nextNode()) {
            const text = node.textContent.trim();
            if (/^\d+$/.test(text)) {
                node.textContent = total > 0 ? total : '';
                badgeFound = true;
            }
        }
        const badgeInLink = link.querySelector('.badge, [class*="badge"], [class*="count"]');
        if (badgeInLink) {
            badgeInLink.textContent = total;
            badgeInLink.style.display = total > 0 ? 'inline-block' : 'none';
            badgeFound = true;
        }
    });
    if (!badgeFound) {
        document.querySelectorAll('nav span, header span, .nav-link span').forEach(span => {
            const text = span.textContent.trim();
            if (/^\d+$/.test(text)) {
                const parent = span.closest('a');
                if (parent && parent.href.includes('giohang')) {
                    span.textContent = total > 0 ? total : '';
                    span.style.display = total > 0 ? 'inline-block' : 'none';
                }
            }
        });
    }
}
document.addEventListener('click', e => {
    const t = e.target;
    const addBtn = t.closest('.add-to-cart');
    if (addBtn) {
        e.preventDefault();
        const card = addBtn.closest('.product-card');
        const name = card.querySelector('h3')?.textContent.trim();
        const priceText = card.querySelector('.price')?.textContent.trim();
        const image = card.querySelector('img')?.src || 'img/default.png';
        const price = parsePrice(priceText);
        if (!name || !price) {
            return showNotification('Lỗi: Không thể thêm sản phẩm');
        }
        addToCart({ name, price, image });
        const orig = addBtn.textContent.trim();
        addBtn.textContent = '✓ Đã thêm';
        addBtn.style.backgroundColor = '#28a745';
        setTimeout(() => {
            addBtn.textContent = orig;
            addBtn.style.backgroundColor = '';
        }, 2000);
        
        showNotification(`Đã thêm "${name}" vào giỏ hàng`);
        return;
    }
    const copyBtn = t.closest('.copy-btn');
    if (copyBtn) {
        e.preventDefault();
        const code = copyBtn.previousElementSibling?.textContent || '';
        navigator.clipboard.writeText(code).then(() => {
            showNotification(`Đã sao chép mã: ${code}`);
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyBtn.style.backgroundColor = '#28a745';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="far fa-copy"></i>';
                copyBtn.style.backgroundColor = '';
            }, 2000);
        }).catch(() => showNotification('Không thể sao chép. Vui lòng thử lại!'));
        return;
    }
    if (t.matches('.btn.btn-primary.rounded-pill')) {
        const card = t.closest('.d-flex.bg-white');
        if (card) {
            const name = card.querySelector('h3')?.textContent || '';
            const priceText = card.querySelector('.fs-4.text-danger')?.textContent || '';
            const price = parsePrice(priceText);
            const image = card.querySelector('img')?.src || 'img/default.png';
            if (name && price) {
                addToCart({ name, price, image });
            }
            showNotification(`Đã thêm "${name}" (${priceText}) vào giỏ hàng!`);
            t.textContent = '✓ Đã thêm';
            t.style.backgroundColor = '#28a745';
            setTimeout(() => {
                t.textContent = 'Đặt Combo Ngay';
                t.style.backgroundColor = '';
            }, 2000);
        }
        return;
    }
    if (t.matches('.btn-warning')) {
        const flashSale = document.querySelector('.py-5.bg-white');
        if (flashSale) {
            flashSale.scrollIntoView({ behavior: 'smooth', block: 'start' });
            showNotification('Xem ngay Flash Sale hot nhất!');
        }
        return;
    }
});
document.addEventListener('mouseenter', e => {
    const card = e.target.closest('.product-card, .voucher-ticket');
    if (card) {
        card.style.transform = 'translateY(-5px)';
        card.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
    }
}, true);
document.addEventListener('mouseleave', e => {
    const card = e.target.closest('.product-card, .voucher-ticket');
    if (card) {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '';
    }
}, true);
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href && href !== '#') {
            e.preventDefault();
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
const fadeObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });
document.querySelectorAll('.product-card, .voucher-ticket').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    fadeObs.observe(el);
});
document.querySelectorAll('.progress-bar').forEach(bar => {
    const targetWidth = bar.style.width;
    bar.style.width = '0%';
    const barObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                setTimeout(() => {
                    bar.style.transition = 'width 1.5s ease';
                    bar.style.width = targetWidth;
                }, 200);
                barObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.5 });
    
    barObs.observe(bar);
});
function initStyles() {
    const styleMap = {
        '.product-card, .voucher-ticket': 'transition: transform 0.3s ease, box-shadow 0.3s ease'
    };
    Object.entries(styleMap).forEach(([selector, styles]) => {
        document.querySelectorAll(selector).forEach(el => {
            el.style.cssText += styles;
        });
    });
}
function startCountdown() {
    const el = document.querySelector('.fs-5.fw-bold.text-white');
    if (!el) return;
    let sec = 2 * 3600 + 15 * 60 + 40;
    const timer = setInterval(() => {
        if (sec <= 0) {
            el.textContent = 'Flash Sale đã kết thúc!';
            clearInterval(timer);
            return;
        }
        sec--;
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        el.textContent = `Kết thúc trong: ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, 1000);
}
function init() {
    console.log('🌸 King of Flower - Trang Ưu Đãi');
    loadCart();
    updateCartBadge();
    initStyles();
    startCountdown();
    setTimeout(() => updateCartBadge(), 200);
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
console.log('✅ uudai.js - Sẵn sàng!');