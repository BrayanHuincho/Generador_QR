class QRGenerator {
    constructor() {
        this.currentQRType = 'text';
        this.gradientPresets = {
            'solid-black': '#000000',
            'ocean': { start: '#667eea', end: '#764ba2' },
            'sunset': { start: '#f093fb', end: '#f5576c' },
            'forest': { start: '#56ab2f', end: '#a8e6cf' },
            'fire': { start: '#ff9a9e', end: '#fecfef' },
            'royal': { start: '#667eea', end: '#764ba2' }
        };
        this.currentGradient = 'solid-black';
        this.initializeElements();
        this.bindEvents();
        this.updateCharCount();
    }

    initializeElements() {
        this.qrTypeBtns = document.querySelectorAll('.qr-type-btn');
        this.qrForms = document.querySelectorAll('.qr-form');
        
        this.textInput = document.getElementById('qr-text');
        this.dniInput = document.getElementById('dni-number');
        this.whatsappNumber = document.getElementById('whatsapp-number');
        this.whatsappMessage = document.getElementById('whatsapp-message');
        this.countryCode = document.getElementById('country-code');
        
        this.generateBtn = document.getElementById('generate-btn');
        this.downloadBtn = document.getElementById('download-btn');
        this.qrContainer = document.getElementById('qr-container');
        this.downloadSection = document.getElementById('download-section');
        this.charCount = document.querySelector('.char-count');
        this.dniCount = document.querySelector('.dni-count');
        this.qrContentDisplay = document.getElementById('qr-content-display');
        
        this.colorInput = document.getElementById('qr-color');
        this.gradientBtns = document.querySelectorAll('.gradient-btn');
        this.brandTop = document.getElementById('brand-top');
        this.brandBottom = document.getElementById('brand-bottom');
        
        this.currentQRDataURL = null;
    }

    bindEvents() {
        this.qrTypeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchQRType(e.target.closest('.qr-type-btn').dataset.type);
            });
        });

        this.textInput.addEventListener('input', () => {
            this.updateCharCount();
            this.autoGenerate();
        });

        this.dniInput.addEventListener('input', (e) => {
            this.validateDNI(e);
            this.updateDNICount();
            this.autoGenerate();
        });

        this.whatsappNumber.addEventListener('input', (e) => {
            this.validateWhatsAppNumber(e);
            this.autoGenerate();
        });
        this.whatsappMessage.addEventListener('input', () => this.autoGenerate());
        this.countryCode.addEventListener('change', () => {
            this.updateWhatsAppPlaceholder();
            this.autoGenerate();
        });
        
        this.generateBtn.addEventListener('click', () => this.generateQR());
        this.downloadBtn.addEventListener('click', () => this.downloadQR());
        
        this.colorInput.addEventListener('change', () => this.autoGenerate());
        
        this.gradientBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectGradient(e.target.closest('.gradient-btn').dataset.gradient);
            });
        });

        this.brandTop.addEventListener('input', () => this.autoGenerate());
        this.brandBottom.addEventListener('input', () => this.autoGenerate());
        
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.generateQR();
            }
        });
    }

    switchQRType(type) {
        this.currentQRType = type;
        
        this.qrTypeBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
        
        this.qrForms.forEach(form => form.classList.remove('active'));
        document.getElementById(`${type}-form`).classList.add('active');
        
        this.autoGenerate();
    }

    validateDNI(e) {
        const value = e.target.value.replace(/\D/g, '');
        e.target.value = value;
        
        if (value.length > 8) {
            e.target.value = value.slice(0, 8);
        }
    }

    updateDNICount() {
        const length = this.dniInput.value.length;
        this.dniCount.textContent = `${length}/8 dígitos`;
        
        if (length === 8) {
            this.dniCount.style.color = '#48bb78';
        } else {
            this.dniCount.style.color = '#667eea';
        }
    }

    validateWhatsAppNumber(e) {
        const selectedOption = this.countryCode.selectedOptions[0];
        const maxDigits = parseInt(selectedOption.dataset.digits);
        
        let value = e.target.value.replace(/[^0-9]/g, '');
        
        if (value.length > maxDigits) {
            value = value.substring(0, maxDigits);
        }
        
        e.target.value = value;
        
        this.updateWhatsAppCount(value.length, maxDigits);
    }

    updateWhatsAppCount(currentLength, maxLength) {
        const countElement = document.querySelector('.whatsapp-count') || this.createWhatsAppCountElement();
        countElement.textContent = `${currentLength}/${maxLength} dígitos`;
        
        if (currentLength === maxLength) {
            countElement.style.color = '#48bb78';
        } else {
            countElement.style.color = '#667eea';
        }
    }

    createWhatsAppCountElement() {
        const countElement = document.createElement('span');
        countElement.className = 'whatsapp-count';
        const inputInfo = document.querySelector('#whatsapp-form .input-info');
        inputInfo.insertBefore(countElement, inputInfo.firstChild);
        return countElement;
    }

    updateWhatsAppPlaceholder() {
        const selectedOption = this.countryCode.selectedOptions[0];
        const maxDigits = parseInt(selectedOption.dataset.digits);
        
        let placeholder = '';
        for (let i = 0; i < maxDigits; i++) {
            placeholder += Math.floor(Math.random() * 10);
        }
        
        this.whatsappNumber.placeholder = placeholder;
        
        this.whatsappNumber.value = '';
        
        this.updateWhatsAppCount(0, maxDigits);
    }

    selectGradient(gradientName) {
        this.currentGradient = gradientName;
        
        this.gradientBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-gradient="${gradientName}"]`).classList.add('active');
        
        this.autoGenerate();
    }

    updateCharCount() {
        const length = this.textInput.value.length;
        this.charCount.textContent = `${length} caracteres`;
        
        if (length > 2000) {
            this.charCount.style.color = '#e53e3e';
        } else if (length > 1500) {
            this.charCount.style.color = '#dd6b20';
        } else {
            this.charCount.style.color = '#718096';
        }
    }

    autoGenerate() {
        const content = this.getQRContent();
        if (content.trim()) {
            clearTimeout(this.autoGenerateTimeout);
            this.autoGenerateTimeout = setTimeout(() => {
                this.generateQR();
            }, 500);
        }
    }

    getQRContent() {
        switch (this.currentQRType) {
            case 'text':
                return this.textInput.value.trim();
            
            case 'dni':
                const dni = this.dniInput.value.trim();
                if (dni.length === 8) {
                    return dni;
                }
                return '';
            
            case 'whatsapp':
                const countryCode = this.countryCode.value;
                const number = this.whatsappNumber.value.trim();
                const message = this.whatsappMessage.value.trim();
                
                if (number) {
                    const cleanNumber = number.replace(/[^0-9]/g, '');
                    
                    const selectedOption = this.countryCode.selectedOptions[0];
                    const requiredDigits = parseInt(selectedOption.dataset.digits);
                    
                    if (cleanNumber.length === requiredDigits) {
                        let whatsappUrl = `https://wa.me/${countryCode}${cleanNumber}`;
                        if (message) {
                            whatsappUrl += `?text=${encodeURIComponent(message)}`;
                        }
                        return whatsappUrl;
                    }
                }
                return '';
            
            default:
                return '';
        }
    }

    async generateQR() {
        const content = this.getQRContent();
        
        if (!content) {
            let errorMessage = 'Por favor completa los campos requeridos';
            if (this.currentQRType === 'dni') {
                errorMessage = 'Por favor ingresa un DNI válido de 8 dígitos';
            } else if (this.currentQRType === 'whatsapp') {
                errorMessage = 'Por favor ingresa un número de WhatsApp válido';
            }
            this.showError(errorMessage);
            return;
        }

        if (content.length > 2000) {
            this.showError('El contenido es demasiado largo. Máximo 2000 caracteres.');
            return;
        }

        if (typeof QRCode === 'undefined') {
            this.showError('La librería QRCode no está cargada. Recarga la página.');
            return;
        }

        this.showLoading();

        try {
            const options = this.getQROptions();
            const canvas = document.createElement('canvas');
            
            await QRCode.toCanvas(canvas, content, options);
            
            this.currentQRDataURL = canvas.toDataURL('image/png');
            await this.displayQR(canvas, content);
            this.showSuccess();
            
        } catch (error) {
            console.error('Error generando QR:', error);
            this.showError(`Error al generar el código QR: ${error.message || 'Inténtalo de nuevo'}`);
        }
    }

    getQROptions() {
        const gradient = this.gradientPresets[this.currentGradient];
        let qrColor = this.colorInput.value;
        
        if (this.currentGradient !== 'solid-black' && typeof gradient === 'object') {
            qrColor = gradient.start;
        }
        
        return {
            width: 300,
            height: 300,
            color: {
                dark: qrColor,
                light: '#ffffff'
            },
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.92,
            margin: 2,
            rendererOpts: {
                quality: 0.92
            }
        };
    }

    async displayQR(canvas, content) {
        if (this.currentGradient !== 'solid-black') {
            canvas = this.applyGradientEffect(canvas);
        }
        
        const finalCanvas = await this.addBranding(canvas, content);
        
        this.qrContainer.innerHTML = '';
        this.qrContainer.appendChild(finalCanvas);
        this.qrContainer.classList.add('has-qr');
        
        if (this.qrContentDisplay) {
            let displayContent = content;
            if (content.length > 50) {
                displayContent = content.substring(0, 50) + '...';
            }
            this.qrContentDisplay.textContent = displayContent;
        }
        
        this.currentQRDataURL = finalCanvas.toDataURL('image/png');
        
        this.downloadSection.style.display = 'block';
    }

    applyGradientEffect(canvas) {
        const gradient = this.gradientPresets[this.currentGradient];
        if (typeof gradient !== 'object') return canvas;
        
        const newCanvas = document.createElement('canvas');
        const ctx = newCanvas.getContext('2d');
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        
        ctx.drawImage(canvas, 0, 0);
        
        const gradientFill = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradientFill.addColorStop(0, gradient.start);
        gradientFill.addColorStop(1, gradient.end);
        
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = gradientFill;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        return newCanvas;
    }

    async addBranding(qrCanvas, content) {
        const brandTop = this.brandTop.value.trim();
        const brandBottom = this.brandBottom.value.trim();
        const isWhatsApp = this.currentQRType === 'whatsapp';
        const isDNI = this.currentQRType === 'dni';
        
        if (!brandTop && !brandBottom && !isWhatsApp && !isDNI) {
            return qrCanvas;
        }
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const padding = 40;
        const textHeight = 30;
        const spacing = 20;
        
        let totalHeight = qrCanvas.height + (padding * 2);
        if (brandTop) totalHeight += textHeight + spacing;
        if (brandBottom) totalHeight += textHeight + spacing;
        
        canvas.width = Math.max(qrCanvas.width + (padding * 2), 400);
        canvas.height = totalHeight;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        let currentY = padding;
        
        if (brandTop) {
            ctx.fillStyle = '#333333';
            ctx.font = 'bold 20px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(brandTop, canvas.width / 2, currentY + 20);
            currentY += textHeight + spacing;
        }
        
        const qrX = (canvas.width - qrCanvas.width) / 2;
        ctx.drawImage(qrCanvas, qrX, currentY);
        
        if (isWhatsApp) {
            await this.addWhatsAppIcon(ctx, qrX + qrCanvas.width / 2, currentY + qrCanvas.height / 2);
        }
        
        if (isDNI) {
            await this.addDNIIcon(ctx, qrX + qrCanvas.width / 2, currentY + qrCanvas.height / 2);
        }
        
        currentY += qrCanvas.height + spacing;
        
        if (brandBottom) {
            ctx.fillStyle = '#666666';
            ctx.font = '16px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(brandBottom, canvas.width / 2, currentY + 16);
        }
        
        return canvas;
    }

    async addWhatsAppIcon(ctx, centerX, centerY) {
        const iconSize = 50;
        const radius = iconSize / 2;
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
        ctx.fill();
        
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            return new Promise((resolve) => {
                img.onload = () => {
                    const imgSize = iconSize;
                    ctx.drawImage(img, 
                        centerX - imgSize/2, 
                        centerY - imgSize/2, 
                        imgSize, 
                        imgSize
                    );
                    resolve();
                };
                
                img.onerror = () => {
                    ctx.fillStyle = '#25D366';
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 24px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('W', centerX, centerY);
                    resolve();
                };
                
                img.src = './Icons/whatsapp-icon.webp';
            });
        } catch (error) {
            ctx.fillStyle = '#25D366';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('W', centerX, centerY);
        }
    }

    async addDNIIcon(ctx, centerX, centerY) {
        const iconSize = 60;
        const radius = iconSize / 2;
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
        ctx.fill();
        
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            return new Promise((resolve) => {
                img.onload = () => {
                    const imgSize = iconSize;
                    ctx.drawImage(img, 
                        centerX - imgSize/2, 
                        centerY - imgSize/2, 
                        imgSize, 
                        imgSize
                    );
                    resolve();
                };
                
                img.onerror = () => {
                    ctx.fillStyle = '#3182CE';
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 16px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('DNI', centerX, centerY);
                    resolve();
                };
                
                img.src = './Icons/dni-icon.png';
            });
        } catch (error) {
            ctx.fillStyle = '#3182CE';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('DNI', centerX, centerY);
        }
    }

    showLoading() {
        this.qrContainer.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Generando código QR...</p>
            </div>
        `;
    }

    showSuccess() {
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>¡Código QR generado exitosamente!</span>
        `;
        
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.remove();
        }, 3000);
    }

    showError(message) {
        this.qrContainer.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.innerHTML = `
            <i class="fas fa-times-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(errorMsg);
        
        setTimeout(() => {
            errorMsg.remove();
        }, 5000);
    }

    downloadQR() {
        if (!this.currentQRDataURL) {
            this.showError('No hay código QR para descargar');
            return;
        }

        const link = document.createElement('a');
        link.download = `qr-code-${Date.now()}.png`;
        link.href = this.currentQRDataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showDownloadSuccess();
    }

    showDownloadSuccess() {
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.innerHTML = `
            <i class="fas fa-download"></i>
            <span>¡Código QR descargado exitosamente!</span>
        `;
        
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.remove();
        }, 3000);
    }

    clearQR() {
        this.qrContainer.innerHTML = `
            <div class="qr-placeholder">
                <i class="fas fa-qrcode"></i>
                <p>Tu código QR aparecerá aquí</p>
                <span>Ingresa texto y presiona "Generar"</span>
            </div>
        `;
        this.qrContainer.classList.remove('has-qr');
        this.downloadSection.style.display = 'none';
        this.currentQRDataURL = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let qrGenerator;
    
    function initializeQRGenerator() {
        if (typeof QRCode !== 'undefined') {
            qrGenerator = new QRGenerator();
            console.log('QR Generator inicializado correctamente');
        } else {
            setTimeout(initializeQRGenerator, 100);
        }
    }
    
    initializeQRGenerator();
    
    const gradientPresets = [
        { name: 'solid-black', label: 'Negro Sólido', value: '#000000' },
        { name: 'ocean', label: 'Océano', start: '#667eea', end: '#764ba2' },
        { name: 'sunset', label: 'Atardecer', start: '#f093fb', end: '#f5576c' },
        { name: 'forest', label: 'Bosque', start: '#56ab2f', end: '#a8e6cf' },
        { name: 'fire', label: 'Fuego', start: '#ff9a9e', end: '#fecfef' },
        { name: 'royal', label: 'Real', start: '#667eea', end: '#764ba2' }
    ];

    const gradientContainer = document.querySelector('.gradient-presets');
    if (gradientContainer) {
        gradientContainer.innerHTML = '';
        
        gradientPresets.forEach(preset => {
            const btn = document.createElement('button');
            btn.className = `gradient-btn ${preset.name === 'solid-black' ? 'active' : ''}`;
            btn.dataset.gradient = preset.name;
            btn.title = preset.label;
            
            if (preset.name === 'solid-black') {
                btn.style.background = preset.value;
            } else {
                btn.style.background = `linear-gradient(135deg, ${preset.start}, ${preset.end})`;
            }
            
            gradientContainer.appendChild(btn);
        });
    }
    
    if (window.QRCode && window.QRCode.onReady) {
        window.QRCode.onReady(() => {
            console.log('QRCode library ready');
        });
    }
});

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .error-message {
        animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);