// Currency symbols mapping
const currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'SGD': 'S$',
    'INR': '₹',
    'LKR': 'Rs',
    'GBP': '£',
    'JPY': '¥',
    'AUD': 'A$',
    'CAD': 'C$'
};

// Current currency state
let currentCurrency = 'USD';
let currentCurrencySymbol = '$';
let destinationCurrency = 'LKR';
let destinationCurrencySymbol = 'Rs';
let asAgreedMode = false;
let asAgreedConversionMode = false;

// Payment selection state
let showPrepaidInPreview = true;
let showCollectionInPreview = false;
let currentPaymentView = 'prepaid'; // 'prepaid', 'collection', or 'both'

// Global variables
let rateLines = 0;
let dimensionLines = 0;

// Enhanced error handling
console.log('Script loaded successfully');

// Check if all required elements exist
function checkRequiredElements() {
    const requiredElements = [
        'awb-preview',
        'rate-lines-container',
        'dimension-lines-container'
    ];
    
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.error('Missing required element:', id);
        } else {
            console.log('Found element:', id);
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    checkRequiredElements();
    initializeTabs();
    initializeRateLines();
    initializeDimensionLines();
    setupEventListeners();
    setDefaultValues();
    
    // Set default destination currency to LKR
    document.getElementById('destination-currency').value = 'LKR';
    destinationCurrency = 'LKR';
    destinationCurrencySymbol = 'Rs';
    
    // Update all currency symbols
    updateAllCurrencySymbols();
    updatePreview();
    
    // Show welcome notifications
    showNotification('Welcome to AWB Printing Software!', 'success');
    setTimeout(() => {
        showNotification('Please select payment type: Prepaid or Collection', 'warning');
    }, 2000);
});

// Tab management
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log('Found tab buttons:', tabButtons.length);
    console.log('Found tab contents:', tabContents.length);
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            console.log('Tab clicked:', tabId);
            
            // Remove active class from all tabs and buttons
            tabContents.forEach(tab => {
                tab.classList.remove('active');
                console.log('Removed active from:', tab.id);
            });
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to current tab and button
            const activeTab = document.getElementById(tabId);
            if (activeTab) {
                activeTab.classList.add('active');
                this.classList.add('active');
                console.log('Added active to:', tabId);
            } else {
                console.error('Tab not found:', tabId);
            }
        });
    });
    
    // Activate first tab by default
    if (tabButtons.length > 0) {
        tabButtons[0].click();
    }
}

// Rate Lines Management
function initializeRateLines() {
    addRateLine(); // Add first rate line by default
}

function addRateLine() {
    const maxLines = 1; // Set maximum lines
    if (rateLines >= maxLines) {
        alert(`Maximum ${maxLines} rate lines allowed`);
        return;
    }

    const container = document.getElementById('rate-lines-container');
    rateLines++;
    
    const rateLine = document.createElement('div');
    rateLine.className = 'rate-line';
    rateLine.innerHTML = `
        <input type="number" class="pieces" placeholder="0" min="0" value="0">
        <input type="number" class="weight" placeholder="0.0" step="0.1" min="0" value="0">
        <select class="unit">
            <option value="K">K</option>
            <option value="L">L</option>
        </select>
        <select class="rate-class">
            <option value="C">C</option>
            <option value="M">M</option>
            <option value="N">N</option>
            <option value="Q">Q</option>
        </select>
        <input type="text" class="commodity" placeholder="Item" maxlength="4">
        <input type="number" class="charge-weight" placeholder="0.0" step="0.1" min="0" value="0">
        <input type="number" class="rate-charge" placeholder="0.00" step="0.01" min="0" value="0">
        <input type="text" class="line-total" placeholder="0.00" readonly>
        <button type="button" class="remove-line-btn" onclick="removeRateLine(this)">×</button>
    `;
    
    container.appendChild(rateLine);
    document.getElementById('rate-line-count').textContent = rateLines;
    
    // Add event listeners to new inputs
    const inputs = rateLine.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', calculateRateLine);
    });
    
    calculateRateLine();
}

function removeRateLine(button) {
    if (rateLines > 1) {
        const rateLine = button.closest('.rate-line');
        rateLine.remove();
        rateLines--;
        document.getElementById('rate-line-count').textContent = rateLines;
        calculateRateLine();
    }
}

