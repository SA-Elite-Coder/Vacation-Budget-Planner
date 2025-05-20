const form = document.getElementById("expenseForm");
const list = document.getElementById("expenseList");
const totalEl = document.getElementById("total");
const themeToggle = document.getElementById("themeToggle");

let total = 0;

// Icon map
const icons = {
  flight: "✈️",
  stay: "🏨",
  food: "🍔",
  transport: "🚗",
  shopping: "🛒",
  other: "🛍️"
};

// Update total
function updateTotal() {
  totalEl.textContent = total.toFixed(2);
}

// Save to local storage
function saveExpenses() {
  const expenses = [];
  document.querySelectorAll("#expenseList li").forEach(li => {
    const text = li.querySelector("span").textContent;
    const amount = parseFloat(text.split("₹")[1]);
    const desc = text.split(" - ₹")[0].trim().replace(/^[^\s]+\s/, "");
    const icon = text.match(/^[^\s]+/)[0];
    const category = Object.keys(icons).find(key => icons[key] === icon) || "other";
    const dateText = li.querySelector("small").dataset.timestamp;

    expenses.push({ desc, amount, category, date: dateText });
  });
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

// Add single expense item to DOM
function addExpense(desc, amount, category, date = new Date()) {
  const li = document.createElement("li");

  const formattedDate = date.toLocaleString('default', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  li.innerHTML = `
    <div style="flex: 1">
      <span>${icons[category] || icons.other} ${desc} - ₹${amount.toFixed(2)}</span><br>
      <small style="color: gray; font-size: 0.8rem;" data-timestamp="${date.toISOString()}">${formattedDate}</small>
    </div>
    <button class="delete" title="Delete">
      <img src="https://img.icons8.com/color/48/delete-forever.png" alt="delete" class="delete-icon" />
    </button>
  `;

  list.appendChild(li);
  total += amount;
  updateTotal();
  saveExpenses();

  li.querySelector(".delete").addEventListener("click", () => {
    li.remove();
    total -= amount;
    updateTotal();
    saveExpenses();
  });
}

// Load from local storage on page load
function loadExpenses() {
  const saved = JSON.parse(localStorage.getItem("expenses")) || [];
  saved.forEach(({ desc, amount, category, date }) => {
    addExpense(desc, amount, category, new Date(date));
  });
}

// Form submit
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const desc = document.getElementById("desc").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;

  if (!desc || !amount || amount <= 0) return;

  addExpense(desc, amount, category);
  form.reset();

  jsConfetti.addConfetti(); // confetti on add
});

// PDF generation
document.getElementById("downloadPDF").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Vacation Budget Summary", 20, 20);

  let y = 35;
  const items = document.querySelectorAll("#expenseList li");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  if (items.length === 0) {
    doc.text("No expenses added yet.", 20, y);
  } else {
    items.forEach((li, index) => {
      const text = li.querySelector("span").textContent;
      doc.text(`${index + 1}. ${text}`, 20, y);
      y += 10;
    });
  }

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text(`Total: ₹${total.toFixed(2)}`, 20, y);

  doc.save("vacation-budget.pdf");
});

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const icon = themeToggle.querySelector("i");
  icon.classList.toggle("bi-sun-fill");
  icon.classList.toggle("bi-moon-fill");
});

// Amount input feedback
document.getElementById("amount").addEventListener("input", function() {
  const amount = parseFloat(this.value);
  const feedback = document.getElementById("amount-feedback");
  if (amount <= 0) {
    feedback.textContent = "Amount must be greater than zero.";
    feedback.style.color = "red";
  } else {
    feedback.textContent = "Looks good!";
    feedback.style.color = "green";
  }
});

const jsConfetti = new JSConfetti();
window.addEventListener("load", loadExpenses);
