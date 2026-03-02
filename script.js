// ===== DEFAULT USERS =====
if (!localStorage.getItem("users")) {
    const users = [
        { role: "admin", username: "admin", password: "admin123" },
        { role: "staff", username: "staff", password: "staff123" }
    ];
    localStorage.setItem("users", JSON.stringify(users));
}

// ===== LOGIN FUNCTION =====
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

// ===== PROTECT DASHBOARD =====
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

// ===== INVENTORY =====
let items = JSON.parse(localStorage.getItem("items")) || [];

function saveToStorage() {
    localStorage.setItem("items", JSON.stringify(items));
}

// ===== ADD ITEM =====
function addItem() {
    let name = document.getElementById("name").value;
    let quantity = parseInt(document.getElementById("quantity").value);
    let price = parseFloat(document.getElementById("price").value);
    let category = document.getElementById("category").value;

    if (!name || !quantity || !price || !category) {
        alert("Please fill all fields");
        return;
    }

    let items = JSON.parse(localStorage.getItem("items")) || [];

    items.push({
        name,
        quantity,
        price,
        category
    });

    localStorage.setItem("items", JSON.stringify(items));

    document.getElementById("name").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("price").value = "";
    document.getElementById("category").value = "";

    displayItems();
    updateDashboard();
    updateCategoryDropdown(); // ✅ Important
}

function clearFields() {
    document.getElementById("name").value = "";
    document.getElementById("category").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("price").value = "";
}

// ===== DISPLAY ITEMS =====
function displayItems() {
    const table = document.getElementById("itemTable");
    table.innerHTML = "";

    let lowStockCounter = 0;

    items.forEach(item => {
        const row = document.createElement("tr");

        let badge = "";

        if (item.quantity === 0) {
            badge = `<span class="out-badge">OUT OF STOCK</span>`;
        } else if (item.quantity < 10) {
            row.classList.add("low-stock");
            badge = `<span class="low-badge">LOW STOCK</span>`;
            lowStockCounter++;
        }

        row.innerHTML = `
            <td>${item.name} ${badge}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>${item.price}</td>
            <td>
                <button onclick="sellItem(${item.id})">Sell</button>
            </td>
            <td>
                <button onclick="editItem(${item.id})">Edit</button>
                ${getDeleteButton(item.id)}
            </td>
        `;

        table.appendChild(row);
    });

    document.getElementById("totalItems").innerText = items.length;
    document.getElementById("lowStockCount").innerText = lowStockCounter;
}
function updateDashboard() {
    let items = JSON.parse(localStorage.getItem("items")) || [];

    let totalStock = items.reduce((sum, item) => sum + item.quantity, 0);

    let lowStockItems = items.filter(item => item.quantity > 0 && item.quantity <= 5).length;

    document.getElementById("totalStock").innerText = totalStock;
    document.getElementById("lowStockCount").innerText = lowStockItems;
}
// ===== SELL PRODUCT =====
function sellItem(id) {
    const item = items.find(i => i.id === id);

    const sellQty = Number(prompt("Enter quantity to sell:"));

    if (!sellQty || sellQty <= 0) {
        alert("Invalid quantity");
        return;
    }

    if (sellQty > item.quantity) {
        alert("Not enough stock available!");
        return;
    }

    item.quantity -= sellQty;

    saveToStorage();
    displayItems();
    updateDashboard() 
    alert("Sale completed successfully!");
}

// ===== EDIT ITEM =====
function editItem(id) {
    const item = items.find(i => i.id === id);

    document.getElementById("name").value = item.name;
    document.getElementById("category").value = item.category;
    document.getElementById("quantity").value = item.quantity;
    document.getElementById("price").value = item.price;
    updateDashboard() 
    deleteItem(id);
}

// ===== DELETE (ADMIN ONLY) =====
function getDeleteButton(id) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (loggedInUser.role === "admin") {
        return `<button onclick="deleteItem(${id})">Delete</button>`;
    } else {
        return `<button disabled style="background:gray;">Delete</button>`;
    }
}

function deleteItem(id) {
    items = items.filter(item => item.id !== id);
    saveToStorage();
    displayItems();
    updateDashboard() 
}

// ===== SEARCH =====

function applyFilters() {
    let selectedCategory = document.getElementById("categoryFilter").value;
    let searchValue = document.getElementById("searchInput").value.toLowerCase();

    let items = JSON.parse(localStorage.getItem("items")) || [];
    let tbody = document.querySelector("tbody");

    tbody.innerHTML = "";

    let filteredItems = items.filter(item => {
        let matchCategory = selectedCategory === "all" || item.category === selectedCategory;
        let matchSearch = item.name.toLowerCase().includes(searchValue);
        return matchCategory && matchSearch;
    });

    filteredItems.forEach((item, index) => {
        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>${item.price}</td>
            <td>
                <button onclick="editItem(${index})">Edit</button>
                <button onclick="deleteItem(${index})">Delete</button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function updateCategoryDropdown() {
    let items = JSON.parse(localStorage.getItem("items")) || [];
    let filter = document.getElementById("categoryFilter");

    let categories = [...new Set(items.map(item => item.category).filter(Boolean))];

    filter.innerHTML = `<option value="all">All Categories</option>`;

    categories.forEach(cat => {
        filter.innerHTML += `<option value="${cat}">${cat}</option>`;
    });
}

window.onload = function () {
    displayItems();
    updateDashboard();
    updateCategoryDropdown();
};