// ===== TIKTOK.JS =====
// API: TikWM (resmi) + TikMate (fallback)

async function getTikTokStats(url) {
    // API 1: TikWM (paling stabil)
    try {
        const resp = await fetch(`https://www.tikwm.com/api/video?url=${encodeURIComponent(url)}`);
        if (!resp.ok) throw new Error('TikWM gagal');
        const data = await resp.json();
        if (data.code === 0 && data.data) {
            return data.data;
        }
        throw new Error('Data tidak valid');
    } catch (e) {
        console.warn('TikWM gagal, pakai TikMate:', e);
        return fallbackTikMate(url);
    }
}

async function fallbackTikMate(url) {
    // API TikMate (berfungsi)
    const resp = await fetch(`https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`);
    if (!resp.ok) throw new Error('TikMate gagal');
    const data = await resp.json();
    
    return {
        digg_count: data.likes || 0,
        comment_count: data.comments || 0,
        share_count: data.shares || 0,
        play_count: data.views || 0,
        author: { unique_id: data.author || '-' },
        music_info: { title: data.music || '-' }
    };
}

document.getElementById('statsBtn')?.addEventListener('click', async () => {
    const urlInput = document.getElementById('statsUrl');
    const resultBox = document.getElementById('statsResult');
    
    if (!urlInput.value) {
        showResult(resultBox, '❌ Masukkan URL TikTok', 'error');
        return;
    }

    try {
        showResult(resultBox, '⏳ Mengambil data...', 'info');
        const data = await getTikTokStats(urlInput.value);
        
        const info = `
📊 Statistik:
❤️ ${data.digg_count || 0}  💬 ${data.comment_count || 0}  🔄 ${data.share_count || 0}
👁️ ${data.play_count || 0}  ⭐ ${data.collect_count || 0}
🎵 ${data.music_info?.title || '-'}  👤 ${data.author?.unique_id || '-'}
        `;
        showResult(resultBox, info, 'success');
    } catch (err) {
        showResult(resultBox, '❌ Gagal: ' + err.message, 'error');
    }
});
