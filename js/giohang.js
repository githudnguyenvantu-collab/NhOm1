const CONFIG = {
    CART_KEY: 'kingofflower_cart',
    TOAST_DURATION: 3000,
    DISCOUNT: 50000
};
const shippingFees = {
    standard: 30000,
    fast: 50000,
    express: 80000
};
let cart = [];
let currentShippingFee = shippingFees.standard;
const parsePrice = text => parseInt(text.replace(/[^\d]/g, '')) || 0;
const formatPrice = price => price.toLocaleString('vi-VN') + ' vnđ';

function showNotification(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4f44a6' : '#dc3545'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
}

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const button = event.currentTarget;
    
    if (section && section.classList.contains('collapsed')) {
        section.classList.remove('collapsed');
        button.classList.add('active');
    } else if (section) {
        section.classList.add('collapsed');
        button.classList.remove('active');
    }
}

function loadCart() {
    try {
        const data = localStorage.getItem(CONFIG.CART_KEY);
        cart = data ? JSON.parse(data) : [];
        console.log('📦 Loaded cart:', cart.length, 'items');
    } catch (e) {
        console.error('Load cart error:', e);
        cart = [];
    }
}

function saveCart() {
    try {
        localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(cart));
        console.log('💾 Saved cart');
    } catch (e) {
        console.error('Save cart error:', e);
        showNotification('Không thể lưu giỏ hàng', 'error');
    }
}

function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const possibleSelectors = [
        '.badge',
        '.cart-badge', 
        '.cart-count',
        '[data-count]',
        'a[href*="giohang"] .badge',
        'a[href*="giohang"] span',
        '.nav-link .badge',
        '.header-actions .badge'
    ];
    
    possibleSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(badge => {
            const isInNav = badge.closest('nav, header, .main-nav, .header-actions');
            
            if (isInNav) {
                badge.textContent = totalItems;
                
                if (totalItems === 0) {
                    badge.style.display = 'none';
                    badge.style.opacity = '0';
                    badge.style.visibility = 'hidden';
                } else {
                    badge.style.display = 'inline-block';
                    badge.style.opacity = '1';
                    badge.style.visibility = 'visible';
                }
            }
        });
    });
    
    const cartLinks = document.querySelectorAll('a[href*="giohang"]');
    cartLinks.forEach(link => {
        const textNodes = [];
        const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (node.textContent.trim().match(/^\d+$/)) {
                textNodes.push(node);
            }
        }
        textNodes.forEach(node => {
            if (totalItems === 0) {
                node.textContent = '';
            } else {
                node.textContent = totalItems;
            }
        });
    });
    
    console.log('🔔 Cart badge updated:', totalItems);
}

function calculateTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = Math.max(0, subtotal + currentShippingFee - CONFIG.DISCOUNT);
    
    return {
        subtotal: subtotal,
        shipping: currentShippingFee,
        discount: CONFIG.DISCOUNT,
        total: total
    };
}