function calculateRateLine() {
    let totalPieces = 0;
    let totalWeight = 0;
    let totalCharge = 0;
    
    document.querySelectorAll('.rate-line').forEach(line => {
        const pieces = parseInt(line.querySelector('.pieces').value) || 0;
        const weight = parseFloat(line.querySelector('.weight').value) || 0;
        const chargeWeight = parseFloat(line.querySelector('.charge-weight').value) || 0;
        const rate = parseFloat(line.querySelector('.rate-charge').value) || 0;
        const lineTotal = chargeWeight * rate;
        
        line.querySelector('.line-total').value = lineTotal.toFixed(2);
        
        totalPieces += pieces;
        totalWeight += weight;
        totalCharge += lineTotal;
    });
    
    document.getElementById('total-pieces-display').textContent = totalPieces;
    document.getElementById('total-weight-display').textContent = totalWeight.toFixed(1);
    document.getElementById('total-charge-display').textContent = totalCharge.toFixed(2);
    
    // Update preview when rates change
    updatePreview();
}

// Dimension Lines Management
function initializeDimensionLines() {
    addDimensionLine(); // Add first dimension line by default
}

function addDimensionLine() {
    const maxLines = 25;
    if (dimensionLines >= maxLines) {
        alert(`Maximum ${maxLines} dimension lines allowed`);
        return;
    }
    
    const container = document.getElementById('dimension-lines-container');
    dimensionLines++;
    
    const dimensionLine = document.createElement('div');
    dimensionLine.className = 'dimension-line';
    dimensionLine.innerHTML = `
        <input type="number" class="dim-pieces" placeholder="0" min="0" value="0">
        <input type="number" class="dim-length" placeholder="0.0" step="0.1" min="0" value="0">
        <input type="number" class="dim-width" placeholder="0.0" step="0.1" min="0" value="0">
        <input type="number" class="dim-height" placeholder="0.0" step="0.1" min="0" value="0">
        <input type="text" class="line-volume" placeholder="0.000" readonly>
        <button type="button" class="remove-line-btn" onclick="removeDimensionLine(this)">×</button>
    `;
    
    container.appendChild(dimensionLine);
    document.getElementById('dimension-line-count').textContent = dimensionLines;
    
    // Add event listeners to new inputs
    const inputs = dimensionLine.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', calculateDimensionLine);
    });
    
    calculateDimensionLine();
}

function removeDimensionLine(button) {
    if (dimensionLines > 1) {
        const dimensionLine = button.closest('.dimension-line');
        dimensionLine.remove();
        dimensionLines--;
        document.getElementById('dimension-line-count').textContent = dimensionLines;
        calculateDimensionLine();
    }
}

function calculateDimensionLine() {
    let totalVolume = 0;
    
    document.querySelectorAll('.dimension-line').forEach(line => {
        const pieces = parseInt(line.querySelector('.dim-pieces').value) || 0;
        const length = parseFloat(line.querySelector('.dim-length').value) || 0;
        const width = parseFloat(line.querySelector('.dim-width').value) || 0;
        const height = parseFloat(line.querySelector('.dim-height').value) || 0;
        const lineVolume = (length * width * height * pieces) / 1000000; // Convert to CBM
        
        line.querySelector('.line-volume').value = lineVolume.toFixed(3);
        totalVolume += lineVolume;
    });
    
    document.getElementById('total-volume-display').textContent = totalVolume.toFixed(3) + ' CBM';
    
    // Update preview when dimensions change
    updatePreview();
}

// Setup event listeners
function setupEventListeners() {
    // Auto-update preview on input changes
    const previewInputs = document.querySelectorAll('input, textarea, select');
    previewInputs.forEach(input => {
        input.addEventListener('input', function() {
            setTimeout(updatePreview, 100);
        });
    });
}

function setDefaultValues() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('flight-date').value = today;
    document.getElementById('value-carriage').value = 'NVD';
    document.getElementById('value-customs').value = 'NCV';
}

// Currency Functions
function updateCurrency() {
    const currencySelect = document.getElementById('currency-code');
    const destCurrencySelect = document.getElementById('destination-currency');
    
    currentCurrency = currencySelect.value;
    currentCurrencySymbol = currencySymbols[currentCurrency] || '$';
    destinationCurrency = destCurrencySelect.value;
    destinationCurrencySymbol = currencySymbols[destinationCurrency] || 'Rs';
    
    // Update all currency symbols in form
    updateAllCurrencySymbols();
    
    // Update preview
    updatePreview();
    
    showNotification(`Currency changed to ${currentCurrency}`, 'success');
}

