let cart = [];
function loadCart() {
    try {
        const saved = localStorage.getItem('kingofflower_cart');
        cart = saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('❌ Error loading cart:', e);
        cart = [];
    }
}
loadCart();
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
        const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT, null);
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
function showMessage(element, message, type) {
    if (!element) return;
    element.innerHTML = `
        <div class="alert alert-${type} border-0 shadow-sm slide-in-top">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i>
            ${message}
        </div>
    `;
}
function checkLoginStatus() {
    const currentUserEmail = localStorage.getItem('currentUser');
    if (!currentUserEmail) return;
    const userData = JSON.parse(localStorage.getItem(`user_${currentUserEmail}`));
    const container = document.querySelector('.auth-container');
    if (userData && container) {
        container.innerHTML = `
            <div class="card shadow-lg p-4 text-center fade-in">
                <div class="mb-3">
                    <i class="fas fa-user-circle fa-4x text-primary"></i>
                </div>
                <h3>Xin chào, ${userData.name}!</h3>
                <p class="text-muted">${userData.email}</p>
                <hr>
                <div class="d-grid gap-2">
                    <a href="trangchu.html" class="btn btn-outline-primary">Về trang chủ</a>
                    <button class="btn btn-danger" id="logoutBtn">Đăng xuất tài khoản</button>
                </div>
            </div>
        `;
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.reload();
        });
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authContainer = document.querySelector('.auth-container');
    checkLoginStatus();
    updateCartBadge();
    setTimeout(() => updateCartBadge(), 200);
    authContainer?.addEventListener('click', function(e) {
        if (e.target.id === 'showRegisterBtn') {
            e.preventDefault();
            loginForm.classList.add('fade-out');
            setTimeout(() => {
                loginForm.classList.add('d-none');
                loginForm.classList.remove('fade-out');
                registerForm.classList.remove('d-none');
                registerForm.classList.add('fade-in');
            }, 300);
        }
        if (e.target.id === 'showLoginBtn') {
            e.preventDefault();
            registerForm.classList.add('fade-out');
            setTimeout(() => {
                registerForm.classList.add('d-none');
                registerForm.classList.remove('fade-out');
                loginForm.classList.remove('d-none');
                loginForm.classList.add('fade-in');
            }, 300);
        }
    });
    document.getElementById('loginFormEl')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const messageDiv = document.getElementById('loginMessage');
        const userData = JSON.parse(localStorage.getItem(`user_${email}`));
        if (!userData) {
            showMessage(messageDiv, 'Tài khoản không tồn tại trên hệ thống!', 'danger');
        } else if (userData.password !== password) {
            showMessage(messageDiv, 'Mật khẩu cung cấp không chính xác.', 'danger');
        } else {
            localStorage.setItem('currentUser', email);
            showMessage(messageDiv, `Chào mừng trở lại, ${userData.name}!`, 'success');
            
            setTimeout(() => {
                window.location.href = 'trangchu.html';
            }, 1200);
        }
    });
    document.getElementById('registerFormEl')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const messageDiv = document.getElementById('registerMessage');
        if (name.length < 2) {
            showMessage(messageDiv, 'Họ và tên phải có ít nhất 2 ký tự!', 'danger');
            return;
        }
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            showMessage(messageDiv, 'Email không hợp lệ!', 'danger');
            return;
        }
        if (password.length < 6) {
            showMessage(messageDiv, 'Mật khẩu phải có ít nhất 6 ký tự!', 'danger');
            return;
        }
        if (password !== confirmPassword) {
            showMessage(messageDiv, 'Mật khẩu xác nhận không khớp!', 'danger');
            return;
        }
        if (localStorage.getItem(`user_${email}`)) {
            showMessage(messageDiv, 'Email này đã được đăng ký!', 'danger');
            return;
        }
        const newUser = { name, email, password };
        localStorage.setItem(`user_${email}`, JSON.stringify(newUser));
        showMessage(messageDiv, 'Đăng ký thành công! Đang chuyển đến đăng nhập...', 'success');
        setTimeout(() => {
            registerForm.classList.add('fade-out');
            setTimeout(() => {
                registerForm.classList.add('d-none');
                registerForm.classList.remove('fade-out');
                loginForm.classList.remove('d-none');
                loginForm.classList.add('fade-in');
                
                document.getElementById('loginEmail').value = email;
                document.getElementById('loginPassword').focus();
            }, 300);
        }, 1500);
    });
});
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
console.log('✅ taikhoan.js - Sẵn sàng!');