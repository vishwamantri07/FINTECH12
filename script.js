// InvestMate - educational prototype
// Data is stored locally in this browser. No backend or live market API.

const STARTING_BALANCE = 50000;
const STORAGE = {
  transactions: "investmate-transactions-v2",
  goals: "investmate-goals-v2",
  quiz: "investmate-quiz-v2",
  language: "investmate-language-v2"
};

const $ = (id) => document.getElementById(id);
const money = (amount) =>
  "₹" + Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  });

function loadData(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

let transactions = loadData(STORAGE.transactions, []);
let goals = loadData(STORAGE.goals, []);
let quizProgress = loadData(STORAGE.quiz, { correct: 0, attempted: 0, points: 0 });
let currentQuizIndex = 0;
let quizAnswered = false;

const marketData = [
  { name: "Reliance Industries", symbol: "RELIANCE", price: 1450, change: 2.4, category: "Energy & Retail" },
  { name: "TCS", symbol: "TCS", price: 3800, change: -1.3, category: "Technology" },
  { name: "Infosys", symbol: "INFY", price: 1600, change: 1.7, category: "Technology" },
  { name: "HDFC Bank", symbol: "HDFCBANK", price: 1700, change: -2.1, category: "Banking" },
  { name: "ITC", symbol: "ITC", price: 450, change: 0.8, category: "Consumer Goods" },
  { name: "Demo Motors", symbol: "DMOTORS", price: 820, change: -4.2, category: "Automotive" }
];

const quizzes = [
  {
    category: "BUDGETING",
    question: "Why is tracking your expenses useful?",
    options: [
      "It guarantees investment profits",
      "It helps you understand where your money goes",
      "It removes all financial risk",
      "It automatically increases your income"
    ],
    answer: 1,
    explanation: "Tracking spending helps you identify patterns and make informed choices. It cannot guarantee profits."
  },
  {
    category: "INVESTING BASICS",
    question: "What does diversification mean?",
    options: [
      "Putting all money into one company",
      "Buying only stocks that recently rose",
      "Spreading investments across different assets",
      "Avoiding all savings"
    ],
    answer: 2,
    explanation: "Diversification spreads exposure across investments. It can reduce concentration risk, but it cannot eliminate all risk."
  },
  {
    category: "RISK",
    question: "What should you know before investing in a stock?",
    options: [
      "The price can rise or fall",
      "A stock always provides fixed returns",
      "Every company is equally risky",
      "Past gains guarantee future gains"
    ],
    answer: 0,
    explanation: "Stock prices fluctuate, and you may lose some or all of the money invested."
  },
  {
    category: "COMPOUNDING",
    question: "What is compound growth?",
    options: [
      "A guaranteed stock return",
      "Earning returns on previous returns over time",
      "A fee paid to a broker",
      "A way to avoid market changes"
    ],
    answer: 1,
    explanation: "Compounding happens when returns remain invested and can themselves earn returns. Actual returns are not guaranteed."
  },
  {
    category: "SCAM SAFETY",
    question: "Someone promises 30% monthly returns with zero risk. What is the safest response?",
    options: [
      "Invest quickly",
      "Borrow money to invest more",
      "Treat it as a serious warning sign and verify independently",
      "Trust it if the message has a logo"
    ],
    answer: 2,
    explanation: "High guaranteed returns and claims of no risk are major warning signs. Do not send money before independent checks."
  },
  {
    category: "SAVINGS",
    question: "What is an emergency fund mainly for?",
    options: [
      "Daily speculative trading",
      "Unexpected costs or income disruption",
      "Buying every market dip",
      "Guaranteeing investment returns"
    ],
    answer: 1,
    explanation: "An emergency fund can help cover unexpected expenses without immediately relying on debt or selling investments."
  },
  {
    category: "RISK",
    question: "Why might an investment with higher potential returns be risky?",
    options: [
      "It can never lose value",
      "Higher potential returns always arrive quickly",
      "There may be a greater chance or size of loss",
      "It removes the need to research"
    ],
    answer: 2,
    explanation: "Higher potential returns often involve higher risk. Understand the product and its possible losses before deciding."
  }
];

const coachContent = {
  budget: {
    title: "Budgeting",
    en: "A budget is a plan for how you will use your money. Write down income, essential expenses, savings, and optional spending. Review it regularly and adjust it when your situation changes.",
    kn: "ಬಜೆಟ್ ಎಂದರೆ ನಿಮ್ಮ ಹಣವನ್ನು ಹೇಗೆ ಬಳಸಬೇಕು ಎಂಬ ಯೋಜನೆ. ಆದಾಯ, ಅಗತ್ಯ ವೆಚ್ಚಗಳು, ಉಳಿತಾಯ ಮತ್ತು ಇತರ ಖರ್ಚುಗಳನ್ನು ದಾಖಲಿಸಿ. ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಗೆ ಅನುಗುಣವಾಗಿ ಬಜೆಟ್ ಅನ್ನು ನಿಯಮಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ."
  },
  emergency: {
    title: "Emergency fund",
    en: "An emergency fund is money kept aside for unexpected costs such as urgent repairs or loss of income. Build it gradually in a place that is accessible and appropriate for your needs.",
    kn: "ತುರ್ತು ನಿಧಿ ಎಂದರೆ ಅನಿರೀಕ್ಷಿತ ವೆಚ್ಚಗಳು ಅಥವಾ ಆದಾಯ ನಷ್ಟದ ಸಂದರ್ಭಕ್ಕೆ ಮೀಸಲಿಟ್ಟ ಹಣ. ನಿಮ್ಮ ಅಗತ್ಯಗಳಿಗೆ ತಕ್ಕಂತೆ ಸುಲಭವಾಗಿ ಪಡೆಯಬಹುದಾದ ಸ್ಥಳದಲ್ಲಿ ನಿಧಿಯನ್ನು ನಿಧಾನವಾಗಿ ನಿರ್ಮಿಸಿ."
  },
  diversification: {
    title: "Diversification",
    en: "Diversification means spreading investments across different assets instead of depending on one. It can reduce the effect of a single investment performing poorly, but it cannot remove all risk.",
    kn: "ವೈವಿಧ್ಯೀಕರಣ ಎಂದರೆ ಎಲ್ಲಾ ಹಣವನ್ನು ಒಂದೇ ಹೂಡಿಕೆಯಲ್ಲಿ ಇಡುವ ಬದಲು ವಿವಿಧ ಹೂಡಿಕೆಗಳಲ್ಲಿ ಹಂಚುವುದು. ಇದರಿಂದ ಒಂದೇ ಹೂಡಿಕೆಯ ಕೆಟ್ಟ ಫಲಿತಾಂಶದ ಪರಿಣಾಮ ಕಡಿಮೆಯಾಗಬಹುದು; ಆದರೆ ಎಲ್ಲಾ ಅಪಾಯವೂ ನಿವಾರಣೆಯಾಗುವುದಿಲ್ಲ."
  },
  compound: {
    title: "Compound growth",
    en: "Compounding occurs when returns stay invested and may generate additional returns over time. The result depends on the amount, time, fees, and actual returns. Investment returns are not guaranteed.",
    kn: "ಹೂಡಿಕೆಯ ಮೇಲಿನ ಲಾಭವನ್ನು ಮತ್ತೆ ಹೂಡಿಕೆಯಲ್ಲಿ ಉಳಿಸಿದಾಗ, ಆ ಲಾಭದ ಮೇಲೆಯೂ ಮುಂದಿನ ಅವಧಿಯಲ್ಲಿ ಲಾಭ ಸಿಗುವ ಸಾಧ್ಯತೆಯೇ ಚಕ್ರಬಡ್ಡಿ ಬೆಳವಣಿಗೆ. ಫಲಿತಾಂಶವು ಸಮಯ, ಮೊತ್ತ, ಶುಲ್ಕಗಳು ಮತ್ತು ನಿಜವಾದ ಲಾಭದ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿರುತ್ತದೆ."
  },
  risk: {
    title: "Investment risk",
    en: "Risk is the possibility that an investment will lose value or perform differently than expected. Before investing, understand the product, your time horizon, your ability to handle losses, and any fees.",
    kn: "ಹೂಡಿಕೆಯ ಮೌಲ್ಯ ಕಡಿಮೆಯಾಗುವ ಅಥವಾ ನಿರೀಕ್ಷೆಯಂತೆ ಫಲಿತಾಂಶ ಸಿಗದಿರುವ ಸಾಧ್ಯತೆಯನ್ನು ಅಪಾಯ ಎನ್ನುತ್ತಾರೆ. ಹೂಡಿಕೆ ಮಾಡುವ ಮೊದಲು ಅದರ ಸ್ವರೂಪ, ಸಮಯಾವಧಿ, ನಷ್ಟವನ್ನು ಸಹಿಸುವ ಸಾಮರ್ಥ್ಯ ಮತ್ತು ಶುಲ್ಕಗಳನ್ನು ತಿಳಿದುಕೊಳ್ಳಿ."
  },
  scam: {
    title: "Avoiding scams",
    en: "Be cautious of guaranteed high returns, pressure to act immediately, unsolicited offers, and requests to send money to personal accounts. Verify the organisation independently. Never share your PIN, password, or OTP.",
    kn: "ಖಚಿತವಾದ ಹೆಚ್ಚಿನ ಲಾಭದ ಭರವಸೆ, ತಕ್ಷಣ ಹಣ ಹೂಡಲು ಒತ್ತಡ, ಅನಿರೀಕ್ಷಿತ ಆಫರ್‌ಗಳು ಮತ್ತು ವೈಯಕ್ತಿಕ ಖಾತೆಗೆ ಹಣ ಕಳುಹಿಸುವ ಬೇಡಿಕೆಗಳ ಬಗ್ಗೆ ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ. ಸಂಸ್ಥೆಯನ್ನು ಸ್ವತಂತ್ರವಾಗಿ ಪರಿಶೀಲಿಸಿ. ನಿಮ್ಮ PIN, ಪಾಸ್‌ವರ್ಡ್ ಅಥವಾ OTP ಅನ್ನು ಹಂಚಿಕೊಳ್ಳಬೇಡಿ."
  }
};

function saveAll() {
  localStorage.setItem(STORAGE.transactions, JSON.stringify(transactions));
  localStorage.setItem(STORAGE.goals, JSON.stringify(goals));
  localStorage.setItem(STORAGE.quiz, JSON.stringify(quizProgress));
}

function getTotals() {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return { income, expenses, balance: STARTING_BALANCE + income - expenses };
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.id === pageId);
  });

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle("active", button.dataset.page === pageId);
  });

  const activeButton = document.querySelector(`.nav-link[data-page="${pageId}"]`);
  $("page-title").textContent = activeButton
    ? activeButton.querySelector("span").textContent
    : "Dashboard";

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (pageId === "health") renderHealth();
  if (pageId === "goals") renderGoals();
  if (pageId === "market") renderMarket();
  if (pageId === "dashboard") renderDashboard();
}

