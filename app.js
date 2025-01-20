// DOM Elements
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const toggleAuthBtn = document.getElementById('toggleAuth');
const settingsBtn = document.getElementById('settingsBtn');
const logoutBtn = document.getElementById('logoutBtn');
const voiceInputBtn = document.getElementById('voiceInputBtn');
const createInvoiceBtn = document.getElementById('createInvoiceBtn');
const invoiceForm = document.getElementById('invoiceForm');
const settingsPanel = document.getElementById('settingsPanel');
const addItemBtn = document.getElementById('addItemBtn');
const itemsList = document.getElementById('itemsList');

// State Management
let currentUser = null;
let businessSettings = null;
let recognition = null;

// Initialize Speech Recognition
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        processVoiceInput(transcript);
    };

    recognition.onerror = (event) => {
        alert('Error occurred in recognition: ' + event.error);
    };
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showApp();
        loadBusinessSettings();
    }
});

toggleAuthBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.toggle('hidden');
    signupForm.classList.toggle('hidden');
    const isLogin = loginForm.classList.contains('hidden');
    toggleAuthBtn.textContent = isLogin ? 'Login' : 'Sign Up';
});

loginForm.addEventListener('submit', handleLogin);
signupForm.addEventListener('submit', handleSignup);
logoutBtn.addEventListener('click', handleLogout);
settingsBtn.addEventListener('click', toggleSettings);
voiceInputBtn.addEventListener('click', startVoiceRecognition);
createInvoiceBtn.addEventListener('click', () => {
    invoiceForm.classList.remove('hidden');
    settingsPanel.classList.add('hidden');
});

addItemBtn.addEventListener('click', addItemRow);
document.querySelector('#invoiceForm form').addEventListener('submit', handleInvoiceSubmit);
document.querySelector('#businessSettingsForm').addEventListener('submit', handleSettingsSave);

// Auth Functions
function handleLogin(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    // Simple validation for demo
    if (email && password) {
        currentUser = { email };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showApp();
    }
}

