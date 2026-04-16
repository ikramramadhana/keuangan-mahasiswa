// app.js
import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

import {
  collection,
  addDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  setDoc,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Toast notification function
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
    warning: 'fa-exclamation-triangle'
  };
  
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  };
  
  toast.className = `${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in max-w-md`;
  toast.innerHTML = `
    <i class="fas ${icons[type]} text-xl"></i>
    <span class="font-medium">${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add animation style
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  .animate-slide-in {
    animation: slide-in 0.3s ease;
  }
`;
document.head.appendChild(style);

const THEME_STORAGE_KEY = "smart-money-manager-theme";
const THEME_STANDARD = "standard";
const THEME_PREMIUM = "premium";
const themeToggle = document.getElementById("themeToggle");
const themeToggleIcon = document.getElementById("themeToggleIcon");
const themeToggleText = document.getElementById("themeToggleText");
const themeMeta = document.querySelector('meta[name="theme-color"]');

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || THEME_STANDARD;
  } catch (error) {
    return THEME_STANDARD;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn("Theme storage unavailable:", error);
  }
}

function applyTheme(theme) {
  const usePremium = theme === THEME_PREMIUM;
  document.body.classList.toggle("theme-premium", usePremium);

  if (themeMeta) {
    themeMeta.setAttribute("content", usePremium ? "#050814" : "#0f172a");
  }

  if (themeToggle) {
    themeToggle.classList.toggle("theme-toggle-active", usePremium);
    themeToggle.setAttribute("aria-pressed", usePremium ? "true" : "false");
  }

  if (themeToggleIcon) {
    themeToggleIcon.className = usePremium ? "fas fa-sun mr-2" : "fas fa-moon mr-2";
  }

  if (themeToggleText) {
    themeToggleText.textContent = usePremium ? "Tema premium aktif" : "Aktifkan tema premium";
  }
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains("theme-premium") ? THEME_STANDARD : THEME_PREMIUM;
  saveTheme(nextTheme);
  applyTheme(nextTheme);
}

applyTheme(getStoredTheme());

if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme);
}

const authSection = document.getElementById("auth-section");
const dashboard = document.getElementById("dashboard");
const isAuthPage = Boolean(authSection);
const isDashboardPage = Boolean(dashboard);
const loginPanel = document.getElementById("loginPanel");
const registerPanel = document.getElementById("registerPanel");
const showLogin = document.getElementById("showLogin");
const showRegister = document.getElementById("showRegister");
const jumpToRegister = document.getElementById("jumpToRegister");
const jumpToLogin = document.getElementById("jumpToLogin");
const authModeNote = document.getElementById("authModeNote");

const btnRegister = document.getElementById("btnRegister");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const userEmail = document.getElementById("userEmail");
const insightText = document.getElementById("insightText");
const insightMeta = document.getElementById("insightMeta");
const chartState = document.getElementById("chartState");
const txListEl = document.getElementById("txList");
const monthlyBudgetInput = document.getElementById("monthlyBudget");
const budgetSaveBtn = document.getElementById("budgetSaveBtn");
const budgetResetBtn = document.getElementById("budgetResetBtn");
const budgetStatus = document.getElementById("budgetStatus");
const budgetProgressLabel = document.getElementById("budgetProgressLabel");
const budgetProgressPercent = document.getElementById("budgetProgressPercent");
const budgetProgressFill = document.getElementById("budgetProgressFill");
const budgetDailyHint = document.getElementById("budgetDailyHint");
const budgetAlertBanner = document.getElementById("budgetAlertBanner");
const chartTitle = document.getElementById("chartTitle");
const chartSubtitle = document.getElementById("chartSubtitle");
const analysisDayBtn = document.getElementById("analysisDay");
const analysisWeekBtn = document.getElementById("analysisWeek");
const analysisMonthBtn = document.getElementById("analysisMonth");
const incomePeriodLabel = document.getElementById("incomePeriodLabel");
const expensePeriodLabel = document.getElementById("expensePeriodLabel");
const balancePeriodLabel = document.getElementById("balancePeriodLabel");

let currentMonthlyBudget = 0;
let lastMonthlyExpense = 0;
let budgetAlertLevel = "none";
let currentAnalysisMode = "monthly";
let currentTransactions = [];

try {
  currentAnalysisMode = localStorage.getItem("smart-money-manager-analysis-mode") || "monthly";
} catch (error) {
  currentAnalysisMode = "monthly";
}

if (analysisDayBtn && analysisWeekBtn && analysisMonthBtn) {
  [analysisDayBtn, analysisWeekBtn, analysisMonthBtn].forEach((button) => {
    button.addEventListener("click", () => setAnalysisMode(button.dataset.mode || "monthly"));
  });
  updateAnalysisSwitch(currentAnalysisMode);
}

function getCurrentMonthKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getBudgetDocRef(uid) {
  const monthKey = getCurrentMonthKey();
  return doc(db, "users", uid, "transactions", `budget_${monthKey}`);
}