document.querySelectorAll(".nav-link").forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

// ---------- Dashboard and Money Manager ----------

function renderTransactions() {
  const query = $("tx-search").value.trim().toLowerCase();
  const filter = $("tx-filter").value;

  const filtered = [...transactions]
    .filter(t => filter === "all" || t.type === filter)
    .filter(t => `${t.description} ${t.category} ${t.date}`.toLowerCase().includes(query))
    .sort((a, b) => b.date.localeCompare(a.date));

  $("transaction-table").innerHTML = filtered.map(t => `
    <tr>
      <td>${escapeHTML(t.description)}</td>
      <td>${escapeHTML(t.category)}</td>
      <td>${escapeHTML(t.date)}</td>
      <td>${t.type === "income" ? '<span class="green-text">Income</span>' : '<span class="red-text">Expense</span>'}</td>
      <td class="${t.type === "income" ? "green-text" : "red-text"}">${t.type === "income" ? "+" : "−"}${money(t.amount)}</td>
      <td><button class="delete-button" data-delete="${escapeHTML(t.id)}">Delete</button></td>
    </tr>
  `).join("");

  $("tx-empty").classList.toggle("hidden", filtered.length > 0);

  $("recent-transactions").innerHTML = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
    .map(t => `
      <div class="transaction-row">
        <div class="tx-icon">${t.type === "income" ? "↙" : "↗"}</div>
        <div class="tx-info">
          <strong>${escapeHTML(t.description)}</strong>
          <small>${escapeHTML(t.category)} · ${escapeHTML(t.date)}</small>
        </div>
        <div class="tx-amount ${t.type === "income" ? "green-text" : "red-text"}">
          ${t.type === "income" ? "+" : "−"}${money(t.amount)}
        </div>
      </div>
    `).join("") || '<p class="muted">No transactions yet. Add your first transaction to begin.</p>';

  document.querySelectorAll("[data-delete]").forEach(button => {
    button.addEventListener("click", () => {
      transactions = transactions.filter(t => t.id !== button.dataset.delete);
      saveAll();
      renderAll();
    });
  });
}

