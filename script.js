// ===== DEFAULT USERS =====
if (!localStorage.getItem("users")) {
    const users = [
        { role: "admin", username: "admin", password: "admin123" },
        { role: "staff", username: "staff", password: "staff123" }
    ];
    localStorage.setItem("users", JSON.stringify(users));
}

// ===== DEFAULT 30 ITEMS (ONLY FIRST TIME) =====
if (!localStorage.getItem("itemsInitialized")) {
    const defaultItems = [
        { id: 1, name: "Laptop", category: "Electronics", quantity: 10, price: 50000 },
        { id: 2, name: "Mouse", category: "Electronics", quantity: 3, price: 500 },
        { id: 3, name: "Keyboard", category: "Electronics", quantity: 0, price: 1500 },

        { id: 4, name: "Rice Bag", category: "Grocery", quantity: 20, price: 1200 },
        { id: 5, name: "Sugar", category: "Grocery", quantity: 5, price: 50 },
        { id: 6, name: "Salt", category: "Grocery", quantity: 0, price: 20 },

        { id: 7, name: "Notebook", category: "Stationery", quantity: 15, price: 40 },
        { id: 8, name: "Pen", category: "Stationery", quantity: 2, price: 10 },
        { id: 9, name: "Marker", category: "Stationery", quantity: 0, price: 30 },

        { id: 10, name: "T-Shirt", category: "Clothing", quantity: 12, price: 700 },
        { id: 11, name: "Jeans", category: "Clothing", quantity: 4, price: 1500 },
        { id: 12, name: "Jacket", category: "Clothing", quantity: 0, price: 2500 },

        { id: 13, name: "Watch", category: "Accessories", quantity: 6, price: 2000 },
        { id: 14, name: "Belt", category: "Accessories", quantity: 3, price: 400 },
        { id: 15, name: "Cap", category: "Accessories", quantity: 0, price: 300 },

        { id: 16, name: "Headphones", category: "Electronics", quantity: 8, price: 2000 },
        { id: 17, name: "Charger", category: "Electronics", quantity: 5, price: 800 },
        { id: 18, name: "USB Cable", category: "Electronics", quantity: 1, price: 200 },

        { id: 19, name: "Oil", category: "Grocery", quantity: 7, price: 150 },
        { id: 20, name: "Flour", category: "Grocery", quantity: 2, price: 60 },
        { id: 21, name: "Tea Powder", category: "Grocery", quantity: 0, price: 250 },

        { id: 22, name: "Eraser", category: "Stationery", quantity: 9, price: 5 },
        { id: 23, name: "Scale", category: "Stationery", quantity: 4, price: 20 },
        { id: 24, name: "Glue", category: "Stationery", quantity: 0, price: 25 },

        { id: 25, name: "Shoes", category: "Clothing", quantity: 6, price: 3000 },
        { id: 26, name: "Socks", category: "Clothing", quantity: 3, price: 150 },
        { id: 27, name: "Shorts", category: "Clothing", quantity: 0, price: 600 },

        { id: 28, name: "Bag", category: "Accessories", quantity: 5, price: 1200 },
        { id: 29, name: "Wallet", category: "Accessories", quantity: 2, price: 800 },
        { id: 30, name: "Sunglasses", category: "Accessories", quantity: 0, price: 1500 }
    ];

    localStorage.setItem("items", JSON.stringify(defaultItems));
    localStorage.setItem("itemsInitialized", "true");
}

// ===== GLOBAL =====
let items = JSON.parse(localStorage.getItem("items")) || [];
let editId = null;

function saveToStorage() {
    localStorage.setItem("items", JSON.stringify(items));
}

// ===== LOGIN =====
function login() {
    const role = document.getElementById("role").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const users = JSON.parse(localStorage.getItem("users"));

    const validUser = users.find(user =>
        user.role === role &&
        user.username === username &&
        user.password === password
    );

    if (validUser) {
        localStorage.setItem("loggedInUser", JSON.stringify(validUser));
        window.location.href = "index.html";
    } else {
        document.getElementById("error").innerText = "Invalid Credentials!";
    }
}