async function ensureUserDoc(user) {
  if (!user || !user.uid) return;

  try {
    await setDoc(doc(db, "users", user.uid), {
      email: user.email || "",
      lastLoginAt: serverTimestamp(),
      createdAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Ensure user doc error:", error);
  }
}

function getRemainingDaysInMonth() {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(1, endOfMonth - now.getDate() + 1);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function getModeMeta(mode) {
  if (mode === "daily") {
    return {
      title: "Grafik Harian",
      subtitle: "Distribusi pemasukan dan pengeluaran hari ini per jam",
      periodLabel: "Hari ini",
      cardLabel: "Hari ini",
      emptyMessage: "Belum ada transaksi hari ini. Mulai catat agar analisis harian langsung terbaca."
    };
  }

  if (mode === "weekly") {
    return {
      title: "Grafik Mingguan",
      subtitle: "Ringkasan 7 hari terakhir untuk lihat pola belanja mingguan",
      periodLabel: "7 hari terakhir",
      cardLabel: "7 hari terakhir",
      emptyMessage: "Belum ada transaksi dalam 7 hari terakhir. Tambahkan transaksi untuk melihat pola mingguan."
    };
  }

  return {
    title: "Grafik Bulanan",
    subtitle: "Perbandingan pemasukan dan pengeluaran 6 bulan terakhir",
    periodLabel: "Bulan ini",
    cardLabel: "Bulan ini",
    emptyMessage: "Belum ada data bulanan. Tambah transaksi dulu ya."
  };
}

function getRangeForMode(mode) {
  const now = new Date();

  if (mode === "daily") {
    return {
      start: startOfDay(now),
      end: endOfDay(now)
    };
  }

  if (mode === "weekly") {
    const start = startOfDay(new Date(now));
    start.setDate(start.getDate() - 6);
    return {
      start,
      end: endOfDay(now)
    };
  }

  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: endOfDay(now)
  };
}

function getTransactionDate(transaction) {
  return transaction.date && transaction.date.toDate ? transaction.date.toDate() : new Date();
}

function isFinancialTransaction(transaction) {
  return transaction && (transaction.type === "income" || transaction.type === "expense");
}

function isWithinRange(date, range) {
  return date >= range.start && date <= range.end;
}

function computeSummaryForMode(items, mode) {
  const range = getRangeForMode(mode);
  let income = 0;
  let expense = 0;

  items.forEach((tx) => {
    if (!isFinancialTransaction(tx)) return;
    const txDate = getTransactionDate(tx);
    if (!isWithinRange(txDate, range)) return;

    if (tx.type === "income") {
      income += Number(tx.amount) || 0;
    } else {
      expense += Number(tx.amount) || 0;
    }
  });

  return {
    income,
    expense,
    balance: income - expense,
    ...getModeMeta(mode)
  };
}

function computeLifetimeBalance(items) {
  return items.reduce((total, tx) => {
    if (!isFinancialTransaction(tx)) return total;
    const amount = Number(tx.amount) || 0;
    return tx.type === "income" ? total + amount : total - amount;
  }, 0);
}

function updateSummaryCards(summary, lifetimeBalance = summary.balance) {
  const periodLabel = summary.cardLabel || "Bulan ini";

  const incomeCard = document.getElementById("income");
  const expenseCard = document.getElementById("expense");
  const balanceCard = document.getElementById("balance");

  if (incomeCard) incomeCard.innerText = "Rp " + summary.income.toLocaleString("id-ID");
  if (expenseCard) expenseCard.innerText = "Rp " + summary.expense.toLocaleString("id-ID");
  if (balanceCard) balanceCard.innerText = "Rp " + lifetimeBalance.toLocaleString("id-ID");

  if (incomePeriodLabel) {
    incomePeriodLabel.innerHTML = `<i class="fas fa-chart-line mr-1"></i>${periodLabel}`;
  }
  if (expensePeriodLabel) {
    expensePeriodLabel.innerHTML = `<i class="fas fa-shopping-cart mr-1"></i>${periodLabel}`;
  }
  if (balancePeriodLabel) {
    balancePeriodLabel.innerHTML = `<i class="fas fa-coins mr-1"></i>Saldo tersimpan`;
  }
}

function updateAnalysisSwitch(mode) {
  const buttons = [analysisDayBtn, analysisWeekBtn, analysisMonthBtn].filter(Boolean);
  buttons.forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("analysis-btn-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  if (chartTitle) {
    chartTitle.textContent = getModeMeta(mode).title;
  }

  if (chartSubtitle) {
    chartSubtitle.textContent = getModeMeta(mode).subtitle;
  }
}

function setAnalysisMode(mode) {
  currentAnalysisMode = mode;
  try {
    localStorage.setItem("smart-money-manager-analysis-mode", mode);
  } catch (error) {
    console.warn("Analysis mode storage unavailable:", error);
  }
  updateAnalysisSwitch(mode);
  if (currentTransactions.length > 0) {
    renderDashboardState(currentTransactions);
  }
}

function renderBudgetProgress(expenseValue = 0) {
  if (!budgetStatus || !budgetProgressLabel || !budgetProgressPercent || !budgetProgressFill) return;

  const budget = currentMonthlyBudget;
  const expense = Number(expenseValue) || 0;

  if (!budget || budget <= 0) {
    budgetStatus.textContent = "Belum diatur";
    budgetStatus.className = "text-xs font-semibold px-3 py-1 rounded-full bg-slate-500/30 text-slate-100";
    budgetProgressLabel.textContent = "Belum ada budget bulan ini.";
    budgetProgressPercent.textContent = "0%";
    budgetProgressFill.style.width = "0%";
    budgetProgressFill.style.background = "linear-gradient(90deg, #22c55e, #10b981)";
    if (budgetAlertBanner) {
      budgetAlertBanner.className = "budget-alert-banner hidden mb-3 sm:mb-4";
      budgetAlertBanner.innerHTML = "";
    }
    if (budgetDailyHint) {
      budgetDailyHint.textContent = "Set budget dulu untuk lihat estimasi jatah harian.";
    }
    return;
  }

  const percent = Math.round((expense / budget) * 100);
  const cappedPercent = Math.max(0, Math.min(percent, 100));
  const remaining = budget - expense;

  budgetProgressLabel.textContent = `Terpakai Rp ${expense.toLocaleString("id-ID")} dari budget Rp ${budget.toLocaleString("id-ID")}`;
  budgetProgressPercent.textContent = `${Math.max(0, percent)}%`;
  budgetProgressFill.style.width = `${cappedPercent}%`;

  if (percent >= 100) {
    budgetStatus.textContent = "Overbudget";
    budgetStatus.className = "text-xs font-semibold px-3 py-1 rounded-full bg-red-500/25 text-red-100";
    budgetProgressFill.style.background = "linear-gradient(90deg, #f97316, #ef4444)";
  } else if (percent >= 80) {
    budgetStatus.textContent = "Waspada";
    budgetStatus.className = "text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/25 text-amber-100";
    budgetProgressFill.style.background = "linear-gradient(90deg, #f59e0b, #f97316)";
  } else {
    budgetStatus.textContent = "Aman";
    budgetStatus.className = "text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/25 text-emerald-100";
    budgetProgressFill.style.background = "linear-gradient(90deg, #22c55e, #10b981)";
  }

  if (budgetAlertBanner) {
    budgetAlertBanner.classList.remove("hidden", "is-safe", "is-warning", "is-critical");
    if (percent >= 100) {
      budgetAlertBanner.classList.add("is-critical");
      budgetAlertBanner.innerHTML = '<i class="fas fa-triangle-exclamation mr-2"></i>Budget terlampaui. Hentikan pengeluaran non-prioritas sekarang.';
    } else if (percent >= 95) {
      budgetAlertBanner.classList.add("is-critical");
      budgetAlertBanner.innerHTML = '<i class="fas fa-bolt mr-2"></i>Budget tinggal sangat sedikit. Jaga pengeluaran sampai akhir bulan.';
    } else if (percent >= 80) {
      budgetAlertBanner.classList.add("is-warning");
      budgetAlertBanner.innerHTML = `<i class="fas fa-circle-exclamation mr-2"></i>Budget sudah terpakai ${Math.max(0, percent)}%. Sisa ruang gerak makin tipis.`;
    } else {
      budgetAlertBanner.classList.add("hidden");
      budgetAlertBanner.innerHTML = "";
    }
  }

  if (remaining < 0) {
    budgetProgressLabel.textContent += ` • Lewat Rp ${Math.abs(remaining).toLocaleString("id-ID")}`;
    if (budgetDailyHint) {
      budgetDailyHint.textContent = "Budget sudah terlewati. Fokus kurangi pengeluaran sampai akhir bulan.";
    }
  } else {
    budgetProgressLabel.textContent += ` • Sisa Rp ${remaining.toLocaleString("id-ID")}`;
    if (budgetDailyHint) {
      const daysLeft = getRemainingDaysInMonth();
      const safeDailySpend = Math.floor(remaining / daysLeft);
      budgetDailyHint.textContent = `Estimasi jatah harian: Rp ${safeDailySpend.toLocaleString("id-ID")} untuk ${daysLeft} hari ke depan.`;
    }
  }

  if (percent >= 100 && budgetAlertLevel !== "over") {
    showToast("Budget bulan ini terlampaui! Saatnya rem pengeluaran.", "warning");
    budgetAlertLevel = "over";
  } else if (percent >= 95 && budgetAlertLevel !== "critical") {
    showToast("Budget hampir habis. Tinggal sedikit ruang untuk pengeluaran berikutnya.", "error");
    budgetAlertLevel = "critical";
  } else if (percent >= 80 && budgetAlertLevel !== "warn" && budgetAlertLevel !== "critical" && budgetAlertLevel !== "over") {
    showToast("Pengeluaran sudah di atas 80% budget bulan ini.", "info");
    budgetAlertLevel = "warn";
  } else if (percent < 80) {
    budgetAlertLevel = "safe";
  }
}

function startBudgetRealtimeListener(uid) {
  if (!uid) return;

  if (budgetUnsubscribe) {
    budgetUnsubscribe();
    budgetUnsubscribe = null;
  }

  budgetUnsubscribe = onSnapshot(getBudgetDocRef(uid), (snap) => {
    const savedBudget = snap.exists() ? (Number(snap.data().amount) || 0) : 0;

    currentMonthlyBudget = savedBudget;
    budgetAlertLevel = "safe";

    if (monthlyBudgetInput) {
      monthlyBudgetInput.value = savedBudget > 0 ? formatRupiah(savedBudget) : "";
    }

    renderBudgetProgress(lastMonthlyExpense);
  }, (error) => {
    console.error("Load budget error:", error);
    const code = error && error.code ? ` (${error.code})` : "";
    showToast(`Gagal sinkron budget bulanan dari cloud${code}.`, "error");
  });
}

if (budgetSaveBtn) {
  budgetSaveBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) {
      showToast("Silakan login dulu untuk menyimpan budget.", "warning");
      return;
    }

    const rawValue = monthlyBudgetInput ? monthlyBudgetInput.value.trim() : "";
    const parsedBudget = parseRupiah(rawValue);

    if (!parsedBudget || parsedBudget <= 0) {
      showToast("Masukkan budget valid lebih dari 0.", "warning");
      return;
    }

    budgetSaveBtn.disabled = true;
    budgetSaveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';

    try {
      const monthKey = getCurrentMonthKey();
      await setDoc(getBudgetDocRef(user.uid), {
        type: "budget_meta",
        monthKey,
        amount: parsedBudget,
        updatedAt: serverTimestamp()
      }, { merge: true });

      currentMonthlyBudget = parsedBudget;
      budgetAlertLevel = "none";
      if (monthlyBudgetInput) {
        monthlyBudgetInput.value = formatRupiah(parsedBudget);
      }
      renderBudgetProgress(lastMonthlyExpense);
      showToast("Budget bulanan berhasil disimpan.", "success");
    } catch (error) {
      console.error("Save budget error:", error);
      const code = error && error.code ? ` (${error.code})` : "";
      showToast(`Gagal menyimpan budget ke cloud${code}. Periksa Firestore Rules atau koneksi internet.`, "error");
    } finally {
      budgetSaveBtn.disabled = false;
      budgetSaveBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Simpan Budget';
    }
  });
}