function updateAllCurrencySymbols() {
    // Update main currency symbols
    document.querySelectorAll('.currency-symbol').forEach(symbol => {
        const fieldId = symbol.id;
        if (fieldId.includes('cc-charges') || fieldId.includes('charges-at-destination') || fieldId.includes('converted-amount')) {
            symbol.textContent = destinationCurrencySymbol;
        } else {
            symbol.textContent = currentCurrencySymbol;
        }
    });
}

// Payment toggle functions
function togglePaymentOption(type) {
    // Update active state of toggle buttons
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show/hide relevant sections
    document.getElementById('prepaid-section').classList.remove('active');
    document.getElementById('collection-section').classList.remove('active');
    document.getElementById('both-section').classList.remove('active');
    
    currentPaymentView = type;
    
    if (type === 'both') {
        document.getElementById('both-section').classList.add('active');
        // Enable both checkboxes
        document.getElementById('show-prepaid').checked = true;
        document.getElementById('show-collection').checked = true;
        showPrepaidInPreview = true;
        showCollectionInPreview = true;
    } else if (type === 'prepaid') {
        document.getElementById('prepaid-section').classList.add('active');
        document.getElementById('show-prepaid').checked = true;
        document.getElementById('show-collection').checked = false;
        showPrepaidInPreview = true;
        showCollectionInPreview = false;
    } else if (type === 'collection') {
        document.getElementById('collection-section').classList.add('active');
        document.getElementById('show-prepaid').checked = false;
        document.getElementById('show-collection').checked = true;
        showPrepaidInPreview = false;
        showCollectionInPreview = true;
    }
    
    // Update preview
    updatePreview();
}