$("transaction-form").addEventListener("submit", event => {
  event.preventDefault();

  const amount = Number($("tx-amount").value);
  if (!Number.isFinite(amount) || amount <= 0) {
    alert("Enter an amount greater than zero.");
    return;
  }

  transactions.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    description: $("tx-description").value.trim(),
    amount,
    type: $("tx-type").value,
    category: $("tx-category").value,
    date: $("tx-date").value
  });

  saveAll();
  event.target.reset();
  $("tx-date").value = new Date().toISOString().slice(0, 10);
  renderAll();
});

$("tx-search").addEventListener("input", renderTransactions);
$("tx-filter").addEventListener("change", renderTransactions);

$("export-csv").addEventListener("click", () => {
  const rows = [
    ["Description", "Amount", "Type", "Category", "Date"],
    ...transactions.map(t => [t.description, t.amount, t.type, t.category, t.date])
  ];

  const csv = rows.map(row => row.map(value =>
    `"${String(value).replace(/"/g, '""')}"`
  ).join(",")).join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "investmate-transactions.csv";
  link.click();
  URL.revokeObjectURL(url);
});

function renderDashboard() {
  const totals = getTotals();
  $("dash-balance").textContent = money(totals.balance);
  $("dash-income").textContent = money(totals.income);
  $("dash-expenses").textContent = money(totals.expenses);
  $("dash-health").textContent = `${calculateHealth().score} / 100`;

  const remaining = totals.balance;
  $("dashboard-insight").textContent = remaining < 0
    ? "Your recorded expenses exceed the demo starting balance and income. Review your spending and commitments before planning investments."
    : remaining < 10000
      ? "Your recorded balance is getting low. Review essential expenses and consider building a buffer before making optional purchases."
      : "You have a positive demo balance. Consider tracking your expenses, preparing for unexpected costs, and setting a realistic savings goal.";

  $("dashboard-market").innerHTML = marketData.slice(0, 3).map(stock => `
    <div class="market-mini">
      <span>${escapeHTML(stock.symbol)}</span>
      <strong>${money(stock.price)}</strong>
      <span class="${stock.change >= 0 ? "change-up" : "change-down"}">${stock.change > 0 ? "+" : ""}${stock.change}% sample movement</span>
    </div>
  `).join("");
}