if (budgetResetBtn) {
  budgetResetBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) {
      showToast("Silakan login dulu untuk reset budget.", "warning");
      return;
    }

    budgetResetBtn.disabled = true;
    budgetResetBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Mereset...';

    try {
      const monthKey = getCurrentMonthKey();
      await setDoc(getBudgetDocRef(user.uid), {
        type: "budget_meta",
        monthKey,
        amount: 0,
        updatedAt: serverTimestamp()
      }, { merge: true });

      currentMonthlyBudget = 0;
      budgetAlertLevel = "none";
      if (monthlyBudgetInput) {
        monthlyBudgetInput.value = "";
      }
      renderBudgetProgress(lastMonthlyExpense);
      showToast("Budget bulan ini berhasil direset.", "info");
    } catch (error) {
      console.error("Reset budget error:", error);
      const code = error && error.code ? ` (${error.code})` : "";
      showToast(`Gagal reset budget di cloud${code}. Periksa Firestore Rules atau koneksi internet.`, "error");
    } finally {
      budgetResetBtn.disabled = false;
      budgetResetBtn.innerHTML = '<i class="fas fa-rotate-left mr-2"></i>Reset';
    }
  });
}

function setChartState(visible, message = "", stateType = "loading") {
  if (!chartState) return;
  chartState.style.display = visible ? "flex" : "none";
  if (!visible) return;

  if (stateType === "empty") {
    chartState.innerHTML = `
      <div class="chart-empty-wrap">
        <i class="fas fa-chart-simple chart-empty-icon"></i>
        <p class="chart-empty-title">Belum ada data pada periode ini</p>
        <p class="chart-state-copy">${message}</p>
      </div>
    `;
    return;
  }

  if (stateType === "error") {
    chartState.innerHTML = `
      <div class="chart-empty-wrap">
        <i class="fas fa-triangle-exclamation chart-empty-icon"></i>
        <p class="chart-empty-title">Grafik gagal dimuat</p>
        <p class="chart-state-copy">${message}</p>
      </div>
    `;
    return;
  }

  chartState.innerHTML = `
    <div class="skeleton shimmer w-40 h-3 rounded-full mb-3"></div>
    <div class="skeleton shimmer w-full h-40 rounded-lg"></div>
    <p class="chart-state-copy">${message || "Menyiapkan grafik..."}</p>
  `;
}

