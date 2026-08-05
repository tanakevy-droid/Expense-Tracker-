let balance = 0;

const form = document.getElementById("expense-form");
const description = document.getElementById("description");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const balanceDisplay = document.getElementById("balance");
const expenseList = document.getElementById("expense-list");
const incomeDisplay = document.getElementById("income");
const expensesDisplay = document.getElementById("expenses");
const category = document.getElementById("category");
const search = document.getElementById("search");
const budgetInput = document.getElementById("budget");
const saveBudgetBtn = document.getElementById("save-budget");
const progressBar = document.getElementById("progress-bar");
const budgetInfo = document.getElementById("budget-info");
const exportPdfBtn = document.getElementById("export-pdf");

let monthlyBudget = Number(localStorage.getItem("budget")) || 0;
budgetInput.value = monthlyBudget;
saveBudgetBtn.addEventListener("click", () => {
    monthlyBudget = Number(budgetInput.value);
    localStorage.setItem("budget", monthlyBudget);
    updateUI();
});
let expenseChart;

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
}
function updateChart() {
 datasets: [{
    data: data,
    backgroundColor: [
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#8B5CF6",
        "#06B6D4",
        "#EC4899",
        "#84CC16",
        "#F97316"
    ],
    borderColor: "#ffffff",
    borderWidth: 2
}] 

    const totals = {};

    expenses.forEach(expense => {

        if (expense.type === "expense") {

            if (!totals[expense.category]) {
                totals[expense.category] = 0;
            }

            totals[expense.category] += expense.amount;
        }

    });

    const labels = Object.keys(totals);
    const data = Object.values(totals);

    const ctx = document.getElementById("expenseChart");

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: "pie",
options: {
    responsive: true,
    plugins: {
        legend: {
            position: "bottom"
        },
        title: {
            display: true,
            text: "Expense Categories"
        }
    }
},
        data: {
            labels: labels,
            datasets: [{
                data: data
            }]
        }
    });

}
function updateUI() {
    expenseList.innerHTML = "";
    balance = 0;
    let totalIncome = 0;
let totalExpenses = 0;

    expenses
.filter(expense =>
    expense.description
        .toLowerCase()
        .includes(search.value.toLowerCase())
)
.forEach((expense, index) => {

        if (expense.type === "income") {
    balance += expense.amount;
    totalIncome += expense.amount;
} else {
    balance -= expense.amount;
    totalExpenses += expense.amount;
}

        const li = document.createElement("li");

        li.innerHTML = `
            <span>
                <strong>${expense.description}</strong><br>
${expense.category}<br>
${expense.type === "income" ? "🟢 Income" : "🔴 Expense"} - R${expense.amount.toFixed(2)} 
            </span>
            <button onclick="deleteExpense(${index})">🗑️</button>
        `;

        expenseList.appendChild(li);
    });

    balanceDisplay.textContent = `R${balance.toFixed(2)}`;
    incomeDisplay.textContent = `R${totalIncome.toFixed(2)}`;
expensesDisplay.textContent = `R${totalExpenses.toFixed(2)}`;
}

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const newExpense = {
    type: type.value,
    category: category.value,
    description: description.value,
    amount: Number(amount.value)
};

    expenses.push(newExpense);
    saveExpenses();
    updateUI();

    form.reset();
});

function deleteExpense(index) {
    expenses.splice(index, 1);
    saveExpenses();
    updateUI();
}

updateUI();
const spent = expenses
    .filter(e => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);

const remaining = monthlyBudget - spent;

budgetInfo.textContent =
`Budget: R${monthlyBudget.toFixed(2)} | Spent: R${spent.toFixed(2)} | Remaining: R${remaining.toFixed(2)}`;

let percent = monthlyBudget > 0 ? (spent / monthlyBudget) * 100 : 0;

progressBar.style.width = Math.min(percent,100) + "%";

if(percent < 80){
    progressBar.style.background="#22c55e";
}else if(percent <100){
    progressBar.style.background="#f59e0b";
}else{
    progressBar.style.background="#ef4444";
}
updateChart();
search.addEventListener("input", updateUI);
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js")
            .then(() => console.log("Service Worker Registered"))
            .catch(err => console.log(err));
    });
}
exportPdfBtn.addEventListener("click", () => {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let totalIncome = 0;
    let totalExpenses = 0;

    expenses.forEach(item => {
        if (item.type === "income") {
            totalIncome += item.amount;
        } else {
            totalExpenses += item.amount;
        }
    });

    const balance = totalIncome - totalExpenses;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Expense Tracker Report", 20, 20);

    doc.setFontSize(11);
    doc.text("Generated: " + new Date().toLocaleString(), 20, 30);

    doc.line(20, 35, 190, 35);

    doc.setFontSize(14);
    doc.text(`Balance: R${balance.toFixed(2)}`, 20, 45);
    doc.text(`Income: R${totalIncome.toFixed(2)}`, 20, 55);
    doc.text(`Expenses: R${totalExpenses.toFixed(2)}`, 20, 65);

    doc.line(20, 72, 190, 72);

    let y = 85;

    expenses.forEach(item => {

        doc.setFontSize(11);

        doc.text(
            `${item.type.toUpperCase()} | ${item.category} | ${item.description} | R${item.amount.toFixed(2)}`,
            20,
            y
        );

        y += 10;

        if (y > 270) {
            doc.addPage();
            y = 20;
        }

    });

    doc.save("Expense-Tracker-Report.pdf");

});
