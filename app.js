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
  query,
  where,
  orderBy,
  getDocs,
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

const authSection = document.getElementById("auth-section");
const dashboard = document.getElementById("dashboard");

const btnRegister = document.getElementById("btnRegister");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const userEmail = document.getElementById("userEmail");

// Register function with validation
btnRegister.onclick = async () => {
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
btnLogin.onclick = async () => {
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
btnLogout.onclick = async () => {
  try {
    await signOut(auth);
    showToast("Logout berhasil!", "info");
  } catch (e) {
    console.error("Logout error:", e);
    showToast("Logout gagal!", "error");
  }
};

// Enter key support for register
document.getElementById("regEmail").addEventListener("keypress", (e) => {
  if (e.key === "Enter") document.getElementById("regPassword").focus();
});
document.getElementById("regPassword").addEventListener("keypress", (e) => {
  if (e.key === "Enter") btnRegister.click();
});

// Enter key support for login
document.getElementById("loginEmail").addEventListener("keypress", (e) => {
  if (e.key === "Enter") document.getElementById("loginPassword").focus();
});
document.getElementById("loginPassword").addEventListener("keypress", (e) => {
  if (e.key === "Enter") btnLogin.click();
});

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

// Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in:", user.email);
    authSection.classList.add("hidden");
    dashboard.classList.remove("hidden");
    userEmail.innerText = user.email;
    startRealtime(user.uid);
  } else {
    console.log("User logged out");
    authSection.classList.remove("hidden");
    dashboard.classList.add("hidden");
    userEmail.innerText = "";
    stopRealtime();
  }
});

// Add transaction with better validation and feedback
document.getElementById("saveBtn").addEventListener("click", async () => {
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

let unsubscribe = null;
let chart = null;

function stopRealtime(){
  if (unsubscribe) unsubscribe();
  unsubscribe = null;
  // clear UI
  document.getElementById("income").innerText = "Rp 0";
  document.getElementById("expense").innerText = "Rp 0";
  document.getElementById("balance").innerText = "Rp 0";
  document.getElementById("txList").innerHTML = "";
  if (chart) {
    chart.destroy();
    chart = null;
  }
}

function startRealtime(uid){
  console.log("Starting realtime listener for user:", uid);
  const txColl = collection(db, "users", uid, "transactions");
  const q = query(txColl, orderBy("date", "desc"));
  unsubscribe = onSnapshot(q, (snapshot) => {
    console.log("Received", snapshot.size, "transactions");
    const items = [];
    snapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });
    renderTransactions(items);
    computeSummary(items);
    renderChartMonthly(items);
  }, (error) => {
    console.error("Snapshot error:", error);
    console.error("Error code:", error.code);
    if (error.code === 'permission-denied') {
      showToast("Akses ditolak! Silakan atur Firestore Rules di Firebase Console.", "error");
    } else {
      showToast("Gagal memuat data: " + error.message, "error");
    }
  });
}

function renderTransactions(items) {
  const ul = document.getElementById("txList");
  ul.innerHTML = "";
  
  if (items.length === 0) {
    ul.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <i class="fas fa-inbox text-5xl mb-3"></i>
        <p class="text-lg">Belum ada transaksi</p>
        <p class="text-sm">Mulai tambahkan transaksi pertama Anda</p>
      </div>
    `;
    return;
  }
  
  items.slice(0, 50).forEach(tx => {
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
}

function renderChartMonthly(items) {
  // aggregate per month for last 6 months
  const labels = [];
  const incomeData = [];
  const expenseData = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
    labels.push(label);
    const ym = { y: d.getFullYear(), m: d.getMonth() };
    let inc = 0, exp = 0;
    items.forEach(tx => {
      const td = tx.date && tx.date.toDate ? tx.date.toDate() : new Date();
      if (td.getFullYear() === ym.y && td.getMonth() === ym.m) {
        if (tx.type === 'income') inc += tx.amount;
        else exp += tx.amount;
      }
    });
    incomeData.push(inc);
    expenseData.push(exp);
  }

  const ctx = document.getElementById("chartMonthly").getContext("2d");
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
      plugins: { 
        legend: { 
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
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
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: function(value) {
              return 'Rp ' + (value / 1000) + 'k';
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}