function getModeLoadingMessage(mode) {
  if (mode === "daily") {
    return "Menyiapkan grafik harian...";
  }
  if (mode === "weekly") {
    return "Menyiapkan grafik mingguan...";
  }
  return "Menyiapkan grafik bulanan...";
}

function renderHistoryLoading() {
  if (!txListEl) return;
  txListEl.innerHTML = `
    <div class="tx-loading">
      <div class="tx-loading-item shimmer"></div>
      <div class="tx-loading-item shimmer"></div>
      <div class="tx-loading-item shimmer"></div>
    </div>
  `;
}

function renderDashboardState(items) {
  currentTransactions = items;

  const financialItems = items.filter(isFinancialTransaction);

  const analysisSummary = computeSummaryForMode(financialItems, currentAnalysisMode);
  const monthlySummary = computeSummaryForMode(financialItems, "monthly");
  const lifetimeBalance = computeLifetimeBalance(financialItems);

  // Keep main cards tied to monthly figures so balance stays consistent.
  updateSummaryCards(monthlySummary, lifetimeBalance);
  lastMonthlyExpense = monthlySummary.expense;
  renderBudgetProgress(monthlySummary.expense);
  renderInsight(financialItems, monthlySummary);
  renderChartByMode(financialItems, currentAnalysisMode);
}

function renderInsight(items, summary) {
  if (!insightText || !insightMeta) return;

  const { income, expense, balance } = summary;
  const periodText = summary.periodLabel || "periode ini";
  const expenseRatio = income > 0 ? Math.round((expense / income) * 100) : 0;
  const statusTone = balance >= 0 ? "aman" : "waspada";

  let sentence = "Belum ada transaksi. Yuk catat pemasukan atau pengeluaran pertama kamu.";
  if (items.length > 0) {
    if (income === 0 && expense > 0) {
      sentence = `Pengeluaran berjalan tanpa pemasukan pada ${periodText.toLowerCase()}. Prioritaskan pemasukan dulu agar arus kas stabil.`;
    } else if (expenseRatio >= 80) {
      sentence = `Pengeluaran sudah ${expenseRatio}% dari pemasukan pada ${periodText.toLowerCase()}. Kurangi belanja non-prioritas untuk jaga saldo.`;
    } else if (balance >= 0) {
      sentence = `Arus kas kamu cukup sehat untuk ${periodText.toLowerCase()}. Pertahankan ritme ini dan sisihkan sebagian untuk tabungan.`;
    } else {
      sentence = `Saldo pada ${periodText.toLowerCase()} negatif. Tekan pengeluaran harian dan fokus ke kebutuhan utama.`;
    }
  }

  insightText.innerHTML = `<i class="fas fa-sparkles text-amber-300 mr-2"></i>${sentence}`;
  insightMeta.innerHTML = `
    <span class="insight-pill"><i class="fas fa-calendar-day"></i>${periodText}</span>
    <span class="insight-pill"><i class="fas fa-wave-square"></i>${items.length} transaksi</span>
    <span class="insight-pill"><i class="fas fa-percent"></i>rasio belanja ${Math.max(0, expenseRatio)}%</span>
    <span class="insight-pill"><i class="fas fa-shield-heart"></i>status ${statusTone}</span>
    <span class="insight-pill"><i class="fas fa-wallet"></i>saldo Rp ${Math.abs(balance).toLocaleString('id-ID')}</span>
  `;
}

