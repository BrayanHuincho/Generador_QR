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
        
        this.qrStorage = {
            text: { content: '', qrDataURL: null },
            whatsapp: { content: '', qrDataURL: null },
            dni: { content: '', qrDataURL: null },
            url: { content: '', qrDataURL: null },
            email: { content: '', qrDataURL: null }
        };
        
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

        this.bindTestEvents();
    }

    bindTestEvents() {
        const copyContentBtn = document.getElementById('copy-content-btn');
        const simulateScanBtn = document.getElementById('simulate-scan-btn');

        if (copyContentBtn) {
            copyContentBtn.addEventListener('click', () => {
                this.copyQRContent();
            });
        }

        if (simulateScanBtn) {
            simulateScanBtn.addEventListener('click', () => {
                this.testQRFunctionality();
            });
        }

        const qrReaderBtn = document.getElementById('qr-reader-btn');
        const startScannerBtn = document.getElementById('start-scanner-btn');
        const stopScannerBtn = document.getElementById('stop-scanner-btn');
        const closeReaderBtn = document.getElementById('close-reader-btn');
        const useScannedContentBtn = document.getElementById('use-scanned-content');

        if (qrReaderBtn) {
            qrReaderBtn.addEventListener('click', () => {
                this.openQRReader();
            });
        }

        if (startScannerBtn) {
            startScannerBtn.addEventListener('click', () => {
                this.startQRScanner();
            });
        }

        if (stopScannerBtn) {
            stopScannerBtn.addEventListener('click', () => {
                this.stopQRScanner();
            });
        }

        if (closeReaderBtn) {
            closeReaderBtn.addEventListener('click', () => {
                this.closeQRReader();
            });
        }

        if (useScannedContentBtn) {
            useScannedContentBtn.addEventListener('click', () => {
                this.useScannedContent();
            });
        }
    }

    copyQRContent() {
        const content = this.getQRContent();
        if (content) {
            navigator.clipboard.writeText(content).then(() => {
                this.showNotification('¡Contenido copiado al portapapeles!', 'success');
            }).catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = content;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showNotification('¡Contenido copiado al portapapeles!', 'success');
            });
        }
    }

    testQRFunctionality() {
        const content = this.getQRContent();
        if (!content) {
            this.showNotification('No hay contenido QR para probar', 'error');
            return;
        }

        const qrType = this.currentQRType;
        
        switch (qrType) {
            case 'whatsapp':
                const whatsappMatch = content.match(/https:\/\/wa\.me\/(\d+)\?text=(.+)/);
                if (whatsappMatch) {
                    const phone = whatsappMatch[1];
                    const message = decodeURIComponent(whatsappMatch[2]);
                    window.open(content, '_blank');
                    this.showNotification(`¡WhatsApp abierto! Enviando mensaje a +${phone}`, 'success');
                } else {
                    window.open(content, '_blank');
                    this.showNotification('¡WhatsApp abierto!', 'success');
                }
                break;
                
            case 'url':
                window.open(content, '_blank');
                this.showNotification('¡Enlace abierto en nueva pestaña para probar!', 'success');
                break;
                
            case 'email':
                window.open(`mailto:${content}`, '_blank');
                this.showNotification('¡Cliente de email abierto para probar!', 'success');
                break;
                
            case 'text':
                if (this.isWhatsApp(content)) {
                    window.open(content, '_blank');
                    this.showNotification('¡WhatsApp abierto!', 'success');
                } else if (this.isURL(content)) {
                    window.open(content, '_blank');
                    this.showNotification('¡Enlace abierto en nueva pestaña para probar!', 'success');
                } else if (this.isEmail(content)) {
                    window.open(`mailto:${content}`, '_blank');
                    this.showNotification('¡Cliente de email abierto para probar!', 'success');
                } else {
                    this.showContentModal(content, 'Contenido del QR');
                    this.showNotification('¡Contenido del QR mostrado!', 'info');
                }
                break;
                
            case 'dni':
                this.showContentModal(content, 'DNI Válido', `Este QR contiene un número de DNI peruano válido:\n\n${content}`);
                this.showNotification('¡DNI válido verificado!', 'success');
                break;
                
            default:
                this.showContentModal(content, 'Contenido del QR');
                this.showNotification('¡QR probado correctamente!', 'success');
        }
    }

    showContentModal(content, title, description = null) {
        const modal = document.createElement('div');
        modal.className = 'content-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 500px;
            width: 90%;
            max-height: 80%;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        modalContent.innerHTML = `
            <h3 style="margin-top: 0; color: #333; text-align: center;">${title}</h3>
            ${description ? `<p style="color: #666; margin-bottom: 20px;">${description}</p>` : ''}
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; word-break: break-all; font-family: monospace;">
                ${content}
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="this.closest('.content-modal').remove()" style="
                    background: #6c5ce7;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                ">Cerrar</button>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    openQRReader() {
        const qrReaderSection = document.getElementById('qr-reader-section');
        if (qrReaderSection) {
            qrReaderSection.style.display = 'block';
            this.updateCameraStatus('Presiona "Iniciar Escáner" para comenzar');
        }
    }

    closeQRReader() {
        const qrReaderSection = document.getElementById('qr-reader-section');
        if (qrReaderSection) {
            qrReaderSection.style.display = 'none';
            this.stopQRScanner();
        }
    }

    async startQRScanner() {
        try {
            this.updateCameraStatus('Iniciando cámara...');
            
            const video = document.getElementById('qr-video');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment'
                } 
            });
            
            video.srcObject = stream;
            this.currentStream = stream;
            
            video.onloadedmetadata = () => {
                video.play();
                this.updateCameraStatus('Cámara activa - Apunta al código QR');
                this.startQRDetection();
            };
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.updateCameraStatus('Error: No se pudo acceder a la cámara');
            this.showNotification('No se pudo acceder a la cámara. Verifica los permisos.', 'error');
        }
    }

    stopQRScanner() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }
        
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        
        const video = document.getElementById('qr-video');
        if (video) {
            video.srcObject = null;
        }
        
        this.updateCameraStatus('Cámara desconectada');
    }

    updateCameraStatus(message) {
        const statusElement = document.getElementById('camera-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    startQRDetection() {
        const video = document.getElementById('qr-video');
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        this.scanInterval = setInterval(() => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                
                if (code) {
                    this.handleQRDetection(code.data);
                }
            }
        }, 100);
    }

    handleQRDetection(qrData) {
        this.stopQRScanner();
        this.scannedContent = qrData;
        
        const resultContent = document.getElementById('scan-result-content');
        const resultSection = document.getElementById('scan-result');
        
        if (resultContent && resultSection) {
            resultContent.textContent = qrData;
            resultSection.style.display = 'block';
        }
        
        this.updateCameraStatus('¡QR detectado exitosamente!');
         this.showNotification('¡Código QR escaneado correctamente!', 'success');
    }

    useScannedContent() {
        if (this.scannedContent) {
            const textInput = document.getElementById('qr-text');
            if (textInput) {
                textInput.value = this.scannedContent;
                this.closeQRReader();
                this.showNotification('Contenido del QR cargado en el generador', 'success');
            }
        }
    }

    switchQRType(type) {
        this.saveCurrentQRData();
        
        this.currentQRType = type;
        
        this.qrTypeBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
        
        this.qrForms.forEach(form => form.classList.remove('active'));
        document.getElementById(`${type}-form`).classList.add('active');
        
        this.restoreQRData(type);
    }

    saveCurrentQRData() {
        const content = this.getQRContent();
        if (content && this.currentQRDataURL) {
            this.qrStorage[this.currentQRType] = {
                content: content,
                qrDataURL: this.currentQRDataURL
            };
        }
    }

    restoreQRData(type) {
        const storedData = this.qrStorage[type];
        
        if (storedData && storedData.content && storedData.qrDataURL) {
            this.currentQRDataURL = storedData.qrDataURL;
            
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                this.displayRestoredQR(canvas, storedData.content);
            };
            img.src = storedData.qrDataURL;
        } else {
            this.clearQRDisplay();
        }
    }

    displayRestoredQR(canvas, content) {
        this.qrContainer.innerHTML = '';
        
        const qrWrapper = document.createElement('div');
        qrWrapper.className = 'qr-wrapper';
        qrWrapper.style.cssText = `
            position: relative;
            display: inline-block;
            cursor: pointer;
            transition: transform 0.2s ease;
        `;
        
        qrWrapper.addEventListener('mouseenter', () => {
            qrWrapper.style.transform = 'scale(1.05)';
        });
        
        qrWrapper.addEventListener('mouseleave', () => {
            qrWrapper.style.transform = 'scale(1)';
        });
        
        qrWrapper.addEventListener('click', () => {
            this.testQRFunctionality();
        });
        
        const tooltip = document.createElement('div');
        tooltip.className = 'qr-tooltip';
        tooltip.innerHTML = '<span>Haz clic para probar el QR</span>';
        
        qrWrapper.addEventListener('mouseenter', () => {
            tooltip.style.opacity = '1';
        });
        
        qrWrapper.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
        
        qrWrapper.appendChild(canvas);
        qrWrapper.appendChild(tooltip);
        this.qrContainer.appendChild(qrWrapper);
        this.qrContainer.classList.add('has-qr');
        
        if (this.qrContentDisplay) {
            let displayContent = content;
            if (content.length > 50) {
                displayContent = content.substring(0, 50) + '...';
            }
            this.qrContentDisplay.textContent = displayContent;
        }
        
        this.downloadSection.style.display = 'block';
        this.showTestSection(content);
    }

    clearQRDisplay() {
        this.qrContainer.innerHTML = `
            <div class="qr-placeholder">
                <i class="fas fa-qrcode"></i>
                <p>Tu código QR aparecerá aquí</p>
                <span>Ingresa texto y presiona "Generar"</span>
            </div>
        `;
        this.qrContainer.classList.remove('has-qr');
        this.downloadSection.style.display = 'none';
        
        const testSection = document.getElementById('test-section');
        if (testSection) {
            testSection.style.display = 'none';
        }
        
        if (this.qrContentDisplay) {
            this.qrContentDisplay.textContent = '';
        }
        
        this.currentQRDataURL = null;
    }

    validateDNI(e) {
        const value = e.target.value.replace(/\D/g, '');
        e.target.value = value;
        
        if (value.length > 8) {
            e.target.value = value.slice(0, 8);
        }
    }

    updateDNICount() {
        const currentLength = this.dniInput.value.length;
        if (this.dniCount) {
            this.dniCount.textContent = `${currentLength}/8`;
            this.dniCount.className = 'dni-count';
            if (currentLength === 8) {
                this.dniCount.classList.add('valid');
            }
        }
    }

    validateWhatsAppNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        const countryCode = this.countryCode.value;
        let maxLength = 9;
        
        if (countryCode === '+1') maxLength = 10;
        else if (countryCode === '+52') maxLength = 10;
        else if (countryCode === '+54') maxLength = 10;
        
        if (value.length > maxLength) {
            value = value.slice(0, maxLength);
        }
        
        e.target.value = value;
        this.updateWhatsAppCount(value.length, maxLength);
    }

    updateWhatsAppCount(currentLength, maxLength) {
        let countElement = document.querySelector('.whatsapp-count');
        if (!countElement) {
            countElement = this.createWhatsAppCountElement();
        }
        
        countElement.textContent = `${currentLength}/${maxLength}`;
        countElement.className = 'whatsapp-count';
        if (currentLength === maxLength) {
            countElement.classList.add('valid');
        }
    }

    createWhatsAppCountElement() {
        const countElement = document.createElement('span');
        countElement.className = 'whatsapp-count';
        this.whatsappNumber.parentNode.appendChild(countElement);
        return countElement;
    }

    updateWhatsAppPlaceholder() {
        const countryCode = this.countryCode.value;
        const placeholders = {
            '+51': '987654321',
            '+1': '5551234567',
            '+52': '5512345678',
            '+54': '1123456789',
            '+34': '612345678',
            '+33': '612345678',
            '+49': '15123456789',
            '+44': '7123456789',
            '+39': '3123456789',
            '+55': '11987654321'
        };
        
        this.whatsappNumber.placeholder = placeholders[countryCode] || '987654321';
    }

    selectGradient(gradientName) {
        this.currentGradient = gradientName;
        this.gradientBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-gradient="${gradientName}"]`).classList.add('active');
        this.autoGenerate();
    }

    updateCharCount() {
        const currentLength = this.textInput.value.length;
        const maxLength = 1000;
        
        if (this.charCount) {
            this.charCount.textContent = `${currentLength}/${maxLength}`;
            this.charCount.className = 'char-count';
            
            if (currentLength > maxLength * 0.8) {
                this.charCount.classList.add('warning');
            }
            if (currentLength === maxLength) {
                this.charCount.classList.add('limit');
            }
        }
    }

    autoGenerate() {
        clearTimeout(this.autoGenerateTimeout);
        this.autoGenerateTimeout = setTimeout(() => {
            const content = this.getQRContent();
            if (content) {
                this.generateQR();
            } else {
                clearTimeout(this.autoGenerateTimeout);
                this.clearQRDisplay();
            }
        }, 500);
    }

    getQRContent() {
        switch (this.currentQRType) {
            case 'text':
                return this.textInput.value.trim();
            
            case 'dni':
                const dni = this.dniInput.value.trim();
                return dni.length === 8 ? dni : '';
            
            case 'whatsapp':
                const countryCode = this.countryCode.value;
                const number = this.whatsappNumber.value.trim();
                const message = this.whatsappMessage.value.trim();
                
                if (!number) return '';
                
                let minLength = 9;
                if (countryCode === '+1' || countryCode === '+52' || countryCode === '+54') {
                    minLength = 10;
                }
                
                if (number.length < minLength) return '';
                
                const fullNumber = countryCode.replace('+', '') + number;
                const encodedMessage = message ? encodeURIComponent(message) : '';
                
                return `https://wa.me/${fullNumber}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
            
            default:
                return '';
        }
    }

    async generateQR() {
        const content = this.getQRContent();
        
        if (!content) {
            let errorMessage = 'Por favor, ingresa contenido para generar el QR';
            
            if (this.currentQRType === 'dni') {
                errorMessage = 'El DNI debe tener exactamente 8 dígitos';
            } else if (this.currentQRType === 'whatsapp') {
                errorMessage = 'Por favor, ingresa un número de WhatsApp válido';
            }
            
            this.showError(errorMessage);
            this.clearQRDisplay();
            return;
        }
        
        if (content.length > 1000) {
            this.showError('El contenido es demasiado largo (máximo 1000 caracteres)');
            return;
        }
        
        try {
            this.showLoading();
            
            const canvas = document.createElement('canvas');
            const options = this.getQROptions();
            
            await QRCode.toCanvas(canvas, content, options);
            
            if (this.currentGradient !== 'solid-black') {
                this.applyGradientEffect(canvas);
            }
            
            await this.addBranding(canvas, content);
            
            this.currentQRDataURL = canvas.toDataURL();
            
            await this.displayQR(canvas, content);
            this.showSuccess();
            
        } catch (error) {
            console.error('Error generating QR:', error);
            this.showError('Error al generar el código QR');
        }
    }

    getQROptions() {
        return {
            width: 300,
            height: 300,
            color: {
                dark: this.currentGradient === 'solid-black' ? this.colorInput.value : '#000000',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M',
            type: 'image/png',
            quality: 0.92,
            margin: 2,
            scale: 4
        };
    }

    async displayQR(canvas, content) {
        this.qrContainer.innerHTML = '';
        
        const qrWrapper = document.createElement('div');
        qrWrapper.className = 'qr-wrapper';
        qrWrapper.style.cssText = `
            position: relative;
            display: inline-block;
            cursor: pointer;
            transition: transform 0.2s ease;
        `;
        
        qrWrapper.addEventListener('mouseenter', () => {
            qrWrapper.style.transform = 'scale(1.05)';
        });
        
        qrWrapper.addEventListener('mouseleave', () => {
            qrWrapper.style.transform = 'scale(1)';
        });
        
        qrWrapper.addEventListener('click', () => {
            this.testQRFunctionality();
        });
        
        const tooltip = document.createElement('div');
        tooltip.className = 'qr-tooltip';
        tooltip.innerHTML = '<span>Haz clic para probar el QR</span>';
        
        qrWrapper.addEventListener('mouseenter', () => {
            tooltip.style.opacity = '1';
        });
        
        qrWrapper.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
        
        qrWrapper.appendChild(canvas);
        qrWrapper.appendChild(tooltip);
        this.qrContainer.appendChild(qrWrapper);
        this.qrContainer.classList.add('has-qr');
        
        if (this.qrStorage[this.currentQRType]) {
            this.qrStorage[this.currentQRType] = {
                content: content,
                qrDataURL: this.currentQRDataURL
            };
        }
        
        this.showTestSection(content);
        
        if (this.qrContentDisplay) {
            let displayContent = content;
            if (content.length > 50) {
                displayContent = content.substring(0, 50) + '...';
            }
            this.qrContentDisplay.textContent = displayContent;
        }
        
        this.downloadSection.style.display = 'block';
    }

    showTestSection(content) {
        const testSection = document.getElementById('test-section');
        if (testSection) {
            testSection.style.display = 'block';
            
            const previewBox = testSection.querySelector('.preview-box');
            const testActionBtn = testSection.querySelector('#simulate-scan-btn');
            const testActionText = testSection.querySelector('.test-action-text');
            
            this.configureTestButton(content, testActionBtn, testActionText);
            this.addQRValidationFeedback(content);
        }
    }

    configureTestButton(content, testActionBtn, testActionText) {
        if (!testActionBtn || !testActionText) return;
        
        const qrType = this.currentQRType;
        
        switch (qrType) {
            case 'whatsapp':
                testActionBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Abrir WhatsApp';
                testActionText.textContent = 'Se abrirá WhatsApp con el mensaje prellenado';
                break;
                
            case 'url':
                testActionBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> Abrir Enlace';
                testActionText.textContent = 'Se abrirá el enlace en una nueva pestaña';
                break;
                
            case 'email':
                testActionBtn.innerHTML = '<i class="fas fa-envelope"></i> Abrir Email';
                testActionText.textContent = 'Se abrirá tu cliente de email predeterminado';
                break;
                
            case 'text':
                if (this.isWhatsApp(content)) {
                    testActionBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Abrir WhatsApp';
                    testActionText.textContent = 'Se detectó un enlace de WhatsApp';
                } else if (this.isURL(content)) {
                    testActionBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> Abrir Enlace';
                    testActionText.textContent = 'Se detectó un enlace web';
                } else if (this.isEmail(content)) {
                    testActionBtn.innerHTML = '<i class="fas fa-envelope"></i> Abrir Email';
                    testActionText.textContent = 'Se detectó una dirección de email';
                } else {
                    testActionBtn.innerHTML = '<i class="fas fa-eye"></i> Ver Contenido';
                    testActionText.textContent = 'Se mostrará el contenido del texto';
                }
                break;
                
            case 'dni':
                testActionBtn.innerHTML = '<i class="fas fa-id-card"></i> Verificar DNI';
                testActionText.textContent = 'Se mostrará la información del DNI';
                break;
                
            default:
                testActionBtn.innerHTML = '<i class="fas fa-qrcode"></i> Probar QR';
                testActionText.textContent = 'Simular escaneo del código QR';
        }
    }

    isURL(text) {
        try {
            new URL(text);
            return true;
        } catch {
            return /^https?:\/\/.+/i.test(text);
        }
    }

    isEmail(text) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
    }

    isWhatsApp(text) {
        return /wa\.me\/\d+/i.test(text) || /whatsapp\.com\/send/i.test(text);
    }

    applyGradientEffect(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        const gradient = this.gradientPresets[this.currentGradient];
        if (!gradient || typeof gradient === 'string') return;
        
        const startColor = this.hexToRgb(gradient.start);
        const endColor = this.hexToRgb(gradient.end);
        
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) {
                const x = (i / 4) % canvas.width;
                const y = Math.floor((i / 4) / canvas.width);
                const ratio = Math.sqrt((x / canvas.width) ** 2 + (y / canvas.height) ** 2);
                
                data[i] = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
                data[i + 1] = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
                data[i + 2] = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }

    async addBranding(qrCanvas, content) {
        const ctx = qrCanvas.getContext('2d');
        const centerX = qrCanvas.width / 2;
        const centerY = qrCanvas.height / 2;
        
        if (this.currentQRType === 'whatsapp') {
            await this.addWhatsAppIcon(ctx, centerX, centerY);
        } else if (this.currentQRType === 'dni') {
            await this.addDNIIcon(ctx, centerX, centerY);
        }
        
        const topText = this.brandTop.value.trim();
        const bottomText = this.brandBottom.value.trim();
        
        if (topText || bottomText) {
            const padding = 40;
            const newCanvas = document.createElement('canvas');
            const newCtx = newCanvas.getContext('2d');
            
            newCanvas.width = qrCanvas.width + (padding * 2);
            newCanvas.height = qrCanvas.height + (padding * 2) + (topText ? 30 : 0) + (bottomText ? 30 : 0);
            
            newCtx.fillStyle = '#FFFFFF';
            newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height);
            
            let yOffset = padding;
            
            if (topText) {
                newCtx.fillStyle = '#333333';
                newCtx.font = 'bold 18px Arial';
                newCtx.textAlign = 'center';
                newCtx.fillText(topText, newCanvas.width / 2, yOffset + 20);
                yOffset += 30;
            }
            
            newCtx.drawImage(qrCanvas, padding, yOffset);
            
            if (bottomText) {
                newCtx.fillStyle = '#333333';
                newCtx.font = '16px Arial';
                newCtx.textAlign = 'center';
                newCtx.fillText(bottomText, newCanvas.width / 2, yOffset + qrCanvas.height + 25);
            }
            
            qrCanvas.width = newCanvas.width;
            qrCanvas.height = newCanvas.height;
            ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
            ctx.drawImage(newCanvas, 0, 0);
        }
    }

    async addWhatsAppIcon(ctx, centerX, centerY) {
        const iconSize = 50;
        const bgSize = iconSize + 12;
        
        // Fondo blanco con borde
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(centerX, centerY, bgSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Borde gris suave
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Fondo verde de WhatsApp
        ctx.fillStyle = '#25D366';
        ctx.beginPath();
        ctx.arc(centerX, centerY, iconSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Dibujar el logo clásico de WhatsApp (globo de chat con teléfono)
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        
        // Globo de chat principal (círculo grande)
        ctx.beginPath();
        ctx.arc(centerX - 2, centerY - 3, 16, 0, 2 * Math.PI);
        ctx.fill();
        
        // Cola del globo (triángulo)
        ctx.beginPath();
        ctx.moveTo(centerX + 8, centerY + 8);
        ctx.lineTo(centerX + 15, centerY + 15);
        ctx.lineTo(centerX + 5, centerY + 12);
        ctx.closePath();
        ctx.fill();
        
        // Dibujar el teléfono dentro del globo
        ctx.fillStyle = '#25D366';
        ctx.strokeStyle = '#25D366';
        ctx.lineWidth = 2;
        
        // Cuerpo del teléfono
        ctx.beginPath();
        ctx.roundRect(centerX - 8, centerY - 12, 12, 18, 2);
        ctx.fill();
        
        // Pantalla del teléfono
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(centerX - 6, centerY - 10, 8, 12);
        
        // Auricular del teléfono (parte superior)
        ctx.fillStyle = '#25D366';
        ctx.beginPath();
        ctx.arc(centerX - 2, centerY - 14, 2, 0, Math.PI);
        ctx.fill();
        
        // Micrófono del teléfono (parte inferior)
        ctx.beginPath();
        ctx.arc(centerX - 2, centerY + 4, 1.5, 0, 2 * Math.PI);
        ctx.fill();
    }

    async addDNIIcon(ctx, centerX, centerY) {
        const iconSize = 50;
        const bgSize = iconSize + 12;
        
        // Fondo blanco con borde
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(centerX, centerY, bgSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Borde gris suave
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Fondo azul peruano para DNI
        ctx.fillStyle = '#C41E3A'; // Rojo de la bandera peruana
        ctx.beginPath();
        ctx.arc(centerX, centerY, iconSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Dibujar documento de identidad
        ctx.fillStyle = '#FFFFFF';
        
        // Documento principal (rectángulo)
        const docWidth = 20;
        const docHeight = 14;
        ctx.fillRect(centerX - docWidth/2, centerY - docHeight/2, docWidth, docHeight);
        
        // Borde del documento
        ctx.strokeStyle = '#C41E3A';
        ctx.lineWidth = 1;
        ctx.strokeRect(centerX - docWidth/2, centerY - docHeight/2, docWidth, docHeight);
        
        // Foto en el documento
        ctx.fillStyle = '#E0E0E0';
        ctx.fillRect(centerX - docWidth/2 + 2, centerY - docHeight/2 + 2, 6, 6);
        
        // Líneas de texto en el documento
        ctx.fillStyle = '#C41E3A';
        ctx.fillRect(centerX - docWidth/2 + 10, centerY - docHeight/2 + 3, 8, 1);
        ctx.fillRect(centerX - docWidth/2 + 10, centerY - docHeight/2 + 5, 6, 1);
        ctx.fillRect(centerX - docWidth/2 + 2, centerY - docHeight/2 + 9, 16, 1);
        ctx.fillRect(centerX - docWidth/2 + 2, centerY - docHeight/2 + 11, 12, 1);
        
        // Escudo o sello oficial (pequeño círculo)
        ctx.fillStyle = '#FFD700'; // Dorado
        ctx.beginPath();
        ctx.arc(centerX + 6, centerY + 4, 3, 0, 2 * Math.PI);
        ctx.fill();
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
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
        const successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>¡Código QR generado exitosamente!</span>
        `;
        
        document.body.appendChild(successElement);
        
        setTimeout(() => {
            successElement.style.opacity = '0';
            setTimeout(() => {
                if (successElement.parentNode) {
                    successElement.parentNode.removeChild(successElement);
                }
            }, 300);
        }, 2000);
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <i class="${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="close-btn" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    addQRValidationFeedback(content) {
        const previewBox = document.querySelector('.preview-box');
        if (!previewBox) return;
        
        let validationHTML = '';
        const qrType = this.currentQRType;
        
        switch (qrType) {
            case 'whatsapp':
                const match = content.match(/https:\/\/wa\.me\/(\d+)/);
                if (match) {
                    const phone = match[1];
                    validationHTML = `
                        <div class="validation-success">
                            <i class="fas fa-check-circle"></i>
                            <span>Número válido: +${phone}</span>
                        </div>
                    `;
                }
                break;
                
            case 'dni':
                if (content.length === 8) {
                    validationHTML = `
                        <div class="validation-success">
                            <i class="fas fa-check-circle"></i>
                            <span>DNI válido: ${content}</span>
                        </div>
                    `;
                }
                break;
                
            case 'text':
                if (this.isURL(content)) {
                    validationHTML = `
                        <div class="validation-info">
                            <i class="fas fa-link"></i>
                            <span>URL detectada</span>
                        </div>
                    `;
                } else if (this.isEmail(content)) {
                    validationHTML = `
                        <div class="validation-info">
                            <i class="fas fa-envelope"></i>
                            <span>Email detectado</span>
                        </div>
                    `;
                } else if (this.isWhatsApp(content)) {
                    validationHTML = `
                        <div class="validation-info">
                            <i class="fab fa-whatsapp"></i>
                            <span>WhatsApp detectado</span>
                        </div>
                    `;
                }
                break;
        }
        
        const existingValidation = previewBox.querySelector('.validation-feedback');
        if (existingValidation) {
            existingValidation.remove();
        }
        
        if (validationHTML) {
            const validationDiv = document.createElement('div');
            validationDiv.className = 'validation-feedback';
            validationDiv.innerHTML = validationHTML;
            previewBox.appendChild(validationDiv);
        }
    }

    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        document.body.appendChild(errorElement);
        
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.parentNode.removeChild(errorElement);
            }
        }, 5000);
    }

    downloadQR() {
        if (!this.currentQRDataURL) {
            this.showError('No hay código QR para descargar');
            return;
        }
        
        const link = document.createElement('a');
        link.download = `qr-code-${this.currentQRType}-${Date.now()}.png`;
        link.href = this.currentQRDataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showDownloadSuccess();
    }

    showDownloadSuccess() {
        const successElement = document.createElement('div');
        successElement.className = 'download-success';
        successElement.innerHTML = `
            <i class="fas fa-download"></i>
            <span>¡Código QR descargado exitosamente!</span>
        `;
        
        document.body.appendChild(successElement);
        
        setTimeout(() => {
            successElement.style.opacity = '0';
            setTimeout(() => {
                if (successElement.parentNode) {
                    successElement.parentNode.removeChild(successElement);
                }
            }, 300);
        }, 2000);
    }

    clearQR() {
        this.currentQRDataURL = null;
        this.qrStorage[this.currentQRType] = { content: '', qrDataURL: null };
        
        this.clearQRDisplay();
        
        switch (this.currentQRType) {
            case 'text':
                this.textInput.value = '';
                this.updateCharCount();
                break;
            case 'dni':
                this.dniInput.value = '';
                this.updateDNICount();
                break;
            case 'whatsapp':
                this.whatsappNumber.value = '';
                this.whatsappMessage.value = '';
                break;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const qrGenerator = new QRGenerator();
    
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            qrGenerator.clearQR();
        });
    }
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('darkTheme', isDark);
            
            const icon = themeToggle.querySelector('i');
            if (isDark) {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        });
        
        const savedTheme = localStorage.getItem('darkTheme');
        if (savedTheme === 'true') {
            document.body.classList.add('dark-theme');
            const icon = themeToggle.querySelector('i');
            icon.className = 'fas fa-sun';
        }
    }
    
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeHelp = document.getElementById('close-help');
    
    if (helpBtn && helpModal && closeHelp) {
        helpBtn.addEventListener('click', () => {
            helpModal.style.display = 'flex';
        });
        
        closeHelp.addEventListener('click', () => {
            helpModal.style.display = 'none';
        });
        
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.style.display = 'none';
            }
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
