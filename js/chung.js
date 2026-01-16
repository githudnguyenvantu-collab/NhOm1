document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            header.style.padding = '5px 0';
        } else {
            header.style.boxShadow = 'none';
            header.style.padding = '0';
        }
    });
    const searchInput = document.querySelector('.search-bar input');
    const searchBtn = document.querySelector('.search-bar button');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchBtn.click();
        });
    }
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.style.display = 'flex';
                backToTopBtn.style.opacity = '1';
            } else {
                backToTopBtn.style.opacity = '0';
                setTimeout(() => { if(window.scrollY <= 400) backToTopBtn.style.display = 'none'; }, 300);
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    syncNavCartBadge();
});
function performSearch(query) {
    const searchTerm = query.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');
    if (productCards.length === 0) {
        alert('Không tìm thấy danh sách sản phẩm trên trang này!');
        return;
    }
    let foundCount = 0;
    productCards.forEach(card => {
        const productName = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const productDesc = card.querySelector('p')?.textContent.toLowerCase() || '';
        if (productName.includes(searchTerm) || productDesc.includes(searchTerm)) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s ease-in-out';
            foundCount++;
        } else {
            card.style.display = 'none';
        }
    });
    showSearchResult(foundCount, query);
    const productSection = document.querySelector('.product-list') || 
                          document.querySelector('.featured-products') ||
                          document.querySelector('.products');
    if (productSection) {
        productSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
function showSearchResult(count, query) {
    const oldResult = document.querySelector('.search-result-message');
    if (oldResult) oldResult.remove();
    const resultDiv = document.createElement('div');
    resultDiv.className = 'search-result-message';
    resultDiv.innerHTML = `
        <p>
            ${count > 0 
                ? `Tìm thấy <strong>${count}</strong> sản phẩm cho "<strong>${query}</strong>"` 
                : `Không tìm thấy sản phẩm nào cho "<strong>${query}</strong>"`}
            <button onclick="clearSearch()" style="margin-left: 15px; padding: 5px 15px; background: #ff4757; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Xóa tìm kiếm
            </button>
        </p>
    `;
    Object.assign(resultDiv.style, {
        padding: '15px',
        background: count > 0 ? '#d4edda' : '#f8d7da',
        color: count > 0 ? '#155724' : '#721c24',
        textAlign: 'center',
        margin: '20px auto',
        maxWidth: '800px',
        borderRadius: '8px',
        border: `1px solid ${count > 0 ? '#c3e6cb' : '#f5c6cb'}`,
        animation: 'slideDown 0.3s ease-in-out'
    });
    const productSection = document.querySelector('.product-list') || 
                          document.querySelector('.featured-products') ||
                          document.querySelector('.products') ||
                          document.querySelector('main');
    
    if (productSection) {
        productSection.insertBefore(resultDiv, productSection.firstChild);
    }
}
function clearSearch() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.style.display = 'block';
    });
    const resultMessage = document.querySelector('.search-result-message');
    if (resultMessage) resultMessage.remove();
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) searchInput.value = '';
}
function syncNavCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    
    const navCartLink = document.querySelector('a[href="giohang.html"]');
    if (navCartLink && totalItems > 0) {
        let navBadge = navCartLink.querySelector('.nav-cart-badge');
        if (!navBadge) {
            navBadge = document.createElement('span');
            navBadge.className = 'nav-cart-badge';
            Object.assign(navBadge.style, {
                background: '#ff4757',
                color: 'white',
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '10px',
                marginLeft: '5px',
                verticalAlign: 'middle'
            });
            navCartLink.appendChild(navBadge);
        }
        navBadge.textContent = totalItems;
    }
}
if (typeof updateCartCount !== 'undefined') {
    const originalUpdateCartCount = updateCartCount;
    updateCartCount = function() {
        originalUpdateCartCount();
        syncNavCartBadge();
    };
}
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);