function setAuthMode(mode) {
  if (!isAuthPage) return;

  const isLogin = mode === "login";
  const activePanel = isLogin ? loginPanel : registerPanel;

  loginPanel.classList.toggle("auth-view-hidden", !isLogin);
  registerPanel.classList.toggle("auth-view-hidden", isLogin);

  activePanel.classList.remove("panel-pop");
  requestAnimationFrame(() => {
    activePanel.classList.add("panel-pop");
  });

  authModeNote.textContent = isLogin
    ? "Masuk untuk lanjut ke dashboard keuangan kamu."
    : "Buat akun baru dulu, lalu kamu bisa masuk ke dashboard.";

  showLogin.classList.toggle("bg-white", isLogin);
  showLogin.classList.toggle("text-blue-600", isLogin);
  showLogin.classList.toggle("shadow-sm", isLogin);
  showLogin.classList.toggle("switch-btn-inactive", !isLogin);
  showLogin.classList.toggle("ring-1", isLogin);
  showLogin.classList.toggle("ring-blue-200", isLogin);

  showRegister.classList.toggle("bg-white", !isLogin);
  showRegister.classList.toggle("text-amber-500", !isLogin);
  showRegister.classList.toggle("shadow-sm", !isLogin);
  showRegister.classList.toggle("switch-btn-inactive", isLogin);
  showRegister.classList.toggle("ring-1", !isLogin);
  showRegister.classList.toggle("ring-green-200", !isLogin);
}

if (isAuthPage && showLogin && showRegister && jumpToRegister && jumpToLogin) {
  showLogin.onclick = () => setAuthMode("login");
  showRegister.onclick = () => setAuthMode("register");
  jumpToRegister.onclick = () => setAuthMode("register");
  jumpToLogin.onclick = () => setAuthMode("login");
  setAuthMode("login");
}

// Register function with validation
if (btnRegister) btnRegister.onclick = async () => {
  const email = document.getElementById("regEmail").value.trim();
  const pass = document.getElementById("regPassword").value;
  
  // Validation
  if (!email) {
    showToast("Email tidak boleh kosong!", "warning");
    return;
  }
  if (!pass || pass.length < 6) {
    showToast("Password minimal 6 karakter!", "warning");
    return;
  }
  
  // Disable button while processing
  btnRegister.disabled = true;
  btnRegister.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Mendaftar...';
  
  try {
    await createUserWithEmailAndPassword(auth, email, pass);
    showToast("Registrasi berhasil! Selamat datang!", "success");
    // Clear form
    document.getElementById("regEmail").value = "";
    document.getElementById("regPassword").value = "";
  } catch (e) {
    console.error("Register error:", e);
    let errorMsg = "Registrasi gagal!";
    if (e.code === 'auth/email-already-in-use') {
      errorMsg = "Email sudah terdaftar!";
    } else if (e.code === 'auth/invalid-email') {
      errorMsg = "Format email tidak valid!";
    } else if (e.code === 'auth/weak-password') {
      errorMsg = "Password terlalu lemah!";
    }
    showToast(errorMsg, "error");
  } finally {
    btnRegister.disabled = false;
    btnRegister.innerHTML = '<i class="fas fa-user-plus mr-2"></i>Daftar Sekarang';
  }
};

// Login function with validation
if (btnLogin) btnLogin.onclick = async () => {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPassword").value;
  
  // Validation
  if (!email) {
    showToast("Email tidak boleh kosong!", "warning");
    return;
  }
  if (!pass) {
    showToast("Password tidak boleh kosong!", "warning");
    return;
  }
  
  // Disable button while processing
  btnLogin.disabled = true;
  btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Masuk...';
  
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    showToast("Login berhasil! Selamat datang kembali!", "success");
    // Clear form
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
  } catch (e) {
    console.error("Login error:", e);
    let errorMsg = "Login gagal!";
    if (e.code === 'auth/user-not-found') {
      errorMsg = "Email tidak terdaftar!";
    } else if (e.code === 'auth/wrong-password') {
      errorMsg = "Password salah!";
    } else if (e.code === 'auth/invalid-email') {
      errorMsg = "Format email tidak valid!";
    } else if (e.code === 'auth/invalid-credential') {
      errorMsg = "Email atau password salah!";
    }
    showToast(errorMsg, "error");
  } finally {
    btnLogin.disabled = false;
    btnLogin.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Masuk';
  }
};

// Logout function
if (btnLogout) {
  btnLogout.onclick = async () => {
    try {
      await signOut(auth);
      showToast("Logout berhasil!", "info");
    } catch (e) {
      console.error("Logout error:", e);
      showToast("Logout gagal!", "error");
    }
  };
}

// Enter key support for register
if (isAuthPage) {
  document.getElementById("regEmail").addEventListener("keypress", (e) => {
    if (e.key === "Enter") document.getElementById("regPassword").focus();
  });
  document.getElementById("regPassword").addEventListener("keypress", (e) => {
    if (e.key === "Enter") btnRegister.click();
  });
}

