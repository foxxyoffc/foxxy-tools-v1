// ===== DOWNLOADER.JS =====
// API: TikWM + TikMate + ssstik

async function downloadTikTok(url) {
    // API 1: TikWM
    try {
        const resp = await fetch(`https://www.tikwm.com/api/video?url=${encodeURIComponent(url)}`);
        if (!resp.ok) throw new Error('TikWM gagal');
        const data = await resp.json();
        if (data.code === 0 && data.data?.play) {
            return data.data.play;
        }
        throw new Error('TikWM no video');
    } catch (e) {
        console.warn('TikWM gagal, pakai TikMate:', e);
        return fallbackTikMateDownload(url);
    }
}

async function fallbackTikMateDownload(url) {
    // API TikMate
    const resp = await fetch(`https://api.tikmate.app/api/download?url=${encodeURIComponent(url)}`);
    if (!resp.ok) throw new Error('TikMate gagal');
    const data = await resp.json();
    return data.video_url || data.url;
}

async function fallbackSsstik(url) {
    // ssstik.io API (alternatif)
    const formData = new FormData();
    formData.append('url', url);
    formData.append('format', 'mp4');
    
    const resp = await fetch('https://ssstik.io/api/download', {
        method: 'POST',
        body: formData
    });
    if (!resp.ok) throw new Error('ssstik gagal');
    const data = await resp.json();
    return data.url || data.video_url;
}

document.getElementById('dlBtn')?.addEventListener('click', async () => {
    const urlInput = document.getElementById('dlUrl');
    const resultBox = document.getElementById('dlResult');
    
    if (!urlInput.value) {
        showResult(resultBox, '❌ Masukkan URL TikTok', 'error');
        return;
    }

    try {
        showResult(resultBox, '⏳ Mendapatkan link...', 'info');
        
        let videoUrl;
        try {
            videoUrl = await downloadTikTok(urlInput.value);
        } catch (e) {
            console.warn('Semua API gagal, coba ssstik:', e);
            videoUrl = await fallbackSsstik(urlInput.value);
        }

        if (videoUrl) {
            const a = document.createElement('a');
            a.href = videoUrl;
            a.download = 'tiktok_video.mp4';
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showResult(resultBox, '✅ Unduhan dimulai!', 'success');
        } else {
            throw new Error('Tidak ada link unduhan');
        }
    } catch (err) {
        showResult(resultBox, '❌ Gagal: ' + err.message, 'error');
    }
});
