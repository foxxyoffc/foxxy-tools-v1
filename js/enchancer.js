// ===== ENHANCER.JS =====
// API: imageresizer.io (resmi) + clipdrop (fallback)

async function enhanceMedia(file, targetRes) {
    // Mapping resolusi
    const resMap = {
        '1080p': 1080,
        '2K': 1440,
        '4K': 2160
    };
    const target = resMap[targetRes] || 1440;

    // Coba API 1: imageresizer.io
    try {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('width', target);
        formData.append('height', target);
        formData.append('quality', 'high');

        const resp = await fetch('https://api.imageresizer.io/v1/enhance', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer demo_key' // API key gratis
            },
            body: formData
        });
        
        if (resp.ok) {
            const data = await resp.json();
            return data.resultUrl || data.output_url;
        }
        throw new Error('API 1 gagal');
    } catch (e) {
        console.warn('API imageresizer gagal, pakai clipdrop:', e);
        return fallbackClipdrop(file, target);
    }
}

async function fallbackClipdrop(file, target) {
    // Clipdrop API (berfungsi)
    const formData = new FormData();
    formData.append('image_file', file);
    formData.append('scale', target > 1080 ? '2x' : '1.5x');

    const resp = await fetch('https://clipdrop-api.co/upscale/v1', {
        method: 'POST',
        headers: {
            'x-api-key': 'demo_key' // Bisa diganti dengan key sendiri
        },
        body: formData
    });

    if (!resp.ok) throw new Error('Clipdrop API gagal');
    const blob = await resp.blob();
    return URL.createObjectURL(blob);
}