// Enter key support for login
if (isAuthPage) {
  document.getElementById("loginEmail").addEventListener("keypress", (e) => {
    if (e.key === "Enter") document.getElementById("loginPassword").focus();
  });
  document.getElementById("loginPassword").addEventListener("keypress", (e) => {
    if (e.key === "Enter") btnLogin.click();
  });
}

// Format Rupiah input
const amountInput = document.getElementById("amount");

// Format angka ke Rupiah Indonesia (10000 -> 10.000)
function formatRupiah(angka) {
  if (!angka) return '';
  const numberString = angka.toString().replace(/[^,\d]/g, '');
  const split = numberString.split(',');
  const sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    const separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }

  rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  return rupiah;
}

// Parse Rupiah ke angka - support format Indo & International
// Support: 1.000.000 atau 1,000,000 atau 1000000
function parseRupiah(input) {
  if (!input) return 0;
  
  const str = input.toString().trim();
  
  // Deteksi format berdasarkan karakter terakhir sebelum angka
  // Format Indo: 1.000.000,50 (titik=ribuan, koma=desimal)
  // Format International: 1,000,000.50 (koma=ribuan, titik=desimal)
  
  // Cek apakah ada koma DAN titik
  const hasComma = str.includes(',');
  const hasDot = str.includes('.');
  
  let cleanNumber;
  
  if (hasComma && hasDot) {
    // Ada keduanya, deteksi format
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');
    
    if (lastComma > lastDot) {
      // Format Indo: 1.000.000,50
      cleanNumber = str.replace(/\./g, '').replace(',', '.');
    } else {
      // Format International: 1,000,000.50
      cleanNumber = str.replace(/,/g, '');
    }
  } else if (hasComma) {
    // Hanya ada koma
    // Bisa Indo (desimal) atau International (ribuan)
    const commaPos = str.indexOf(',');
    const afterComma = str.substring(commaPos + 1);
    
    if (afterComma.length <= 2) {
      // Kemungkinan desimal: 1000,50
      cleanNumber = str.replace(',', '.');
    } else {
      // Kemungkinan ribuan: 1,000,000
      cleanNumber = str.replace(/,/g, '');
    }
  } else if (hasDot) {
    // Hanya ada titik
    // Bisa Indo (ribuan) atau International (desimal)
    const dotPos = str.indexOf('.');
    const afterDot = str.substring(dotPos + 1);
    
    if (afterDot.length <= 2) {
      // Kemungkinan desimal: 1000.50
      cleanNumber = str;
    } else {
      // Kemungkinan ribuan: 1.000.000
      cleanNumber = str.replace(/\./g, '');
    }
  } else {
    // Tidak ada pemisah
    cleanNumber = str;
  }
  
  // Parse ke float lalu bulatkan
  const result = Math.round(parseFloat(cleanNumber) || 0);
  return result;
}

if (amountInput) {
  // Event saat user mengetik di input nominal
  amountInput.addEventListener('keyup', function(e) {
    let value = this.value;

    // Hapus semua karakter selain angka
    value = value.replace(/[^0-9]/g, '');

    // Format selalu ke Rupiah Indonesia (ribuan dengan titik)
    this.value = formatRupiah(value);
  });

  // Prevent invalid characters (hanya angka)
  amountInput.addEventListener('keypress', function(e) {
    const char = String.fromCharCode(e.which);
    // Hanya izinkan angka 0-9
    if (!/[0-9]/.test(char)) {
      e.preventDefault();
    }
  });
}

if (monthlyBudgetInput) {
  monthlyBudgetInput.addEventListener('keyup', function() {
    let value = this.value;
    value = value.replace(/[^0-9]/g, '');
    this.value = formatRupiah(value);
  });

  monthlyBudgetInput.addEventListener('keypress', function(e) {
    const char = String.fromCharCode(e.which);
    if (!/[0-9]/.test(char) && e.key !== 'Enter') {
      e.preventDefault();
    }
    if (e.key === 'Enter' && budgetSaveBtn) {
      budgetSaveBtn.click();
    }
  });
}

// Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in:", user.email);
    ensureUserDoc(user);
    if (isAuthPage && !isDashboardPage) {
      window.location.replace("./dashboard.html");
      return;
    }

    if (isDashboardPage) {
      dashboard.classList.remove("hidden");
      if (userEmail) userEmail.innerText = user.email;
      startRealtime(user.uid);
    }
  } else {
    console.log("User logged out");
    if (isDashboardPage) {
      window.location.replace("./index.html");
      return;
    }

    if (isAuthPage) {
      authSection.classList.remove("hidden");
      if (userEmail) userEmail.innerText = "";
    }
  }
});

