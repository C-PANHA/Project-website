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

    // Function to update the header cart count (re-used for consistency)
    function updateHeaderCartCount() {
        const cart = getCart();
        const cartItemCountElement = document.getElementById('cart-item-count');
        if (cartItemCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartItemCountElement.textContent = totalItems;
        }
    }

    // Function to load and display cart items in the table
    function loadCartItems() {
        const cartTableBody = document.querySelector('.cart-table tbody');
        const cart = getCart();

        if (!cartTableBody) {
            console.warn("Cart table body not found. Cannot load cart items.");
            return;
        }

        cartTableBody.innerHTML = ''; // Clear existing rows

        if (cart.length === 0) {
            cartTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Your cart is empty.</td></tr>';
        } else {
            cart.forEach(item => {
                const row = document.createElement('tr');
                const subtotal = item.price * item.quantity;
                row.innerHTML = `
                    <td><img src="${item.image}" alt="${item.name}" class="cart-item-image"></td>
                    <td><div class="product-name">${item.name}</div></td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>
                        <div class="quantity-control">
                            <button class="quantity-decrease" data-product-name="${item.name}">-</button>
                            <input type="number" value="${item.quantity}" min="1" data-product-name="${item.name}">
                            <button class="quantity-increase" data-product-name="${item.name}">+</button>
                        </div>
                    </td>
                    <td class="subtotal-price">$${subtotal.toFixed(2)}</td>
                    <td><button class="remove-item-btn" data-product-name="${item.name}">&times;</button></td>
                `;
                cartTableBody.appendChild(row);
            });
        }
        updateCartTotals();
        updateHeaderCartCount(); // Ensure header count is updated on cart page load
    }

    // Function to update cart totals
    function updateCartTotals() {
        const cart = getCart();
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });

        // Assuming no shipping/tax for simplicity, total is same as subtotal
        const total = subtotal;

        const subtotalElement = document.querySelector('.cart-totals .cart-subtotal');
        const totalElement = document.querySelector('.cart-totals .cart-total');

        if (subtotalElement) {
            subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        }
        if (totalElement) {
            totalElement.textContent = `$${total.toFixed(2)}`;
        }
    }

    // Event listener for quantity changes and item removal
    document.querySelector('.cart-table tbody').addEventListener('click', (event) => {
        const target = event.target;
        const productName = target.dataset.productName;
        let cart = getCart();

        if (!productName) return; // Not a quantity control or remove button

        const itemIndex = cart.findIndex(item => item.name === productName);
        if (itemIndex === -1) return; // Item not found in cart

        if (target.classList.contains('quantity-increase')) {
            cart[itemIndex].quantity += 1;
        } else if (target.classList.contains('quantity-decrease')) {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1;
            } else {
                // If quantity drops to 0, remove the item
                cart.splice(itemIndex, 1);
            }
        } else if (target.classList.contains('remove-item-btn')) {
            cart.splice(itemIndex, 1); // Remove the item
        }

        saveCart(cart);
        loadCartItems(); // Reload the entire cart table to reflect changes
    });

    // Event listener for direct input quantity changes
    document.querySelector('.cart-table tbody').addEventListener('change', (event) => {
        const target = event.target;
        if (target.type === 'number' && target.dataset.productName) {
            const productName = target.dataset.productName;
            const newQuantity = parseInt(target.value, 10);
            let cart = getCart();
            const itemIndex = cart.findIndex(item => item.name === productName);

            if (itemIndex !== -1 && !isNaN(newQuantity) && newQuantity >= 0) {
                if (newQuantity === 0) {
                    cart.splice(itemIndex, 1); // Remove if quantity is 0
                } else {
                    cart[itemIndex].quantity = newQuantity;
                }
                saveCart(cart);
                loadCartItems();
            } else if (newQuantity < 0) {
                // If user inputs a negative number, reset to 1 or remove if 0
                target.value = cart[itemIndex] ? cart[itemIndex].quantity : 1;
            }
        }
    });


    // Event listener for clearing the entire cart
    document.querySelector('.clear-cart-button').addEventListener('click', () => {
        localStorage.removeItem('cart'); // Clear the cart from localStorage
        loadCartItems(); // Reload to show empty cart
    });

    // Load cart items when the page loads
    loadCartItems();
});