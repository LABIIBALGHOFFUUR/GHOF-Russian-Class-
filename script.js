// 1. Animasi Scroll Reveal
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

// 2. Perbaikan Tombol Menu HP (Hamburger Menu) yang Stabil
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        mobileMenu.classList.toggle("hidden");
    });

    // Tutup menu saat klik di luar
    document.addEventListener("click", (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.add("hidden");
        }
    });
}

function closeMobileMenu() {
    if (mobileMenu) mobileMenu.classList.add("hidden");
}

// 3. Tampilkan Pengumuman Live dari Admin ke Web Utama
window.addEventListener("DOMContentLoaded", () => {
    const bannerEl = document.getElementById("live-announcement-banner");
    const savedAnnouncement = localStorage.getItem("ghof_live_announcement");
    
    if (bannerEl && savedAnnouncement) {
        bannerEl.innerHTML = `<span>${savedAnnouncement} &nbsp;&nbsp;•&nbsp;&nbsp; 🎓 MENTOR LABIIB AL GHOFFUUR &nbsp;&nbsp;•&nbsp;&nbsp; 📜 TERSEDIA KELAS GRATIS & SERTIFIKAT RESMI &nbsp;&nbsp;•&nbsp;&nbsp;</span><span>${savedAnnouncement} &nbsp;&nbsp;•&nbsp;&nbsp; 🎓 MENTOR LABIIB AL GHOFFUUR &nbsp;&nbsp;•&nbsp;&nbsp; 📜 TERSEDIA KELAS GRATIS & SERTIFIKAT RESMI &nbsp;&nbsp;•&nbsp;&nbsp;</span>`;
    }
});

// 4. Sistem Kirim Saran dari Website Utama
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

// 5. Sistem Panel Admin (Khusus admin.html)
let mediaStream = null;

function verifyAdmin() {
    const pass = document.getElementById("admin-password").value.trim();
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

// Publikasikan Pengumuman Live ke Web Utama
function saveAnnouncement() {
    const text = document.getElementById("admin-announcement-input").value.trim();
    if (!text) {
        alert("Teks pengumuman tidak boleh kosong!");
        return;
    }
    localStorage.setItem("ghof_live_announcement", text);
    const status = document.getElementById("announcement-status");
    status.classList.remove("hidden");
    setTimeout(() => status.classList.add("hidden"), 4000);
}

// Izin Kamera & Mikrofon Chrome
async function startMediaAccess() {
    const videoEl = document.getElementById("admin-camera-preview");
    const statusEl = document.getElementById("media-status");
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoEl) videoEl.srcObject = mediaStream;
        statusEl.textContent = "✅ Izin Kamera & Mikrofon Chrome Berhasil Diberikan!";
        statusEl.className = "text-xs text-green-400 mt-2";
    } catch (err) {
        statusEl.textContent = "❌ Gagal: Akses ditolak atau browser memblokir (pastikan online/HTTPS).";
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

// Izin Lokasi (Geolocation) Bawaan Chrome
function requestGeolocation() {
    const statusEl = document.getElementById("media-status");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                statusEl.textContent = `✅ Lokasi diizinkan! (Lat: ${position.coords.latitude.toFixed(2)}, Lon: ${position.coords.longitude.toFixed(2)})`;
                statusEl.className = "text-xs text-green-400 mt-2";
            },
            (error) => {
                statusEl.textContent = "❌ Izin lokasi ditolak oleh pengguna.";
                statusEl.className = "text-xs text-red-400 mt-2";
            }
        );
    } else {
        statusEl.textContent = "Browser tidak mendukung geolokasi.";
    }
}

// Izin Notifikasi Bawaan Chrome
function requestNotification() {
    const statusEl = document.getElementById("media-status");
    if ("Notification" in window) {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                statusEl.textContent = "✅ Izin Notifikasi Chrome Berhasil Diberikan!";
                statusEl.className = "text-xs text-green-400 mt-2";
                new Notification("GHOF Admin", { body: "Notifikasi berhasil diuji dan aktif!" });
            } else {
                statusEl.textContent = "❌ Izin notifikasi ditolak.";
                statusEl.className = "text-xs text-red-400 mt-2";
            }
        });
    } else {
        statusEl.textContent = "Browser tidak mendukung notifikasi.";
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