// Add transaction with better validation and feedback
const saveBtnElement = document.getElementById("saveBtn");
if (saveBtnElement) saveBtnElement.addEventListener("click", async () => {
  const type = document.getElementById("type").value;
  const amountFormatted = document.getElementById("amount").value.trim();
  const amount = parseRupiah(amountFormatted); // Parse format Rupiah ke angka
  
  console.log("=== DEBUG SAVE ===");
  console.log("Input value:", amountFormatted);
  console.log("Parsed amount:", amount);
  console.log("Amount > 0?", amount > 0);
  
  const category = document.getElementById("category").value.trim();
  const note = document.getElementById("note").value.trim();
  const user = auth.currentUser;
  
  if (!user) { 
    showToast("Silakan login terlebih dahulu!", "warning");
    return; 
  }
  
  if (!category) {
    showToast("Kategori harus diisi!", "warning");
    return;
  }
  
  if (!amount || amount <= 0) { 
    showToast("Masukkan nominal yang valid (lebih dari 0)!", "warning");
    console.error("Validation failed - amount:", amount);
    return; 
  }

  const saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';

  try {
    console.log("Attempting to save transaction...", {
      userId: user.uid,
      type,
      amount,
      category
    });
    
    await addDoc(collection(db, "users", user.uid, "transactions"), {
      type,
      amount,
      category,
      note: note || "",
      date: serverTimestamp()
    });
    
    console.log("Transaction saved successfully!");
    showToast(`Transaksi ${type === 'income' ? 'pemasukan' : 'pengeluaran'} berhasil ditambahkan!`, "success");
    
    // reset form
    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";
    document.getElementById("note").value = "";
    document.getElementById("type").value = "income";
  } catch (e) {
    console.error("Save transaction error:", e);
    console.error("Error code:", e.code);
    console.error("Error message:", e.message);
    
    let errorMsg = "Gagal menyimpan transaksi!";
    if (e.code === 'permission-denied') {
      errorMsg = "Akses ditolak! Periksa Firestore Rules di Firebase Console.";
    } else if (e.message) {
      errorMsg = "Error: " + e.message;
    }
    showToast(errorMsg, "error");
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Simpan Transaksi';
  }
});

// Event saat user mengetik di input nominal
if (amountInput) {
  amountInput.addEventListener('keyup', function(e) {
    let value = this.value;

    // Hapus semua karakter kecuali angka
    value = value.replace(/[^0-9]/g, '');

    // Format selalu ke gaya Indonesia (10.000, 1.000.000)
    this.value = formatRupiah(value);
  });
}

let unsubscribe = null;
let budgetUnsubscribe = null;
let chart = null;

function stopRealtime(){
  if (unsubscribe) unsubscribe();
  if (budgetUnsubscribe) budgetUnsubscribe();
  unsubscribe = null;
  budgetUnsubscribe = null;
  // clear UI
  document.getElementById("income").innerText = "Rp 0";
  document.getElementById("expense").innerText = "Rp 0";
  document.getElementById("balance").innerText = "Rp 0";
  if (txListEl) txListEl.innerHTML = "";
  setChartState(true, getModeLoadingMessage(currentAnalysisMode), "loading");
  if (insightText) {
    insightText.innerHTML = '<i class="fas fa-sparkles text-amber-300 mr-2"></i>Masuk ke akun untuk melihat insight keuangan kamu.';
  }
  if (insightMeta) {
    insightMeta.innerHTML = "";
  }
  currentMonthlyBudget = 0;
  lastMonthlyExpense = 0;
  budgetAlertLevel = "none";
  if (monthlyBudgetInput) {
    monthlyBudgetInput.value = "";
  }
  renderBudgetProgress(0);
  if (chart) {
    chart.destroy();
    chart = null;
  }
}

function startRealtime(uid){
  console.log("Starting realtime listener for user:", uid);
  renderHistoryLoading();
  updateAnalysisSwitch(currentAnalysisMode);
  setChartState(true, getModeLoadingMessage(currentAnalysisMode), "loading");
  startBudgetRealtimeListener(uid);
  const txColl = collection(db, "users", uid, "transactions");
  const q = query(txColl, orderBy("date", "desc"));
  unsubscribe = onSnapshot(q, (snapshot) => {
    console.log("Received", snapshot.size, "transactions");
    const items = [];
    snapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });
    renderTransactions(items);
    renderDashboardState(items);
  }, (error) => {
    console.error("Snapshot error:", error);
    console.error("Error code:", error.code);
    setChartState(true, "Gagal memuat grafik. Coba muat ulang halaman.", "error");
    if (error.code === 'permission-denied') {
      showToast("Akses ditolak! Silakan atur Firestore Rules di Firebase Console.", "error");
    } else {
      showToast("Gagal memuat data: " + error.message, "error");
    }
  });
}

function renderTransactions(items) {
  const ul = txListEl;
  if (!ul) return;
  ul.innerHTML = "";
  const financialItems = items.filter(isFinancialTransaction);
  
  if (financialItems.length === 0) {
    ul.innerHTML = `
      <div class="tx-empty">
        <i class="fas fa-receipt"></i>
        <p class="tx-empty-title">Riwayat transaksi masih kosong</p>
        <p class="tx-empty-copy">Mulai dari transaksi pertama agar grafik dan insight jadi lebih akurat.</p>
      </div>
    `;
    return;
  }
  
  financialItems.slice(0, 50).forEach(tx => {
    const li = document.createElement("li");
    const d = tx.date && tx.date.toDate ? tx.date.toDate() : new Date();
    
    // Icon berdasarkan kategori
    let icon = 'fa-circle';
    const cat = tx.category.toLowerCase();
    if (cat.includes('makan') || cat.includes('food')) icon = 'fa-utensils';
    else if (cat.includes('transport')) icon = 'fa-car';
    else if (cat.includes('belanja') || cat.includes('shopping')) icon = 'fa-shopping-bag';
    else if (cat.includes('pulsa') || cat.includes('internet')) icon = 'fa-wifi';
    else if (cat.includes('hiburan') || cat.includes('film')) icon = 'fa-film';
    else if (cat.includes('kesehatan')) icon = 'fa-heartbeat';
    else if (cat.includes('pendidikan') || cat.includes('buku')) icon = 'fa-book';
    else if (cat.includes('gaji') || cat.includes('uang saku')) icon = 'fa-money-bill-wave';
    
    const typeColor = tx.type === 'expense' ? 'red' : 'green';
    const typeBg = tx.type === 'expense' ? 'bg-red-50' : 'bg-green-50';
    const typeIcon = tx.type === 'expense' ? 'fa-arrow-up' : 'fa-arrow-down';
    
    li.className = `flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all ${typeBg}`;
    li.innerHTML = `
      <div class="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <div class="p-2 sm:p-3 bg-white rounded-lg shadow-sm flex-shrink-0">
          <i class="fas ${icon} text-${typeColor}-600 text-base sm:text-xl"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="font-semibold text-gray-800 text-sm sm:text-base">${tx.category}</span>
            <span class="px-2 py-0.5 text-xs rounded-full ${tx.type === 'expense' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">
              <i class="fas ${typeIcon} mr-1"></i>${tx.type === 'expense' ? 'Keluar' : 'Masuk'}
            </span>
          </div>
          ${tx.note ? `<div class="text-xs sm:text-sm text-gray-600 mb-1 truncate"><i class="fas fa-sticky-note mr-1"></i>${tx.note}</div>` : ''}
          <div class="text-xs text-gray-400">
            <i class="fas fa-clock mr-1"></i>${d.toLocaleDateString('id-ID', { 
              day: 'numeric', 
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
      <div class="text-right flex-shrink-0 ml-2">
        <div class="text-base sm:text-xl font-bold ${tx.type === 'expense' ? 'text-red-600' : 'text-green-600'}">
            ${tx.type === 'expense' ? '-' : ''}Rp ${formatRupiah(tx.amount)}
          </div>
      </div>
    `;
    ul.appendChild(li);
  });
}

