// checkout.js

document.addEventListener('DOMContentLoaded', () => {
    // Function to get cart from localStorage
    function getCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    // Function to update the header cart count (optional, but good for consistency)
    function updateHeaderCartCount() {
        const cart = getCart();
        const cartItemCountElement = document.getElementById('cart-item-count'); // This ID is from Main.html
        if (cartItemCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartItemCountElement.textContent = totalItems;
        }
    }

    // Function to populate the order summary table on the checkout page
    function loadOrderSummary() {
        const orderTableBody = document.querySelector('.order-table tbody');
        const cart = getCart();

        if (!orderTableBody) {
            console.error("Order table body not found in Checkout.html");
            return;
        }

        orderTableBody.innerHTML = ''; // Clear existing content

        let cartSubtotal = 0; // This will be the sum of all item subtotals

        if (cart.length === 0) {
            // Display a message if the cart is empty
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="2" style="text-align: center; padding: 20px;">Your cart is empty. Please add items to proceed.</td>`;
            orderTableBody.appendChild(row);
        } else {
            cart.forEach(item => {
                const itemSubtotal = item.price * item.quantity;
                cartSubtotal += itemSubtotal;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name} x ${item.quantity}</td>
                    <td>$${itemSubtotal.toFixed(2)}</td>
                `;
                orderTableBody.appendChild(row);
            });

            // Add the subtotal row
            const subtotalRow = document.createElement('tr');
            subtotalRow.classList.add('subtotal');
            subtotalRow.innerHTML = `
                <th>Subtotal</th>
                <td>$${cartSubtotal.toFixed(2)}</td>
            `;
            orderTableBody.appendChild(subtotalRow);

            // Add the total row (for simplicity, total is same as subtotal for now)
            const totalRow = document.createElement('tr');
            totalRow.classList.add('total');
            totalRow.innerHTML = `
                <th>Total</th>
                <td>$${cartSubtotal.toFixed(2)}</td>
            `;
            orderTableBody.appendChild(totalRow);
        }
    }

    // Initial load when the page loads
    updateHeaderCartCount(); // Update header cart count (if the header is also on this page)
    loadOrderSummary();
});