function renderAll() {
  renderTransactions();
  renderDashboard();
  renderHealth();
  renderGoals();
  renderMarket();
  updateQuizStats();
}

// ---------- Financial Health Score ----------

function calculateHealth() {
  const totals = getTotals();
  const income = totals.income;
  const expenses = totals.expenses;
  const balance = totals.balance;

  // Transparent educational indicators, not a formal financial assessment.
  const spendingScore = income > 0
    ? Math.max(0, Math.min(30, Math.round((1 - expenses / income) * 30)))
    : (expenses === 0 ? 20 : 5);

  const reserveScore = Math.max(0, Math.min(30,
    Math.round((Math.max(0, balance) / Math.max(expenses * 3, 10000)) * 30)
  ));

  const trackingScore = Math.min(20, transactions.length * 4);
  const savingsProgress = goals.length
    ? goals.reduce((sum, goal) => sum + Math.min(1, Number(goal.saved) / Number(goal.target)), 0) / goals.length
    : 0;
  const goalScore = goals.length ? Math.round(savingsProgress * 20) : 5;

  const score = Math.max(0, Math.min(100,
    spendingScore + reserveScore + trackingScore + goalScore
  ));

  return {
    score,
    metrics: [
      { label: "Spending pattern", score: spendingScore, max: 30, note: "Based on recorded income and expenses." },
      { label: "Demo balance buffer", score: reserveScore, max: 30, note: "A simplified indicator using your demo balance and recorded expenses." },
      { label: "Money tracking", score: trackingScore, max: 20, note: "More complete records improve the tracking indicator." },
      { label: "Savings goal progress", score: goalScore, max: 20, note: "Based on the progress of your saved goals." }
    ]
  };
}