function updatePaymentSelection() {
    showPrepaidInPreview = document.getElementById('show-prepaid').checked;
    showCollectionInPreview = document.getElementById('show-collection').checked;
    
    // Update toggle button state based on checkboxes
    if (showPrepaidInPreview && showCollectionInPreview) {
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector('.payment-option[onclick="togglePaymentOption(\'both\')"]').classList.add('active');
        currentPaymentView = 'both';
    } else if (showPrepaidInPreview) {
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector('.payment-option[onclick="togglePaymentOption(\'prepaid\')"]').classList.add('active');
        currentPaymentView = 'prepaid';
    } else if (showCollectionInPreview) {
        document.querySelectorAll('.payment-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector('.payment-option[onclick="togglePaymentOption(\'collection\')"]').classList.add('active');
        currentPaymentView = 'collection';
    }
    
    updatePreview();
}

function updateAsAgreedMode() {
    asAgreedMode = document.getElementById('as-agreed-mode').checked;
    updatePreview();
}

function updateAsAgreedConversionMode() {
    asAgreedConversionMode = document.getElementById('as-agreed-conversion-mode').checked;
    updatePreview();
}

// Charge Calculation Functions
function calculatePrepaidTotal() {
    const weightCharge = parseFloat(document.getElementById('weight-charge-pp').value) || 0;
    const valuationCharge = parseFloat(document.getElementById('valuation-charge-pp').value) || 0;
    const tax = parseFloat(document.getElementById('tax-pp').value) || 0;
    const otherChargesAgent = parseFloat(document.getElementById('other-charges-agent-pp').value) || 0;
    const otherChargesCarrier = parseFloat(document.getElementById('other-charges-carrier-pp').value) || 0;
    
    const total = weightCharge + valuationCharge + tax + otherChargesAgent + otherChargesCarrier;
    
    document.getElementById('total-prepaid').value = total.toFixed(2);
    
    // Update currency conversion
    updateCurrencyConversion();
    
    // Update preview
    updatePreview();
}

function calculateCollectionTotal() {
    const weightCharge = parseFloat(document.getElementById('weight-charge-col').value) || 0;
    const valuationCharge = parseFloat(document.getElementById('valuation-charge-col').value) || 0;
    const tax = parseFloat(document.getElementById('tax-col').value) || 0;
    const otherChargesAgent = parseFloat(document.getElementById('other-charges-agent-col').value) || 0;
    const otherChargesCarrier = parseFloat(document.getElementById('other-charges-carrier-col').value) || 0;
    const ccChargesDest = parseFloat(document.getElementById('cc-charges-dest').value) || 0;
    const chargesAtDestination = parseFloat(document.getElementById('charges-at-destination').value) || 0;
    
    const totalCollection = weightCharge + valuationCharge + tax + otherChargesAgent + otherChargesCarrier;
    const totalCollectCharges = totalCollection + ccChargesDest + chargesAtDestination;
    
    document.getElementById('total-collection').value = totalCollection.toFixed(2);
    document.getElementById('total-collect-charges').value = totalCollectCharges.toFixed(2);
    
    // Update currency conversion
    updateCurrencyConversion();
    
    // Update preview
    updatePreview();
}

function updateCurrencyConversion() {
    const conversionRate = parseFloat(document.getElementById('conversion-rate').value) || 1;
    
    // Get the appropriate total based on active section
    let totalAmount = 0;
    const isPrepaid = document.getElementById('prepaid-section').classList.contains('active');
    
    if (isPrepaid) {
        totalAmount = parseFloat(document.getElementById('total-prepaid').value) || 0;
    } else {
        totalAmount = parseFloat(document.getElementById('total-collect-charges').value) || 0;
    }
    
    const convertedAmount = totalAmount * conversionRate;
    document.getElementById('converted-amount').value = convertedAmount.toFixed(2);
    
    // Update preview
    updatePreview();
}

// Main Preview Function
function updatePreview() {
    const preview = document.getElementById('awb-preview');
    const awbNumber = getValue('awb-number-1a') || '';
    const awbSuffix = getValue('awb-number-1b') || '';
    
    preview.innerHTML = `
        <!-- AWB Number Fields -->
        <div class="awb-field field-1a">${awbNumber || '618'}</div>
        <div class="awb-field field-1b">${awbSuffix || '12345675'}</div>
        <div class="awb-field field-1">${getValue('origin-iata') || 'ORG'}</div>

        <!-- DUPLICATE FIELDS IN NEW POSITION-1 -->
        <div class="awb-field field-1a-copy">${awbNumber || '618'}</div>
        <div class="awb-field field-hyphen">-</div>
        <div class="awb-field field-1b-copy">${awbSuffix || '12345675'}</div>

        <div class="awb-field field-1a-copy-1">${awbNumber || '618'}</div>
        <div class="awb-field field-hyphen-1">-</div>
        <div class="awb-field field-1b-copy-1">${awbSuffix || '12345675'}</div>

        <!-- Shipper -->
        <div class="awb-field field-3">${formatShipper()}</div>
        <div class="awb-field field-3a">${getValue('shipper-account') || 'SHIP ACC'}</div>

        <!-- Consignee -->
        <div class="awb-field field-5">${formatConsignee()}</div>
        <div class="awb-field field-5a">${getValue('consignee-account') || 'CNE ACC'}</div>
        
        <!-- Agent Details -->
        <div class="awb-field field-6">${getValue('agent-name') || 'AGENT'}</div>
        <div class="awb-field field-7">${getValue('agent-iata') || 'IATA'}</div>
        <div class="awb-field field-8">${getValue('agent-account') || 'ACC'}</div>
        <div class="awb-field field-10">${getValue('accounting-info') || 'ACCOUNTING'}</div>
        
        <!-- Routing -->
        <div class="awb-field field-11a">${getValue('routing-to1') || 'TO1'}</div>
        <div class="awb-field field-11b">${getValue('routing-by1') || 'BY1'}</div>  
        <div class="awb-field field-11c">${getValue('routing-to2') || 'TO2'}</div>
        <div class="awb-field field-11d">${getValue('routing-by2') || 'BY2'}</div>
        <div class="awb-field field-11e">${getValue('routing-to3') || 'TO3'}</div>
        <div class="awb-field field-11f">${getValue('routing-by3') || 'BY3'}</div>

        <!-- Flight Details -->
        <div class="awb-field field-19a">${formatFlightDate()}</div>
        <div class="awb-field field-19b">${getValue('flight-number') || 'FLIGHT'}</div>
        
        <!-- Goods Section 22 - Totals -->
        <div class="awb-field field-22j">${document.getElementById('total-pieces-display').textContent}</div>
        <div class="awb-field field-22k">${document.getElementById('total-weight-display').textContent}</div>
        <div class="awb-field field-22l">${document.getElementById('total-charge-display').textContent}</div>

        <!-- RATE DESCRIPTION LINES -->
        ${generateRateLinesPreview()}

        <!-- DIMENSION LINES -->
        ${generateDimensionLinesPreview()}

        <!-- TOTAL DIMENSION VOLUME -->
        <div class="awb-field dimension-total-display">${getTotalDimensionVolume()}</div>

        <!-- Goods Description -->
        <div class="awb-field field-22i">${getValue('goods-description') || ''}</div>
        
        <!-- SEPARATOR LINES -->
        <div class="awb-field section-separator">---------------------</div>
        
        <!-- Currency and Payment Type -->
        <div class="awb-field field-currency">${currentCurrency}</div>
        <div class="awb-field field-payment-type">${getPaymentTypeDisplay()}</div>

        <!-- Declared Values -->
        <div class="awb-field field-13a">${getValue('value-carriage') || 'NVD'}</div>
        <div class="awb-field field-13b">${getValue('value-customs') || 'NCV'}</div>

        <!-- Prepaid Charges Section -->
        ${showPrepaidInPreview ? `
            <div class="awb-field field-weight-charge-pp ${asAgreedMode ? 'as-agreed' : ''}">${asAgreedMode ? 'AS AGREED' : currentCurrencySymbol + ' ' + (getValue('weight-charge-pp') || '0.00')}</div>
            <div class="awb-field field-valuation-charge-pp ${asAgreedMode ? 'as-agreed' : ''}">${asAgreedMode ? 'AS AGREED' : currentCurrencySymbol + ' ' + (getValue('valuation-charge-pp') || '0.00')}</div>
            <div class="awb-field field-tax-pp ${asAgreedMode ? 'as-agreed' : ''}">${asAgreedMode ? 'AS AGREED' : currentCurrencySymbol + ' ' + (getValue('tax-pp') || '0.00')}</div>
            <div class="awb-field field-other-agent-pp ${asAgreedMode ? 'as-agreed' : ''}">${asAgreedMode ? 'AS AGREED' : currentCurrencySymbol + ' ' + (getValue('other-charges-agent-pp') || '0.00')}</div>
            <div class="awb-field field-other-carrier-pp ${asAgreedMode ? 'as-agreed' : ''}">${asAgreedMode ? 'AS AGREED' : currentCurrencySymbol + ' ' + (getValue('other-charges-carrier-pp') || '0.00')}</div>
            <div class="awb-field field-total-prepaid ${asAgreedMode ? 'as-agreed' : ''}">${asAgreedMode ? 'AS AGREED' : currentCurrencySymbol + ' ' + (getValue('total-prepaid') || '0.00')}</div>
        ` : ''}
        
        <!-- Collection Charges Section -->
        ${showCollectionInPreview ? `
            <div class="awb-field field-weight-charge-col ${asAgreedMode ? 'as-agreed' : ''}">${asAgreedMode ? 'AS AGREED' : currentCurrencySymbol + ' ' + (getValue('weight-charge-col') || '0.00')}</div>
            <div class="awb-field field-valuation-charge-col ${asAgreedMode ? 'as-agreed' : ''}">${asAgreedMode ? 'AS AGREED' : currentCurrencySymbol + ' ' + (getValue('valuation-charge-col') || '0.00')}</div>
            <div class="awb-field field-tax-col ${asAgreedMode ? 'as-agreed' : ''}">${asAgreedMode ? 'AS AGREED' : currentCurrencySymbol + ' ' + (getValue('tax-col') || '0.00')}</div>
            <div class="awb-field field-other-agent-col ${asAgreedMode ? 'as-agreed' : ''}">${asAgreedMode ? 'AS AGREED' : currentCurrencySymbol + ' ' + (getValue('other-charges-agent-col') || '0.00')}</div>
            <div class="awb-field field-other-carrier-col ${asAgreedMode ? 'as-agreed' : ''}">${asAgreedMode ? 'AS AGREED' : currentCurrencySymbol + ' ' + (getValue('other-charges-carrier-col') || '0.00')}</div>
            <div class="awb-field field-cc-charges ${asAgreedMode ? 'as-agreed' : ''}">${asAgreedMode ? 'AS AGREED' : destinationCurrencySymbol + ' ' + (getValue('cc-charges-dest') || '0.00')}</div>
            <div class="awb-field field-dest-charges ${asAgreedMode ? 'as-agreed' : ''}">${asAgreedMode ? 'AS AGREED' : destinationCurrencySymbol + ' ' + (getValue('charges-at-destination') || '0.00')}</div>
            <div class="awb-field field-total-collection ${asAgreedMode ? 'as-agreed' : ''}">${asAgreedMode ? 'AS AGREED' : currentCurrencySymbol + ' ' + (getValue('total-collection') || '0.00')}</div>
            <div class="awb-field field-total-collect-charges ${asAgreedMode ? 'as-agreed' : ''}">${asAgreedMode ? 'AS AGREED' : currentCurrencySymbol + ' ' + (getValue('total-collect-charges') || '0.00')}</div>
        ` : ''}
        
        <!-- Currency Conversion -->
        <div class="awb-field field-conversion-rate ${asAgreedConversionMode ? 'as-agreed' : ''}">${asAgreedConversionMode ? 'AS AGREED' : currentCurrencySymbol + ' ' + (getValue('conversion-rate') || '1.00')}</div>
        <div class="awb-field field-converted-amount ${asAgreedConversionMode ? 'as-agreed' : ''}">${asAgreedConversionMode ? 'AS AGREED' : destinationCurrencySymbol + ' ' + (getValue('converted-amount') || '0.00')}</div>
        
        <!-- Special -->
        <div class="awb-field field-15">${getValue('handling-info') || ''}</div>
    `;
}

// Helper functions for preview
function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : '';
}

