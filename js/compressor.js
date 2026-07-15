// ===== COMPRESSOR.JS =====
// Sudah menggunakan FFmpeg WASM (berfungsi penuh)

document.getElementById('compressBtn')?.addEventListener('click', async () => {
    const zone = document.querySelector('#compressor .drop-zone');
    const file = getFileFromDropZone(zone);
    const resultBox = document.querySelector('#compressor .result-box') || document.createElement('div');
    const progressBar = document.getElementById('compressProgress');

    if (!file) {
        showResult(resultBox, '❌ Pilih video terlebih dahulu!', 'error');
        return;
    }

    try {
        showResult(resultBox, '⏳ Menginisialisasi FFmpeg...', 'info');
        
        const { createFFmpeg, fetchFile } = FFmpeg;
        const ffmpeg = createFFmpeg({ 
            log: true,
            progress: ({ ratio }) => {
                if (progressBar) {
                    progressBar.style.width = (ratio * 100) + '%';
                }
            }
        });
        
        await ffmpeg.load();

        const inputName = 'input.mp4';
        const outputName = 'output_compressed.mp4';

        ffmpeg.FS('writeFile', inputName, await fetchFile(file));

        showResult(resultBox, '⏳ Mengompres video...', 'info');

        // H.265 dengan preset yang optimal
        await ffmpeg.run(
            '-i', inputName,
            '-c:v', 'libx265',
            '-crf', '22',
            '-preset', 'medium',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-movflags', '+faststart',
            outputName
        );

        const data = ffmpeg.FS('readFile', outputName);
        const blob = new Blob([data.buffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);

        // Buat link download
        const container = document.querySelector('#compressor .card-body');
        const oldLink = container.querySelector('.download-link');
        if (oldLink) oldLink.remove();

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'compressed_' + file.name;
        downloadLink.textContent = '⬇️ Unduh Hasil Kompresi';
        downloadLink.className = 'download-link';
        downloadLink.style.display = 'block';
        downloadLink.style.marginTop = '10px';
        downloadLink.style.color = '#facc15';
        downloadLink.style.fontWeight = '600';
        container.appendChild(downloadLink);

        if (progressBar) progressBar.style.width = '100%';
        showResult(resultBox, '✅ Kompresi selesai!', 'success');

    } catch (err) {
        console.error(err);
        showResult(resultBox, '❌ Gagal: ' + err.message, 'error');
    }
});