function renderHealth() {
  const health = calculateHealth();
  $("health-score").textContent = health.score;
  $("health-ring").style.setProperty("--score", `${health.score}%`);

  let label = "Getting started";
  if (health.score >= 80) label = "Strong habits";
  else if (health.score >= 60) label = "Building momentum";
  else if (health.score >= 40) label = "Room to improve";

  $("health-label").textContent = label;
  $("health-summary").textContent =
    "This score is a simplified educational snapshot based on data you entered in this demo. It is not a credit score or a professional assessment.";

  $("health-breakdown").innerHTML = health.metrics.map(metric => `
    <div class="breakdown-item">
      <div><strong>${metric.label}</strong><span>${metric.score}/${metric.max}</span></div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${metric.score / metric.max * 100}%"></div>
      </div>
      <span class="muted">${metric.note}</span>
    </div>
  `).join("");

  const totals = getTotals();
  const tips = [];

  if (!transactions.length) {
    tips.push("Start by recording a few income and expense transactions to make your snapshot more useful.");
  }
  if (totals.expenses > totals.income && totals.income > 0) {
    tips.push("Your recorded expenses exceed recorded income. Review optional spending and check whether all income has been entered.");
  }
  if (totals.balance < 10000) {
    tips.push("Review your emergency savings needs and essential costs before making optional investment decisions.");
  }
  if (!goals.length) {
    tips.push("Create a savings goal with a target date to turn a general intention into a measurable plan.");
  } else if (goals.some(goal => Number(goal.saved) < Number(goal.target))) {
    tips.push("Update your savings progress regularly and check whether the required monthly contribution fits your budget.");
  }
  if (transactions.length < 5) {
    tips.push("Keep recording transactions consistently. Incomplete records can make this score misleading.");
  }
  if (!tips.length) {
    tips.push("Continue reviewing your budget regularly. A high demo score does not mean an investment is safe or suitable.");
  }

  $("health-tips").innerHTML = tips.map(tip =>
    `<div class="tip-item"><span>✓</span><div>${escapeHTML(tip)}</div></div>`
  ).join("");
}

// ---------- Goal-Based Savings Planner ----------

$("goal-form").addEventListener("submit", event => {
  event.preventDefault();

  const target = Number($("goal-target").value);
  const saved = Number($("goal-saved").value);
  const date = $("goal-date").value;

  if (target <= 0 || saved < 0 || !date) {
    alert("Please enter a valid target, amount saved, and target date.");
    return;
  }

  goals.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: $("goal-name").value.trim(),
    target,
    saved: Math.min(saved, target),
    date
  });

  saveAll();
  event.target.reset();
  $("goal-saved").value = "0";
  renderAll();
});

function renderGoals() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  $("goal-list").innerHTML = goals.map(goal => {
    const target = Number(goal.target);
    const saved = Number(goal.saved);
    const remaining = Math.max(0, target - saved);
    const progress = Math.min(100, Math.round(saved / target * 100));
    const targetDate = new Date(`${goal.date}T00:00:00`);
    const daysLeft = Math.ceil((targetDate - today) / 86400000);
    const monthsLeft = Math.max(1, Math.ceil(Math.max(0, daysLeft) / 30.4375));
    const monthly = remaining / monthsLeft;

    let timeMessage = daysLeft < 0
      ? "Target date has passed"
      : daysLeft === 0
        ? "Target date is today"
        : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;

    return `
      <article class="goal-card">
        <h3>${escapeHTML(goal.name)}</h3>
        <p class="muted">${timeMessage} · Target ${escapeHTML(goal.date)}</p>
        <div class="goal-meta"><span>${money(saved)} saved</span><span>${progress}%</span></div>
        <div class="goal-progress"><span style="width:${progress}%"></span></div>
        <div class="goal-meta"><span>Target ${money(target)}</span><span>Remaining ${money(remaining)}</span></div>
        <div class="goal-footer">
          <div><span class="muted">Approx. monthly target</span><br><strong>${money(monthly)}</strong></div>
          <button class="delete-button" data-goal-delete="${escapeHTML(goal.id)}">Delete</button>
        </div>
        <form class="goal-update-form" data-goal-update="${escapeHTML(goal.id)}" style="margin-top:15px">
          <label>Update amount saved (₹)
            <input type="number" min="0" max="${target}" step="0.01" value="${saved}" required>
          </label>
          <button class="secondary-button" style="margin-top:9px" type="submit">Update progress</button>
        </form>
      </article>
    `;
  }).join("") || `<article class="panel"><p class="muted">No savings goals yet. Create your first goal above.</p></article>`;

  document.querySelectorAll("[data-goal-delete]").forEach(button => {
    button.addEventListener("click", () => {
      goals = goals.filter(goal => goal.id !== button.dataset.goalDelete);
      saveAll();
      renderAll();
    });
  });

  document.querySelectorAll("[data-goal-update]").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();
      const goal = goals.find(item => item.id === form.dataset.goalUpdate);
      if (!goal) return;
      const amount = Number(form.querySelector("input").value);
      if (!Number.isFinite(amount) || amount < 0 || amount > Number(goal.target)) {
        alert("Enter a saved amount between zero and the goal target.");
        return;
      }
      goal.saved = amount;
      saveAll();
      renderAll();
    });
  });
}