function computeSummary(items) {
  // compute for current month
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();
  let income = 0, expense = 0;
  items.forEach(tx => {
    const d = tx.date && tx.date.toDate ? tx.date.toDate() : new Date();
    if (d.getMonth() === m && d.getFullYear() === y) {
      if (tx.type === "income") income += tx.amount;
      else expense += tx.amount;
    }
  });
  document.getElementById("income").innerText = 'Rp ' + income.toLocaleString('id-ID');
  document.getElementById("expense").innerText = 'Rp ' + expense.toLocaleString('id-ID');
  const balance = income - expense;
  document.getElementById("balance").innerText = 'Rp ' + balance.toLocaleString('id-ID');
  lastMonthlyExpense = expense;
  renderBudgetProgress(expense);
  return { income, expense, balance };
}

function renderChartByMode(items, mode = currentAnalysisMode) {
  const labels = [];
  const incomeData = [];
  const expenseData = [];
  const analysisMeta = getModeMeta(mode);
  const now = new Date();
  const range = getRangeForMode(mode);

  if (mode === "daily") {
    for (let hour = 0; hour < 24; hour += 1) {
      labels.push(`${String(hour).padStart(2, "0")}:00`);
      incomeData.push(0);
      expenseData.push(0);
    }

    items.forEach((tx) => {
      if (!isFinancialTransaction(tx)) return;
      const txDate = getTransactionDate(tx);
      if (!isWithinRange(txDate, range)) return;

      const hour = txDate.getHours();
      if (tx.type === "income") {
        incomeData[hour] += Number(tx.amount) || 0;
      } else {
        expenseData[hour] += Number(tx.amount) || 0;
      }
    });
  } else if (mode === "weekly") {
    const startDate = new Date(range.start);

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + dayIndex);
      labels.push(currentDay.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }));
      incomeData.push(0);
      expenseData.push(0);
    }

    items.forEach((tx) => {
      if (!isFinancialTransaction(tx)) return;
      const txDate = getTransactionDate(tx);
      if (!isWithinRange(txDate, range)) return;

      const dayIndex = Math.floor((startOfDay(txDate) - startOfDay(range.start)) / 86400000);
      if (dayIndex < 0 || dayIndex > 6) return;

      if (tx.type === "income") {
        incomeData[dayIndex] += Number(tx.amount) || 0;
      } else {
        expenseData[dayIndex] += Number(tx.amount) || 0;
      }
    });
  } else {
    for (let i = 5; i >= 0; i -= 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(monthDate.toLocaleString("id-ID", { month: "short", year: "numeric" }));
      incomeData.push(0);
      expenseData.push(0);
    }

    items.forEach((tx) => {
      if (!isFinancialTransaction(tx)) return;
      const txDate = getTransactionDate(tx);
      const monthOffset = (txDate.getFullYear() - now.getFullYear()) * 12 + (txDate.getMonth() - now.getMonth());
      const bucketIndex = monthOffset + 5;

      if (bucketIndex < 0 || bucketIndex > 5) return;

      if (tx.type === "income") {
        incomeData[bucketIndex] += Number(tx.amount) || 0;
      } else {
        expenseData[bucketIndex] += Number(tx.amount) || 0;
      }
    });
  }

  const canvas = document.getElementById("chartMonthly");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const hasData = incomeData.some(v => v > 0) || expenseData.some(v => v > 0);

  if (!hasData) {
    setChartState(true, analysisMeta.emptyMessage, "empty");
  } else {
    setChartState(false);
  }

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { 
          label: 'Pemasukan', 
          data: incomeData, 
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          borderRadius: 8
        },
        { 
          label: 'Pengeluaran', 
          data: expenseData, 
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: {
        duration: 650,
        easing: 'easeOutQuart'
      },
      normalized: true,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: { 
        legend: { 
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            color: '#dfe8ff',
            font: {
              size: 12,
              weight: '600'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          cornerRadius: 8,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              label += 'Rp ' + context.parsed.y.toLocaleString('id-ID');
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(223, 232, 255, 0.12)'
          },
          ticks: {
            color: '#dfe8ff',
            callback: function(value) {
              return 'Rp ' + (value / 1000) + 'k';
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#dfe8ff'
          }
        }
      }
    }
  });
}
