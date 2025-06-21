document.addEventListener('DOMContentLoaded', () => {
    // Function to get cart from localStorage
    function getCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    // Function to save cart to localStorage
    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Function to update the header cart count
    function updateHeaderCartCount() {
        const cart = getCart();
        const cartItemCountElement = document.getElementById('cart-item-count');
        if (cartItemCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartItemCountElement.textContent = totalItems;
        }
    }

    // Function to update mini-cart display
    function updateMiniCart() {
        const miniCartBody = document.querySelector('#mini-cart-preview .mini-cart-body');
        const miniCartTotalPriceElement = document.getElementById('mini-cart-total-price');
        const miniCartEmptyMessage = document.querySelector('#mini-cart-preview .mini-cart-empty-message');
        const cart = getCart();

        // Check if mini-cart elements exist before trying to update them
        if (!miniCartBody || !miniCartTotalPriceElement || !miniCartEmptyMessage) {
            // console.warn("Mini cart elements not found. Skipping mini cart update."); // Optional: uncomment for debugging
            return; // Exit if elements don't exist (e.g., if this script runs on AddtoCart.html)
        }

        miniCartBody.innerHTML = ''; // Clear previous items

        if (cart.length === 0) {
            miniCartEmptyMessage.style.display = 'block';
        } else {
            miniCartEmptyMessage.style.display = 'none';
            let totalPrice = 0;
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('mini-cart-item');
                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="mini-cart-item-img">
                    <div class="mini-cart-item-details">
                        <div class="mini-cart-item-name">${item.name}</div>
                        <div class="mini-cart-item-quantity-price">${item.quantity} x $${item.price.toFixed(2)}</div>
                    </div>
                    <button class="mini-cart-item-remove" data-product-name="${item.name}">&times;</button>
                `;
                miniCartBody.appendChild(itemElement);
                totalPrice += item.price * item.quantity;
            });
            miniCartTotalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
        }
    }

    // Add event listener to "Add To Cart" buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productElement = event.target.closest('.product-cart');
            if (productElement) {
                const productName = productElement.querySelector('.product-title').textContent.trim();
                const productImage = productElement.querySelector('.product-image-wrapper img').src;
                const productPriceText = productElement.querySelector('.current-price').textContent.trim();
                const productPrice = parseFloat(productPriceText.replace('$', ''));

                if (isNaN(productPrice)) {
                    console.error('Invalid product price:', productPriceText);
                    return;
                }

                let cart = getCart();
                const existingItem = cart.find(item => item.name === productName);

                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({
                        name: productName,
                        image: productImage,
                        price: productPrice,
                        quantity: 1
                    });
                }

                saveCart(cart);
                updateHeaderCartCount();
                updateMiniCart(); // Update mini-cart when item is added

                // Show "Added to cart!" message (optional visual feedback)
                let successMessage = productElement.querySelector('.add-to-cart-success-message');
                if (!successMessage) {
                    successMessage = document.createElement('span');
                    successMessage.classList.add('add-to-cart-success-message');
                    // Insert right after the button
                    event.target.insertAdjacentElement('afterend', successMessage);
                }
                successMessage.textContent = ' (Added to cart!)';
                successMessage.style.opacity = 1;
                // Fade out the message
                setTimeout(() => {
                    successMessage.style.opacity = 0;
                    // Optional: remove element after fading out
                    // setTimeout(() => { successMessage.remove(); }, 500);
                }, 2000); // Message fades out after 2 seconds
            }
        });
    });

    // Toggle mini-cart visibility
    const cartIcon = document.querySelector('.cart-icon');
    const miniCartPreview = document.getElementById('mini-cart-preview');

    if (cartIcon && miniCartPreview) {
        cartIcon.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent navigating to AddtoCart.html immediately
            miniCartPreview.classList.toggle('active');
            updateMiniCart(); // Update mini-cart content every time it's opened
        });

        // Close mini-cart if clicked outside
        document.addEventListener('click', (event) => {
            if (!cartIcon.contains(event.target) && !miniCartPreview.contains(event.target)) {
                miniCartPreview.classList.remove('active');
            }
        });

        // Add event listener for removing items directly from mini-cart
        miniCartPreview.addEventListener('click', (event) => {
            if (event.target.classList.contains('mini-cart-item-remove')) {
                const productName = event.target.dataset.productName;
                if (productName) {
                    let cart = getCart();
                    cart = cart.filter(item => item.name !== productName);
                    saveCart(cart);
                    updateHeaderCartCount();
                    updateMiniCart();
                }
            }
        });
    }

    // Initial load for header cart count and mini-cart (if present)
    updateHeaderCartCount();
    if (miniCartPreview) { // Only try to update mini-cart if its HTML element exists on the page
        updateMiniCart();
    }
});