// ---------- Market Watch: simulated prices only ----------

function renderMarket() {
  $("market-cards").innerHTML = marketData.map(stock => `
    <article class="market-card">
      <span>${escapeHTML(stock.symbol)}</span>
      <h3>${escapeHTML(stock.name)}</h3>
      <p class="muted">${escapeHTML(stock.category)}</p>
      <div class="market-price">${money(stock.price)}</div>
      <span class="${stock.change >= 0 ? "change-up" : "change-down"}">
        ${stock.change > 0 ? "+" : ""}${stock.change}% sample movement
      </span>
      <p class="fine-print">Simulated example; not a live quote or recommendation.</p>
    </article>
  `).join("");
}

// ---------- Stock Affordability Analyzer ----------

function calculateAffordability() {
  const balance = Number($("aff-balance").value);
  const expenses = Number($("aff-expenses").value);
  const savings = Number($("aff-savings").value);
  const stockName = $("aff-stock").value;
  const stock = marketData.find(item => item.name === stockName) || marketData[0];

  if ([balance, expenses, savings].some(value => !Number.isFinite(value) || value < 0)) {
    $("aff-message").textContent = "Enter valid non-negative amounts.";
    return;
  }

  const remainder = balance - expenses - savings;
  const positiveRemainder = Math.max(0, remainder);
  const reserve = positiveRemainder * 0.20;
  const budget = Math.max(0, positiveRemainder - reserve);
  const shares = Math.floor(budget / stock.price);

  $("aff-result").textContent = money(budget);
  $("aff-shares").textContent = shares.toLocaleString("en-IN");
  $("aff-reserve").textContent = money(reserve);
  $("aff-price").textContent = money(stock.price);

  if (remainder < 0) {
    $("aff-message").textContent = "Warning: your entered expenses and commitments exceed the balance. Consider reviewing your budget before considering investments.";
  } else if (budget < stock.price) {
    $("aff-message").textContent = "Your estimated budget is below the sample price of one whole share. Do not stretch your budget to buy a stock.";
  } else {
    $("aff-message").textContent = `Using the sample price, your estimated budget could cover ${shares} whole share(s). This is only an arithmetic estimate, not a recommendation to buy ${stock.name}.`;
  }
}

$("afford-form").addEventListener("submit", event => {
  event.preventDefault();
  calculateAffordability();
});

// ---------- Learn-to-Invest Quiz ----------

function renderQuiz() {
  const quiz = quizzes[currentQuizIndex];
  quizAnswered = false;
  $("quiz-category").textContent = quiz.category;
  $("quiz-number").textContent = `Question ${currentQuizIndex + 1} of ${quizzes.length}`;
  $("quiz-question").textContent = quiz.question;
  $("quiz-feedback").classList.add("hidden");
  $("quiz-next").disabled = true;
  $("quiz-next").textContent = currentQuizIndex === quizzes.length - 1
    ? "Start again ↻"
    : "Next question →";

  $("quiz-options").innerHTML = quiz.options.map((option, index) => `
    <button class="quiz-option" data-option="${index}">${String.fromCharCode(65 + index)}. ${escapeHTML(option)}</button>
  `).join("");

  document.querySelectorAll("[data-option]").forEach(button => {
    button.addEventListener("click", () => answerQuiz(Number(button.dataset.option)));
  });

  updateQuizStats();
}