function formatShipper() {
    const name = getValue('shipper-name');
    const address = getValue('shipper-address');
    const city = getValue('shipper-city');
    const country = getValue('shipper-country');
    
    if (!name) return 'Shipper Name and Address';
    
    return `${name}\n${address}\n${city}, ${country}`;
}

function formatConsignee() {
    const name = getValue('consignee-name');
    const address = getValue('consignee-address');
    const city = getValue('consignee-city');
    const country = getValue('consignee-country');
    
    if (!name) return 'Consignee Name and Address';
    
    return `${name}\n${address}\n${city}, ${country}`;
}

function formatFlightDate() {
    const date = getValue('flight-date');
    if (!date) return 'DDMMYY';
    
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    
    return `${day}${month}${year}`;
}

// Helper function for payment type display
function getPaymentTypeDisplay() {
    if (showPrepaidInPreview && showCollectionInPreview) {
        return 'PP/CC';
    } else if (showPrepaidInPreview) {
        return 'PP';
    } else if (showCollectionInPreview) {
        return 'CC';
    }
    return '';
}

function generateRateLinesPreview() {
    const rateLines = document.querySelectorAll('.rate-line');
    let html = '';
    
    rateLines.forEach((line, index) => {
        if (index < 1) { // Limit to 1 line in preview
            const pieces = line.querySelector('.pieces').value || '0';
            const weight = line.querySelector('.weight').value || '0.0';
            const unit = line.querySelector('.unit').value || 'K';
            const rateClass = line.querySelector('.rate-class').value || '';
            const commodity = line.querySelector('.commodity').value || '';
            const chargeWeight = line.querySelector('.charge-weight').value || '0.0';
            const rateCharge = line.querySelector('.rate-charge').value || '0.00';
            const total = line.querySelector('.line-total').value || '0.00';
            
            const lineNumber = index + 1;
            
            html += `
                <div class="awb-field rate-pieces-${lineNumber}">${pieces}</div>
                <div class="awb-field rate-weight-${lineNumber}">${weight}</div>
                <div class="awb-field rate-unit-${lineNumber}">${unit}</div>
                <div class="awb-field rate-class-${lineNumber}">${rateClass}</div>
                <div class="awb-field rate-commodity-${lineNumber}">${commodity}</div>
                <div class="awb-field rate-charge-weight-${lineNumber}">${chargeWeight}</div>
                <div class="awb-field rate-charge-${lineNumber}">${rateCharge}</div>
                <div class="awb-field rate-total-${lineNumber}">${total}</div>
            `;
        }
    });
    
    return html;
}

