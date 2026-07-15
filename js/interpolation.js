// ===== INTERPOLATION.JS =====
// API: RIFE (resmi) + FFmpeg minterpolate (fallback)

async function interpolateVideo(file, targetFps) {
    // API 1: RIFE
    try {
        const formData = new FormData();
        formData.append('video', file);
        formData.append('fps', targetFps);
        formData.append('model', 'rife-v4.6');

        const resp = await fetch('https://api.rife-ai.com/v1/interpolate', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer demo_key'
            },
            body: formData
        });
        
        if (resp.ok) {
            const blob = await resp.blob();
            return URL.createObjectURL(blob);
        }
        throw new Error('RIFE API gagal');
    } catch (e) {
        console.warn('RIFE gagal, pakai FFmpeg fallback:', e);
        return fallbackFFmpegInterpolation(file, targetFps);
    }
}

async function fallbackFFmpegInterpolation(file, targetFps) {
    // Menggunakan FFmpeg WASM untuk interpolasi
    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();

    const inputName = 'input.mp4';
    const outputName = 'output_interp.mp4';

    ffmpeg.FS('writeFile', inputName, await fetchFile(file));

    // Minterpolate filter untuk meningkatkan FPS
    await ffmpeg.run(
        '-i', inputName,
        '-filter:v', `minterpolate=fps=${targetFps}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir`,
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '18',
        outputName
    );

    const data = ffmpeg.FS('readFile', outputName);
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    return URL.createObjectURL(blob);
}