function answerQuiz(selected) {
  if (quizAnswered) return;
  quizAnswered = true;

  const quiz = quizzes[currentQuizIndex];
  const correct = selected === quiz.answer;
  quizProgress.attempted += 1;

  if (correct) {
    quizProgress.correct += 1;
    quizProgress.points += 10;
  }

  document.querySelectorAll("[data-option]").forEach(button => {
    button.disabled = true;
    const optionIndex = Number(button.dataset.option);
    if (optionIndex === quiz.answer) button.classList.add("correct");
    if (optionIndex === selected && !correct) button.classList.add("wrong");
  });

  $("quiz-feedback").textContent =
    `${correct ? "Correct! +10 points. " : "Not quite. "} ${quiz.explanation}`;
  $("quiz-feedback").classList.remove("hidden");
  $("quiz-next").disabled = false;

  saveAll();
  updateQuizStats();
}

$("quiz-next").addEventListener("click", () => {
  if (!quizAnswered) return;

  if (currentQuizIndex === quizzes.length - 1) {
    currentQuizIndex = 0;
  } else {
    currentQuizIndex += 1;
  }

  renderQuiz();
});

function updateQuizStats() {
  $("quiz-correct").textContent = quizProgress.correct;
  $("quiz-attempted").textContent = quizProgress.attempted;
  $("quiz-points").textContent = quizProgress.points;
}

// ---------- Scam & Investment Safety Checker ----------