function generateDimensionLinesPreview() {
    const dimLines = document.querySelectorAll('.dimension-line');
    let html = '';
    
    dimLines.forEach((line, index) => {
        if (index < 25) {
            const length = line.querySelector('.dim-length').value || '0.0';
            const width = line.querySelector('.dim-width').value || '0.0';
            const height = line.querySelector('.dim-height').value || '0.0';
            const pieces = line.querySelector('.dim-pieces').value || '0';
            
            const lineText = `${length}x${width}x${height}cm = ${pieces} pcs,`;
            html += `<div class="awb-field dim-line-preview-${index + 1}">${lineText}</div>`;
        }
    });
    
    return html;
}

function getTotalDimensionVolume() {
    let totalVolume = 0;
    
    document.querySelectorAll('.dimension-line').forEach(line => {
        const pieces = parseInt(line.querySelector('.dim-pieces').value) || 0;
        const length = parseFloat(line.querySelector('.dim-length').value) || 0;
        const width = parseFloat(line.querySelector('.dim-width').value) || 0;
        const height = parseFloat(line.querySelector('.dim-height').value) || 0;
        const lineVolume = (length * width * height * pieces) / 1000000;
        
        totalVolume += lineVolume;
    });
    
    return totalVolume.toFixed(3) + ' CBM';
}