// ===== AUTH CHECK =====
if (window.location.pathname.includes("index.html")) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        window.location.href = "login.html";
    } else {
        document.addEventListener("DOMContentLoaded", function () {
            document.getElementById("userRole").innerText =
                loggedInUser.role.toUpperCase();
        });
    }
}

// ===== LOGOUT =====
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

// ===== CREATE ROW =====
function createRow(item) {
    let badge = "";

    if (item.quantity === 0) {
        badge = `<span class="out-badge">OUT OF STOCK</span>`;
    } else if (item.quantity <= 5) {
        badge = `<span class="low-badge">LOW STOCK</span>`;
    }

    return `
        <tr>
            <td>${item.name} ${badge}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price}</td>
            <td><button onclick="sellItem(${item.id})">Sell</button></td>
            <td>
                <button onclick="editItem(${item.id})">Edit</button>
                ${getDeleteButton(item.id)}
            </td>
        </tr>
    `;
}

// ===== DISPLAY =====
function displayItems(list = items) {
    const table = document.getElementById("itemTable");
    table.innerHTML = "";

    let lowStockCounter = 0;

    list.forEach(item => {
        if (item.quantity <= 5 && item.quantity > 0) lowStockCounter++;
        table.innerHTML += createRow(item);
    });

    document.getElementById("totalItems").innerText = items.length;
    document.getElementById("lowStockCount").innerText = lowStockCounter;
}

// ===== ADD / UPDATE =====
function addItem() {
    let name = document.getElementById("name").value.trim();
    let quantity = document.getElementById("quantity").value;
    let price = document.getElementById("price").value;
    let category = document.getElementById("category").value.trim();

    if (name === "" || category === "" || quantity === "" || price === "") {
        alert("Please fill all fields");
        return;
    }

    quantity = parseInt(quantity);
    price = parseFloat(price);

    if (editId !== null) {
        const item = items.find(i => i.id === editId);
        if (!item) return;

        item.name = name;
        item.quantity = quantity;
        item.price = price;
        item.category = category;

        editId = null;
    } else {
        items.push({
            id: Date.now(),
            name,
            quantity,
            price,
            category
        });
    }

    saveToStorage();
    clearFields();
    displayItems();
    updateCategoryDropdown();
}

// ===== EDIT =====
function editItem(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    document.getElementById("name").value = item.name;
    document.getElementById("category").value = item.category;
    document.getElementById("quantity").value = item.quantity;
    document.getElementById("price").value = item.price;

    editId = id;
}

// ===== DELETE =====
function getDeleteButton(id) {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (user.role === "admin") {
        return `<button onclick="deleteItem(${id})">Delete</button>`;
    } else {
        return `<button disabled>Delete</button>`;
    }
}

function deleteItem(id) {
    if (!confirm("Are you sure?")) return;

    items = items.filter(item => item.id !== id);
    saveToStorage();
    displayItems();
}

// ===== SELL =====
function sellItem(id) {
    const item = items.find(i => i.id === id);

    const qty = Number(prompt("Enter quantity to sell:"));

    if (!qty || qty <= 0) return alert("Invalid quantity");
    if (qty > item.quantity) return alert("Not enough stock");

    item.quantity -= qty;

    saveToStorage();
    displayItems();
}

// ===== FILTER =====
function applyFilters() {
    let category = document.getElementById("categoryFilter").value;
    let search = document.getElementById("searchInput").value.toLowerCase();

    let filtered = items.filter(item => {
        return (category === "all" || item.category === category) &&
               item.name.toLowerCase().includes(search);
    });

    displayItems(filtered);
}

// ===== CATEGORY DROPDOWN =====
function updateCategoryDropdown() {
    let filter = document.getElementById("categoryFilter");

    let categories = [...new Set(items.map(i => i.category))];

    filter.innerHTML = `<option value="all">All Categories</option>`;

    categories.forEach(cat => {
        filter.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
}

// ===== CLEAR =====
function clearFields() {
    document.getElementById("name").value = "";
    document.getElementById("category").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("price").value = "";
}

// ===== LOAD =====
window.onload = function () {
    displayItems();
    updateCategoryDropdown();
};