const scamPatterns = [
  {
    regex: /\b(guaranteed|assured|fixed)\b.{0,35}\b(returns?|profits?|income|gains?)\b|\b(guaranteed|assured)\s+(returns?|profits?|income|gains?)\b/i,
    title: "Guaranteed-return claim",
    explanation: "Investment returns can vary. A promise of guaranteed high returns deserves careful independent verification."
  },
  {
    regex: /\b(zero risk|no risk|risk[- ]free|without any risk)\b/i,
    title: "Claims of no risk",
    explanation: "Claims that an investment has no risk can be misleading. Understand what could cause a loss."
  },
  {
    regex: /\b(act now|right now|today only|limited time|hurry|urgent|last chance|before midnight)\b/i,
    title: "Pressure to act quickly",
    explanation: "Urgency can be used to stop people from researching an offer properly."
  },
  {
    regex: /\b(double your money|10x|20x|30% monthly|40% monthly|huge profits|get rich quick)\b/i,
    title: "Unusually high profit claim",
    explanation: "Very high or rapid-return promises deserve extra scrutiny and may be unrealistic."
  },
  {
    regex: /\b(everyone is investing|everyone is buying|can't miss|secret opportunity|insider tip)\b/i,
    title: "Social pressure or exclusive-tip claim",
    explanation: "Hype, fear of missing out, and claims of secret information are not proof that an investment is legitimate."
  },
  {
    regex: /\b(send|transfer|pay)\b.{0,45}\b(personal account|gift card|crypto wallet|upfront fee|registration fee)\b/i,
    title: "Potentially suspicious payment request",
    explanation: "Check who receives the money and independently verify the organisation before paying."
  },
  {
    regex: /\b(otp|password|pin|bank details|card number|cvv)\b.{0,45}\b(send|share|provide|tell|message)\b/i,
    title: "Sensitive information request",
    explanation: "Do not share your PIN, password, CVV, or OTP with anyone offering an investment."
  }
];

$("scam-form").addEventListener("submit", event => {
  event.preventDefault();
  const text = $("scam-text").value.trim();

  if (!text) {
    alert("Paste the offer text first.");
    return;
  }

  const flags = scamPatterns.filter(item => item.regex.test(text));
  $("scam-result").classList.remove("hidden");
  $("scam-count").textContent = `${flags.length} warning sign${flags.length === 1 ? "" : "s"}`;

  if (flags.length >= 3) {
    $("scam-heading").textContent = "Several warning signs found";
    $("scam-summary").textContent = "This text contains multiple common warning indicators. Avoid rushing, and verify the offer independently before taking action.";
  } else if (flags.length > 0) {
    $("scam-heading").textContent = "Potential warning signs found";
    $("scam-summary").textContent = "Some wording deserves a closer look. This result does not prove that the offer is fraudulent.";
  } else {
    $("scam-heading").textContent = "No listed warning phrases detected";
    $("scam-summary").textContent = "The checker did not find its known warning phrases. That does not mean the offer is legitimate or safe.";
  }

  $("scam-flags").innerHTML = flags.length
    ? flags.map(flag => `
      <div class="flag-item">
        <strong>⚠ ${escapeHTML(flag.title)}</strong>
        ${escapeHTML(flag.explanation)}
      </div>
    `).join("")
    : `<div class="insight-box">No matching phrases were detected. Still verify the company, registration, fees, risks, and payment details independently.</div>`;

  $("scam-result").scrollIntoView({ behavior: "smooth", block: "start" });
});

// ---------- Kannada + English Money Coach ----------

function renderCoach() {
  const topic = $("coach-topic").value;
  const language = $("global-language").value;
  const content = coachContent[topic];

  $("coach-title").textContent = content.title;
  $("coach-text").textContent = language === "kn" ? content.kn : content.en;
}

$("coach-topic").addEventListener("change", renderCoach);
$("global-language").addEventListener("change", event => {
  localStorage.setItem(STORAGE.language, event.target.value);
  renderCoach();
});

$("speak-coach").addEventListener("click", () => {
  if (!("speechSynthesis" in window)) {
    alert("Text-to-speech is not supported by this browser.");
    return;
  }

  window.speechSynthesis.cancel();
  const language = $("global-language").value;
  const utterance = new SpeechSynthesisUtterance($("coach-text").textContent);
  utterance.lang = language === "kn" ? "kn-IN" : "en-IN";
  window.speechSynthesis.speak(utterance);
});

// ---------- Ask InvestMate: prepared demo responses ----------

function getDemoAnswer(question) {
  const q = question.toLowerCase();

  if (q.includes("budget") || q.includes("spend")) {
    return "Start by recording your income and essential expenses. Set a realistic savings target, review spending regularly, and leave room for unexpected costs. This demo cannot assess your complete financial situation.";
  }

  if (q.includes("diversif")) {
    return "Diversification means spreading investments across different assets instead of relying on one. It can reduce concentration risk, but it cannot guarantee a profit or prevent every loss.";
  }

  if (q.includes("scam") || q.includes("fraud") || q.includes("safe")) {
    return "Be cautious of guaranteed high returns, pressure to act immediately, unsolicited offers, and requests for PINs or OTPs. Verify the provider independently and do not send money just because an offer looks professional.";
  }

  if (q.includes("stock") || q.includes("share")) {
    return "A stock represents ownership in a company and can rise or fall in value. Learn about the company, risks, fees, and your own financial needs before making an investment decision.";
  }

  if (q.includes("saving") || q.includes("goal")) {
    return "Choose a specific target and date, subtract what you have already saved, and divide the remainder by the number of months available. Check that the monthly amount fits your budget.";
  }

  if (q.includes("compound")) {
    return "Compounding happens when returns remain invested and may generate further returns. The result depends on time, fees, and actual performance; investment returns are not guaranteed.";
  }

  return "I can help with basic budgeting, saving, diversification, investing risks, and scam awareness. Try asking one of those questions. These are prepared demo responses, not live AI-generated financial advice.";
}

$("ask-form").addEventListener("submit", event => {
  event.preventDefault();
  const question = $("ask-input").value.trim();
  if (!question) return;
  $("ask-answer").textContent = getDemoAnswer(question);
});

document.querySelectorAll("[data-question]").forEach(button => {
  button.addEventListener("click", () => {
    const question = button.dataset.question;
    $("ask-input").value = question;
    $("ask-answer").textContent = getDemoAnswer(question);
  });
});

// ---------- Initial setup ----------

const today = new Date().toISOString().slice(0, 10);
$("tx-date").value = today;
$("goal-date").value = `${new Date().getFullYear() + 1}-12-31`;

const savedLanguage = localStorage.getItem(STORAGE.language);
if (savedLanguage === "kn" || savedLanguage === "en") {
  $("global-language").value = savedLanguage;
}

renderCoach();
renderQuiz();
renderAll();
calculateAffordability();