// Clear functions
function clearCurrentTab() {
    const activeTab = document.querySelector('.tab-content.active');
    const inputs = activeTab.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (input.type !== 'button' && !input.classList.contains('total-field')) {
            input.value = '';
        }
    });
    updatePreview();
}

function clearAllTabs() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (input.type !== 'button' && !input.classList.contains('total-field')) {
            input.value = '';
        }
    });
    setDefaultValues();
    updatePreview();
}

// FWB Generation
function generateFWB() {
    const fwbMessage = buildFWBMessage();
    document.getElementById('fwb-message').value = fwbMessage;
    document.getElementById('fwb-output').style.display = 'block';
}

function buildFWBMessage() {
    let fwb = 'FWB/1\n';
    
    // Basic consignment info
    fwb += `${getValue('awb-number-1a') || '000'}${getValue('awb-number-1b') || '00000000'}${getValue('origin-iata') || 'XXX'}/`;
    fwb += `T${document.getElementById('total-pieces-display').textContent}K${document.getElementById('total-weight-display').textContent}\n`;
    
    // Shipper
    if (getValue('shipper-name')) {
        fwb += `SHP\n/${getValue('shipper-name')}\n`;
        fwb += `/${getValue('shipper-address')}\n`;
        fwb += `/${getValue('shipper-city')}\n`;
        fwb += `/${getValue('shipper-country')}\n`;
    }
    
    // Consignee
    if (getValue('consignee-name')) {
        fwb += `CNE\n/${getValue('consignee-name')}\n`;
        fwb += `/${getValue('consignee-address')}\n`;
        fwb += `/${getValue('consignee-city')}\n`;
        fwb += `/${getValue('consignee-country')}\n`;
    }
    
    return fwb;
}

function copyFWB() {
    const fwbText = document.getElementById('fwb-message');
    fwbText.select();
    document.execCommand('copy');
    alert('FWB message copied to clipboard!');
}

function printAWB() {
    window.print();
}

// Notification system
function showNotification(message, type = 'success') {
    const container = document.getElementById('notifications-container');
    if (!container) {
        console.error('Notifications container not found');
        return;
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-btn" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Debug function
function debugDimensions() {
    console.log('=== DEBUG DIMENSIONS ===');
    console.log('Dimension lines found:', document.querySelectorAll('.dimension-line').length);
    console.log('Total volume display:', document.getElementById('total-volume-display').textContent);
    
    const dimLines = document.querySelectorAll('.dimension-line');
    dimLines.forEach((line, index) => {
        const pieces = line.querySelector('.dim-pieces').value;
        const length = line.querySelector('.dim-length').value;
        const width = line.querySelector('.dim-width').value;
        const height = line.querySelector('.dim-height').value;
        console.log(`Line ${index + 1}:`, { pieces, length, width, height });
    });
    
    console.log('Generated preview HTML:', generateDimensionLinesPreview());
    console.log('Total volume:', getTotalDimensionVolume());
}

// Toggle functions for large tick buttons
function toggleAsAgreed() {
    asAgreedMode = !asAgreedMode;
    document.getElementById('as-agreed-mode').checked = asAgreedMode;
    updatePreview();
}

function toggleAsAgreedConversion() {
    asAgreedConversionMode = !asAgreedConversionMode;
    document.getElementById('as-agreed-conversion-mode').checked = asAgreedConversionMode;
    updatePreview();
}

// Fix for currency symbol visibility
function fixCurrencySymbolVisibility() {
    // Add padding to all currency input fields to make room for symbols
    document.querySelectorAll('.currency-input-group input').forEach(input => {
        if (!input.style.paddingLeft || input.style.paddingLeft === '12px') {
            input.style.paddingLeft = '35px';
        }
    });
}

// Initialize currency symbol visibility fix
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(fixCurrencySymbolVisibility, 100);
});

