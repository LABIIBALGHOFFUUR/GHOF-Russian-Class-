// 1. Animasi Scroll (Hanya berjalan di index.html)
function revealOnScroll() {
    const reveals = document.querySelectorAll(".reveal");
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        if (elementTop < windowHeight - 80) {
            reveals[i].classList.add("active");
        }
    }
}
window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

// Toggle Menu HP
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
if (mobileMenuBtn) {
    const mobileMenu = document.getElementById("mobile-menu");
    mobileMenuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
    });
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenu) mobileMenu.classList.add("hidden");
}

// 2. Sistem Kirim Saran dari Website Utama
const feedbackForm = document.getElementById("feedback-form");
if (feedbackForm) {
    feedbackForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const name = document.getElementById("sender-name").value;
        const city = document.getElementById("sender-city").value;
        const message = document.getElementById("sender-message").value;

        const feedbacks = JSON.parse(localStorage.getItem("ghof_feedbacks") || "[]");
        feedbacks.unshift({
            name,
            city,
            message,
            date: new Date().toLocaleString("id-ID")
        });
        localStorage.setItem("ghof_feedbacks", JSON.stringify(feedbacks));

        feedbackForm.reset();
        const statusMsg = document.getElementById("feedback-status");
        statusMsg.classList.remove("hidden");
        setTimeout(() => statusMsg.classList.add("hidden"), 4000);
    });
}

function sendFeedbackToWA() {
    const name = document.getElementById("sender-name").value || "Pengunjung Web";
    const city = document.getElementById("sender-city").value || "-";
    const message = document.getElementById("sender-message").value;

    if (!message) {
        alert("Silakan isi pesan masukan atau saran terlebih dahulu.");
        return;
    }

    const text = `Halo Admin GHOF Russian Class,%0A*Masukan & Saran Web*%0ANama: ${encodeURIComponent(name)}%0AAsal Kota: ${encodeURIComponent(city)}%0APesan: ${encodeURIComponent(message)}`;
    window.open(`https://wa.me/628979517541?text=${text}`, "_blank");
}

// 3. Sistem Panel Admin (Khusus admin.html)
let mediaStream = null;

function verifyAdmin() {
    const pass = document.getElementById("admin-password").value;
    if (pass === "ghof2026") {
        document.getElementById("admin-login-view").classList.add("hidden");
        document.getElementById("admin-dashboard-view").classList.remove("hidden");
        document.getElementById("login-error").classList.add("hidden");
        loadAdminFeedbacks();
    } else {
        document.getElementById("login-error").classList.remove("hidden");
    }
}

function logoutAdmin() {
    document.getElementById("admin-login-view").classList.remove("hidden");
    document.getElementById("admin-dashboard-view").classList.add("hidden");
    document.getElementById("admin-password").value = "";
    stopMediaAccess();
}

async function startMediaAccess() {
    const videoEl = document.getElementById("admin-camera-preview");
    const statusEl = document.getElementById("media-status");
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoEl.srcObject = mediaStream;
        statusEl.textContent = "✅ Kamera dan Mikrofon berhasil diizinkan & aktif!";
        statusEl.className = "text-xs text-green-400 mt-2";
    } catch (err) {
        statusEl.textContent = "❌ Akses kamera/mikrofon ditolak atau perangkat tidak mendukung.";
        statusEl.className = "text-xs text-red-400 mt-2";
    }
}

function stopMediaAccess() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
        const videoEl = document.getElementById("admin-camera-preview");
        if (videoEl) videoEl.srcObject = null;
        const statusEl = document.getElementById("media-status");
        if (statusEl) statusEl.textContent = "Kamera & mikrofon dimatikan.";
    }
}

function loadAdminFeedbacks() {
    const listEl = document.getElementById("admin-feedback-list");
    if (!listEl) return;
    const feedbacks = JSON.parse(localStorage.getItem("ghof_feedbacks") || "[]");

    if (feedbacks.length === 0) {
        listEl.innerHTML = `<p class="text-gray-500 italic p-3 bg-[#070d1b] rounded-xl">Belum ada masukan atau saran baru yang tersimpan.</p>`;
        return;
    }

    listEl.innerHTML = feedbacks.map(item => `
        <div class="bg-[#070d1b] border border-gray-800 p-3 rounded-xl">
            <div class="flex justify-between text-[#C5A059] font-bold mb-1">
                <span>${item.name} (${item.city})</span>
                <span class="text-[10px] text-gray-500 font-normal">${item.date}</span>
            </div>
            <p class="text-gray-300">${item.message}</p>
        </div>
    `).join("");
}

function clearFeedbacks() {
    if (confirm("Hapus semua daftar masukan & saran?")) {
        localStorage.removeItem("ghof_feedbacks");
        loadAdminFeedbacks();
    }
}
