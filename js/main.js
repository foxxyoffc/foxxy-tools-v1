// ===== MAIN.JS =====

// Show result in a box
function showResult(element, message, type = 'info') {
    if (!element) return;
    element.textContent = message;
    element.className = 'result-box ' + type;
}

// Get file from drop zone
function getFileFromDropZone(zone) {
    const input = zone.querySelector('input[type="file"]');
    if (input && input.files.length) return input.files[0];
    return null;
}

// Initialize all drop zones
document.querySelectorAll('.drop-zone').forEach(zone => {
    const input = zone.querySelector('input');
    if (!input) return;
    
    input.addEventListener('change', () => {
        if (input.files.length) {
            const span = zone.querySelector('span');
            if (span) span.textContent = input.files[0].name;
        }
    });
    
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.style.borderColor = '#f97316';
    });
    
    zone.addEventListener('dragleave', () => {
        zone.style.borderColor = '#3a4b60';
    });
    
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.style.borderColor = '#3a4b60';
        if (e.dataTransfer.files.length) {
            input.files = e.dataTransfer.files;
            const span = zone.querySelector('span');
            if (span) span.textContent = input.files[0].name;
        }
    });
});

// Auto-create result boxes if not exist
document.querySelectorAll('.tool-card').forEach(card => {
    if (!card.querySelector('.result-box')) {
        const box = document.createElement('div');
        box.className = 'result-box';
        box.textContent = '✨ Siap digunakan';
        card.querySelector('.card-body').appendChild(box);
    }
});
