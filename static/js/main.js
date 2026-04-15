document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const filenameDisplay = document.getElementById('filename-display');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.querySelector('.toggle-password');
    const statusMessage = document.getElementById('status-message');
    const loader = document.getElementById('loader');
    const encryptBtn = document.querySelector('.btn-encrypt');
    const decryptBtn = document.querySelector('.btn-decrypt');
    
    // Toggle Password Visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('bx-show');
        togglePassword.classList.toggle('bx-hide');
    });

    // File Upload Drag & Drop Styling
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('dragover');
        });
    });

    uploadArea.addEventListener('drop', (e) => {
        let dt = e.dataTransfer;
        let files = dt.files;
        if(files.length) {
            fileInput.files = files;
            updateFilename();
        }
    });

    fileInput.addEventListener('change', updateFilename);

    function updateFilename() {
        if(fileInput.files.length > 0) {
            filenameDisplay.innerHTML = `Selected: <span>${fileInput.files[0].name}</span>`;
            uploadArea.style.borderColor = 'var(--primary)';
        } else {
            filenameDisplay.innerHTML = 'Drag & drop a file here or <span>browse</span>';
            uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }
    }

    // Handle Form Actions
    encryptBtn.addEventListener('click', () => processFile('encrypt'));
    decryptBtn.addEventListener('click', () => processFile('decrypt'));

    async function processFile(action) {
        // Validation
        if (!fileInput.files.length) {
            showStatus('Please select a file first.', 'error');
            return;
        }
        if (!passwordInput.value) {
            showStatus('Please enter a secure password.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('password', passwordInput.value);
        formData.append('action', action);

        // UI Loading State
        setLoading(true);
        hideStatus();

        // Visual Animation for AES Steps
        const steps = document.querySelectorAll('.aes-info .step');
        steps.forEach((s, index) => {
            s.classList.remove('active', 'completed');
            const num = s.querySelector('.step-num');
            if (num) num.innerHTML = index + 1;
        });

        const animateSteps = async () => {
            const isDecrypt = action === 'decrypt';
            const start = isDecrypt ? steps.length - 1 : 0;
            const end = isDecrypt ? -1 : steps.length;
            const stepAmount = isDecrypt ? -1 : 1;

            for (let i = start; i !== end; i += stepAmount) {
                steps[i].classList.add('active');
                await new Promise(r => setTimeout(r, 600)); // Delay to show step progress
                steps[i].classList.remove('active');
                steps[i].classList.add('completed');
                const num = steps[i].querySelector('.step-num');
                if (num) num.innerHTML = "<i class='bx bx-check'></i>";
            }
        };

        try {
            const fetchPromise = fetch('/process', {
                method: 'POST',
                body: formData
            });

            const [response] = await Promise.all([fetchPromise, animateSteps()]);

            if (response.ok) {
                // Determine filename from Content-Disposition header if available
                let filename = 'downloaded_file';
                const disposition = response.headers.get('Content-Disposition');
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    const matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) { 
                        filename = matches[1].replace(/['"]/g, '');
                    }
                }

                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(downloadUrl);

                showStatus(`Success! File processed as ${filename}`, 'success');
                passwordInput.value = ''; // clear password for safety
            } else {
                const errorData = await response.json();
                showStatus(errorData.error || 'An unexpected error occurred.', 'error');
            }
        } catch (error) {
            showStatus('Network error or server is down.', 'error');
        } finally {
            setLoading(false);
        }
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = type;
        statusMessage.classList.remove('hidden');
    }

    function hideStatus() {
        statusMessage.classList.add('hidden');
    }

    function setLoading(isLoading) {
        if (isLoading) {
            loader.classList.remove('hidden');
            encryptBtn.disabled = true;
            decryptBtn.disabled = true;
        } else {
            loader.classList.add('hidden');
            encryptBtn.disabled = false;
            decryptBtn.disabled = false;
        }
    }
});