// Fix currency symbol visibility
function fixCurrencySymbolVisibility() {
    document.querySelectorAll('.currency-input-group input').forEach(input => {
        input.style.paddingLeft = '45px';
    });
}

// Toggle functions for large tick buttons
let asAgreedConversionMode = false;

function toggleAsAgreedConversion() {
    asAgreedConversionMode = !asAgreedConversionMode;
    const button = document.getElementById('as-agreed-conversion-btn');
    
    if (asAgreedConversionMode) {
        button.classList.add('active');
        button.innerHTML = '✓ AS AGREED';
        // Clear conversion values
        document.getElementById('conversion-rate').value = '';
        document.getElementById('converted-amount').value = '';
    } else {
        button.classList.remove('active');
        button.innerHTML = 'AS AGREED';
        // Restore default conversion rate
        document.getElementById('conversion-rate').value = '1.00';
        updateCurrencyConversion();
    }
    
    updatePreview();
}

// Update the updatePreview function to include AS AGREED for conversion
// Replace the Currency Conversion section in updatePreview() with this:
function updatePreview() {
    // ... existing code ...
    
    preview.innerHTML = `
        <!-- ... all existing preview content ... -->
        
        <!-- Currency Conversion -->
        <div class="awb-field field-conversion-rate ${asAgreedConversionMode ? 'as-agreed' : ''}">
            ${asAgreedConversionMode ? 'AS AGREED' : currentCurrencySymbol + ' ' + (getValue('conversion-rate') || '1.00')}
        </div>
        <div class="awb-field field-converted-amount ${asAgreedConversionMode ? 'as-agreed' : ''}">
            ${asAgreedConversionMode ? 'AS AGREED' : destinationCurrencySymbol + ' ' + (getValue('converted-amount') || '0.00')}
        </div>
        
        <!-- ... rest of preview content ... -->
    `;
}

// Fix payment selection
function updatePaymentSelection() {
    showPrepaidInPreview = document.getElementById('show-prepaid').checked;
    showCollectionInPreview = document.getElementById('show-collection').checked;
    
    // Update toggle button state based on checkboxes
    const prepaidBtn = document.querySelector('.payment-option[onclick="togglePaymentOption(\'prepaid\')"]');
    const collectionBtn = document.querySelector('.payment-option[onclick="togglePaymentOption(\'collection\')"]');
    const bothBtn = document.querySelector('.payment-option[onclick="togglePaymentOption(\'both\')"]');
    
    if (showPrepaidInPreview && showCollectionInPreview) {
        document.querySelectorAll('.payment-option').forEach(option => option.classList.remove('active'));
        bothBtn.classList.add('active');
        currentPaymentView = 'both';
        document.getElementById('both-section').classList.add('active');
        document.getElementById('prepaid-section').classList.remove('active');
        document.getElementById('collection-section').classList.remove('active');
    } else if (showPrepaidInPreview) {
        document.querySelectorAll('.payment-option').forEach(option => option.classList.remove('active'));
        prepaidBtn.classList.add('active');
        currentPaymentView = 'prepaid';
        document.getElementById('prepaid-section').classList.add('active');
        document.getElementById('collection-section').classList.remove('active');
        document.getElementById('both-section').classList.remove('active');
    } else if (showCollectionInPreview) {
        document.querySelectorAll('.payment-option').forEach(option => option.classList.remove('active'));
        collectionBtn.classList.add('active');
        currentPaymentView = 'collection';
        document.getElementById('collection-section').classList.add('active');
        document.getElementById('prepaid-section').classList.remove('active');
        document.getElementById('both-section').classList.remove('active');
    }
    
    updatePreview();
}

// Initialize the fixes when page loads
document.addEventListener('DOMContentLoaded', function() {
    // ... your existing initialization code ...
    
    // Fix currency symbol visibility
    setTimeout(fixCurrencySymbolVisibility, 100);
    
    // Initialize payment selection
    updatePaymentSelection();
});