function renderCart() {
    const container = document.querySelector('.cart-main-section');
    if (!container) {
        updateCartBadge();
        return;
    }
    
    updateCartBadge();
    updateCartHeader();
    updateSummary();
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:60px 20px;color:#999;background:#f8f9fa;border-radius:15px;">
                <i class="fas fa-shopping-cart" style="font-size:64px;margin-bottom:20px;opacity:0.3"></i>
                <h3 style="color:#666;">Giỏ hàng trống</h3>
                <p style="font-size:16px;margin:10px 0;">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
                <button class="btn-continue" onclick="window.location.href='sanpham.html'" style="max-width:300px;margin:20px auto;">
                    <i class="fa-solid fa-arrow-left"></i> Tiếp tục mua sắm
                </button>
            </div>`;
        return;
    }
    
    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item-wrapper">
            <div class="cart-item">
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
                    <button class="btn-delete" data-index="${index}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <button class="toggle-btn" onclick="toggleSection('shipping-${index + 1}')">
                <i class="fa-solid fa-truck"></i> Thông tin giao hàng
                <i class="fa-solid fa-chevron-down toggle-icon"></i>
            </button>
            
            <div class="shipping-info collapsed" id="shipping-${index + 1}">
                <div class="form-group">
                    <label for="customer-name-${index + 1}">Họ và tên <span class="required">*</span></label>
                    <input type="text" id="customer-name-${index + 1}" placeholder="Nhập họ và tên" required>
                </div>
                <div class="form-group">
                    <label for="customer-phone-${index + 1}">Số điện thoại <span class="required">*</span></label>
                    <input type="tel" id="customer-phone-${index + 1}" placeholder="Nhập số điện thoại" required>
                </div>
                <div class="form-group">
                    <label for="customer-address-${index + 1}">Địa chỉ giao hàng <span class="required">*</span></label>
                    <textarea id="customer-address-${index + 1}" rows="3" placeholder="Nhập địa chỉ chi tiết" required></textarea>
                </div>
                <div class="form-group">
                    <label for="shipping-method-${index + 1}">Phương thức giao hàng</label>
                    <select id="shipping-method-${index + 1}" class="shipping-method-select">
                        <option value="standard">Giao hàng tiêu chuẩn (3-5 ngày) - 30,000 vnđ</option>
                        <option value="fast">Giao hàng nhanh (1-2 ngày) - 50,000 đ</option>
                        <option value="express">Giao hàng hỏa tốc (trong ngày) - 80,000 vnđ</option>
                    </select>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.shipping-method-select').forEach(select => {
        select.addEventListener('change', function() {
            const value = this.value;
            currentShippingFee = shippingFees[value] || shippingFees.standard;
            updateSummary();
        });
    });
}

function updateCartHeader() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const headerText = document.querySelector('.cart-header p');
    
    if (headerText) {
        headerText.innerHTML = totalItems > 0 
            ? `Bạn có <strong>${totalItems} sản phẩm</strong> trong giỏ hàng`
            : '<strong>Giỏ hàng trống</strong>';
    }
}

function updateSummary() {
    const totals = calculateTotal();
    const summaryRows = document.querySelectorAll('.summary-row span:last-child');
    if (summaryRows[0]) summaryRows[0].textContent = formatPrice(totals.subtotal);
    if (summaryRows[1]) summaryRows[1].textContent = formatPrice(totals.shipping);
    const discountEl = document.querySelector('.summary-row.discount span:last-child');
    if (discountEl) discountEl.textContent = '-' + formatPrice(totals.discount);
    const totalEl = document.querySelector('.summary-total span:last-child');
    if (totalEl) totalEl.textContent = formatPrice(totals.total);
}

document.addEventListener('click', e => {
    const target = e.target;
    
    if (target.classList.contains('qty-plus')) {
        const index = parseInt(target.dataset.index);
        if (cart[index] && cart[index].quantity < 99) {
            cart[index].quantity++;
            saveCart();
            renderCart();
            showNotification('Đã tăng số lượng');
        }
        return;
    }
    
    if (target.classList.contains('qty-minus')) {
        const index = parseInt(target.dataset.index);
        if (cart[index]) {
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
                saveCart();
                renderCart();
                showNotification('Đã giảm số lượng');
            } else {
                showNotification('Số lượng tối thiểu là 1', 'error');
            }
        }
        return;
    }
    
    const deleteBtn = target.closest('.btn-delete');
    if (deleteBtn) {
        const index = parseInt(deleteBtn.dataset.index);
        if (cart[index]) {
            const productName = cart[index].name;
            if (confirm(`Xóa "${productName}" khỏi giỏ hàng?`)) {
                cart.splice(index, 1);
                saveCart();
                renderCart();
                showNotification(`Đã xóa "${productName}"`);
            }
        }
        return;
    }
    
    if (target.matches('.btn-checkout')) {
        if (cart.length === 0) {
            e.preventDefault();
            showNotification('Giỏ hàng trống!', 'error');
            return;
        }
        
        let hasEmptyFields = false;
        cart.forEach((item, index) => {
            const name = document.getElementById(`customer-name-${index + 1}`)?.value.trim();
            const phone = document.getElementById(`customer-phone-${index + 1}`)?.value.trim();
            const address = document.getElementById(`customer-address-${index + 1}`)?.value.trim();
            
            if (!name || !phone || !address) {
                hasEmptyFields = true;
            }
        });
        
        if (hasEmptyFields) {
            e.preventDefault();
            showNotification('Vui lòng điền đầy đủ thông tin giao hàng cho tất cả sản phẩm!', 'error');
            return;
        }
        
        const total = document.querySelector('.summary-total span:last-child')?.textContent;
        showNotification(`Đặt hàng thành công! Tổng: ${total}`);
        setTimeout(() => {
            cart = [];
            saveCart();
            renderCart();
        }, 2000);
    }
    
    if (target.matches('.btn-continue')) {
        window.location.href = 'sanpham.html';
    }
});

const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        backToTopBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function init() {
    console.log('🌸 King of Flower - Cart Page Loaded');
    loadCart();
    renderCart();
    
    setTimeout(() => {
        updateCartBadge();
        console.log('🔄 Badge force updated');
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

window.addEventListener('storage', e => {
    if (e.key === CONFIG.CART_KEY) {
        loadCart();
        renderCart();
        console.log('🔄 Cart synced from another tab');
    }
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadCart();
        renderCart();
        console.log('🔄 Cart reloaded on visibility change');
    }
});

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);