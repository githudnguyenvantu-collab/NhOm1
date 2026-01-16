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
    updateCartUI();
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
        const walker = document.createTreeWalker(
            link,
            NodeFilter.SHOW_TEXT,
            null
        );
        let node;
        while (node = walker.nextNode()) {
            const text = node.textContent.trim();
            if (/^\d+$/.test(text)) {
                console.log('🔍 Found number in cart link:', text, '→ Replacing with:', total || '');
                if (total > 0) {
                    node.textContent = total;
                } else {
                    node.textContent = '';
                badgeFound = true;
            }
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
function updateCartUI() {
    const container = document.querySelector('.cart-items');
    if (!container) {
        updateCartBadge();
        return;
    }
    container.innerHTML = '';
    if (cart.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#999"><i class="fas fa-shopping-cart" style="font-size:64px;margin-bottom:20px"></i><p style="font-size:18px">Giỏ hàng trống</p></div>';
        updateCartCount();
        updateCartTotal();
        updateCartBadge();
        return;
    }
    cart.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="item-image" onerror="this.src='img/default.png'">
            <div class="item-info">
                <h3>${item.name}</h3>
                <p class="item-price">${formatPrice(item.price)}</p>
                <p class="item-status"><i class="fa-solid fa-check-circle"></i> Còn hàng</p>
            </div>
            <div class="item-actions">
                <div class="quantity-control">
                    <button class="qty-btn qty-minus" data-index="${index}">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn qty-plus" data-index="${index}">+</button>
                </div>
                <button class="btn-delete" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        container.appendChild(div);
    });
    
    updateCartCount();
    updateCartTotal();
    updateCartBadge();
}
function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    const el = document.querySelector('.cart-header p strong');
    if (el) {
        if (total === 0) {
            document.querySelector('.cart-header p').innerHTML = '<strong>Giỏ hàng trống</strong>';
        } else {
            el.textContent = `${total} sản phẩm`;
        }
    }
}
function updateCartTotal() {
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 30000;
    const discount = 50000;
    const total = subtotal + shipping - discount;
    const sub = document.querySelector('.summary-row:nth-child(1) span:last-child');
    if (sub) sub.textContent = formatPrice(subtotal);
    const ship = document.querySelector('.summary-row:nth-child(2) span:last-child');
    if (ship) ship.textContent = formatPrice(shipping);
    const disc = document.querySelector('.summary-row.discount span:last-child');
    if (disc) disc.textContent = '-' + formatPrice(discount);
    const tot = document.querySelector('.summary-total span:last-child');
    if (tot) tot.textContent = formatPrice(total);
}
function filterProductsByPrice(minPrice, maxPrice) {
    const products = document.querySelectorAll('.product-card, .mini-product');
    let visibleCount = 0;
    products.forEach(product => {
        const priceEl = product.querySelector('.price');
        if (!priceEl) return;
        const price = parsePrice(priceEl.textContent);
        if (price >= minPrice && (maxPrice === Infinity || price <= maxPrice)) {
            product.style.display = '';
            visibleCount++;
        } else {
            product.style.display = 'none';
        }
    });
    showNotification(`Tìm thấy ${visibleCount} sản phẩm`);
}
function showAllProducts() {
    document.querySelectorAll('.product-card, .mini-product').forEach(p => p.style.display = '');
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
    if (t.classList.contains('qty-plus')) {
        const idx = parseInt(t.dataset.index);
        if (cart[idx] && cart[idx].quantity < 99) {
            cart[idx].quantity++;
            saveCart();
            updateCartUI();
            showNotification('Đã tăng số lượng');
        }
        return;
    }
    if (t.classList.contains('qty-minus')) {
        const idx = parseInt(t.dataset.index);
        if (cart[idx] && cart[idx].quantity > 1) {
            cart[idx].quantity--;
            saveCart();
            updateCartUI();
            showNotification('Đã giảm số lượng');
        }
        return;
    }
    const delBtn = t.closest('.btn-delete');
    if (delBtn) {
        const idx = parseInt(delBtn.dataset.index);
        if (cart[idx] && confirm(`Xóa "${cart[idx].name}"?`)) {
            const name = cart[idx].name;
            cart.splice(idx, 1);
            saveCart();
            updateCartUI();
            showNotification(`Đã xóa "${name}"`);
        }
        return;
    }
    const filterBtn = t.closest('.filter-btn');
    if (filterBtn) {
        const text = filterBtn.textContent.trim();
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.style.opacity = '0.6';
            btn.style.transform = 'scale(1)';
        });
        filterBtn.style.opacity = '1';
        filterBtn.style.transform = 'scale(1.05)';
        if (text.includes('200k') && text.includes('400k')) {
            filterProductsByPrice(200000, 400000);
        } else if (text.includes('400k') && text.includes('950k')) {
            filterProductsByPrice(400000, 950000);
        } else if (text.includes('1.000k') || text.includes('1000k')) {
            filterProductsByPrice(1000000, Infinity);
        } else {
            showAllProducts();
            showNotification('Hiển thị tất cả');
        }
        return;
    }
    const faq = t.closest('.faq-item');
    if (faq) {
        const ans = faq.nextElementSibling;
        if (ans?.classList.contains('faq-answer')) {
            ans.remove();
            faq.style.backgroundColor = '';
        } else {
            const div = document.createElement('div');
            div.className = 'faq-answer';
            div.style.cssText = 'padding:15px;background:white;margin-bottom:10px;border-radius:8px';
            const answers = {
                'Tôi có thể nhận hoa trong ngày không?': 'Có, giao trong ngày cho đơn trước 14h.',
                'Làm cách nào để đặt hoa trực tuyến?': 'Chọn sản phẩm → Giỏ hàng → Thanh toán.',
                'Cách mua được giá tốt nhất?': 'Theo dõi khuyến mãi và dùng voucher.'
            };
            div.textContent = answers[faq.textContent.trim()] || 'Liên hệ để biết chi tiết.';
            faq.style.backgroundColor = '#f8f9fa';
            faq.after(div);
        }
        return;
    }
    if (t.matches('.btn-checkout')) {
        if (cart.length === 0) {
            showNotification('Giỏ hàng trống!');
        } else {
            showNotification('Chuyển đến thanh toán...');
        }
        return;
    }
    if (t.matches('.btn-continue')) {
        window.location.href = 'sanpham.html';
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

document.querySelectorAll('.product-card, .mini-product, .review-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    obs.observe(el);
});
function startCountdown() {
    const el = document.querySelector('.fs-5.fw-bold.text-white');
    if (!el) return;
    let sec = 2 * 3600 + 15 * 60 + 40;
    setInterval(() => {
        if (sec <= 0) {
            el.textContent = 'Flash Sale đã kết thúc!';
            return;
        }
        sec--;
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        el.textContent = `Kết thúc trong: ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, 1000);
}
startCountdown();
    console.log('🌸 King of Flower khởi động');
    loadCart();
    updateCartUI();
    updateCartBadge();
    setTimeout(() => {
        updateCartBadge();
        console.log('🔄 Force badge update completed');
    }, 200);
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
window.addEventListener('storage', e => {
    if (e.key === 'kingofflower_cart') {
        loadCart();
        updateCartUI();
        updateCartBadge();
    }
});
window.addEventListener('focus', () => {
    loadCart();
    updateCartUI();
    updateCartBadge();
});