function handleSignup(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    const confirmPassword = e.target.querySelectorAll('input[type="password"]')[1].value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Simple validation for demo
    if (email && password) {
        currentUser = { email };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showApp();
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showAuth();
}

// UI Functions
function showAuth() {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
}

function showApp() {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
}

function toggleSettings() {
    settingsPanel.classList.toggle('hidden');
    invoiceForm.classList.add('hidden');
}

// Business Settings Functions
function loadBusinessSettings() {
    const saved = localStorage.getItem(`businessSettings_${currentUser.email}`);
    if (saved) {
        businessSettings = JSON.parse(saved);
        populateSettingsForm();
    }
}

function populateSettingsForm() {
    if (!businessSettings) return;

    const form = document.getElementById('businessSettingsForm');
    form.businessName.value = businessSettings.businessName || '';
    form.businessAddress.value = businessSettings.businessAddress || '';
    form.gstin.value = businessSettings.gstin || '';
    form.phone.value = businessSettings.phone || '';
    form.email.value = businessSettings.email || '';
}

function handleSettingsSave(e) {
    e.preventDefault();
    const form = e.target;
    
    businessSettings = {
        businessName: form.businessName.value,
        businessAddress: form.businessAddress.value,
        gstin: form.gstin.value,
        phone: form.phone.value,
        email: form.email.value
    };

    localStorage.setItem(`businessSettings_${currentUser.email}`, JSON.stringify(businessSettings));
    alert('Settings saved successfully!');
    settingsPanel.classList.add('hidden');
}

// Invoice Functions
function addItemRow() {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
        <input type="text" placeholder="Item name" required>
        <input type="number" placeholder="Quantity" required>
        <input type="number" placeholder="Price" required>
        <button type="button" class="remove-item"><i class="fas fa-times"></i></button>
    `;

    row.querySelector('.remove-item').addEventListener('click', () => row.remove());
    itemsList.appendChild(row);
}

function handleInvoiceSubmit(e) {
    e.preventDefault();
    const customerName = document.getElementById('customerName').value;
    const items = [];
    const rows = itemsList.querySelectorAll('.item-row');

    rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        items.push({
            name: inputs[0].value,
            quantity: inputs[1].value,
            price: inputs[2].value
        });
    });

    generateInvoice(customerName, items);
}

function generateInvoice(customerName, items) {
    if (!businessSettings) {
        alert('Please configure business settings first!');
        return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let y = 20;

    // Header
    doc.setFontSize(20);
    doc.text('INVOICE', pageWidth / 2, y, { align: 'center' });
    
    // Business Details
    y += 20;
    doc.setFontSize(12);
    doc.text(businessSettings.businessName, 20, y);
    doc.text(new Date().toLocaleDateString(), pageWidth - 20, y, { align: 'right' });
    
    y += 10;
    doc.text(businessSettings.businessAddress, 20, y);
    
    y += 10;
    doc.text(`GSTIN: ${businessSettings.gstin}`, 20, y);
    
    // Customer Details
    y += 20;
    doc.text(`Customer: ${customerName}`, 20, y);
    
    // Items Table
    y += 20;
    doc.line(20, y, pageWidth - 20, y);
    y += 10;
    
    // Table Header
    doc.text('Item', 20, y);
    doc.text('Qty', 100, y);
    doc.text('Price', 140, y);
    doc.text('Total', pageWidth - 40, y);
    
    y += 10;
    doc.line(20, y, pageWidth - 20, y);
    
    // Items
    let total = 0;
    items.forEach(item => {
        y += 10;
        const itemTotal = item.quantity * item.price;
        total += itemTotal;
        
        doc.text(item.name, 20, y);
        doc.text(item.quantity.toString(), 100, y);
        doc.text(`₹${item.price}`, 140, y);
        doc.text(`₹${itemTotal}`, pageWidth - 40, y);
    });
    
    // Total
    y += 15;
    doc.line(20, y, pageWidth - 20, y);
    y += 10;
    doc.setFont(undefined, 'bold');
    doc.text('Total:', pageWidth - 80, y);
    doc.text(`₹${total}`, pageWidth - 40, y);
    
    // Footer
    y = doc.internal.pageSize.height - 30;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('Thank you for your business!', pageWidth / 2, y, { align: 'center' });
    
    // Save PDF
    doc.save(`Invoice_${customerName}_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Voice Input Processing
function startVoiceRecognition() {
    if (!recognition) {
        alert('Speech recognition is not supported in your browser.');
        return;
    }

    voiceInputBtn.disabled = true;
    voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i> Listening...';
    recognition.start();

    recognition.onend = () => {
        voiceInputBtn.disabled = false;
        voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i> Voice Input';
    };
}

function processVoiceInput(transcript) {
    console.log('Voice Input:', transcript);
    
    // Simple pattern matching for demo
    // Example: "Sold 3 units of product A to Mr. John for Rs. 100 each"
    const pattern = /(?:sold|purchased|bought)\s+(\d+)\s+(?:units? of)?\s+(.+?)\s+to\s+(.+?)\s+for\s+(?:Rs\.|₹)\s*(\d+)/i;
    const match = transcript.match(pattern);

    if (match) {
        const [_, quantity, product, customer, price] = match;
        
        // Fill the form
        document.getElementById('customerName').value = customer;
        
        // Add item
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <input type="text" placeholder="Item name" required value="${product}">
            <input type="number" placeholder="Quantity" required value="${quantity}">
            <input type="number" placeholder="Price" required value="${price}">
            <button type="button" class="remove-item"><i class="fas fa-times"></i></button>
        `;

        row.querySelector('.remove-item').addEventListener('click', () => row.remove());
        itemsList.appendChild(row);
        
        // Show the form
        invoiceForm.classList.remove('hidden');
    } else {
        alert('Could not understand the voice input. Please try again or use manual input.');
    }
}

// Google Sign-In Handler
function handleGoogleSignIn(response) {
    const credential = response.credential;
    const payload = JSON.parse(atob(credential.split('.')[1]));
    
    // Extract user info from Google response
    const user = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture
    };

    // Save user info and show app
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showApp();
    loadBusinessSettings();

    // Pre-fill business settings with Google account info if not already set
    if (!businessSettings) {
        const form = document.getElementById('businessSettingsForm');
        form.email.value = user.email;
        form.businessName.value = user.name;
    }
} 