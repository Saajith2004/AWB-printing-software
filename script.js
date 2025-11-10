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

// AS AGREED modes
let asAgreedPrepaidMode = false;
let asAgreedCollectionMode = false;
let asAgreedConversionMode = false;

// Payment selection state
let showPrepaidInPreview = true;
let showCollectionInPreview = false;
let currentPaymentType = 'prepaid'; // 'prepaid' or 'collection'

// Global variables
let rateLines = 0;
let dimensionLines = 0;

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing AWB Software...');
    
    // Initialize core functionality
    initializeTabs();
    initializeRateLines();
    initializeDimensionLines();
    setDefaultValues();
    
    // Set default currencies
    if (document.getElementById('destination-currency')) {
        document.getElementById('destination-currency').value = 'LKR';
        destinationCurrency = 'LKR';
        destinationCurrencySymbol = 'Rs';
    }
    
    // Update currency symbols
    updateAllCurrencySymbols();
    
    // Fix currency symbol visibility
    setTimeout(fixCurrencySymbolVisibility, 100);
    
    // Setup event listeners for auto-update
    setupEventListeners();
    
    // Initial preview update
    setTimeout(updatePreview, 500);
    
    // Show welcome notifications
    showNotification('Welcome to AWB Printing Software!', 'success');
});

// Tab management
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and buttons
            tabContents.forEach(tab => tab.classList.remove('active'));
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to current tab and button
            const activeTab = document.getElementById(tabId);
            if (activeTab) {
                activeTab.classList.add('active');
                this.classList.add('active');
            }
        });
    });
    
    // Activate first tab by default
    if (tabButtons.length > 0) {
        tabButtons[0].click();
    }
}

// Payment Type Selection
function selectPaymentType(type) {
    currentPaymentType = type;
    
    // Update active state
    document.querySelectorAll('.payment-type-option').forEach(option => {
        option.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show/hide sections
    document.getElementById('prepaid-section').classList.remove('active');
    document.getElementById('collection-section').classList.remove('active');
    
    if (type === 'prepaid') {
        document.getElementById('prepaid-section').classList.add('active');
        showPrepaidInPreview = true;
        showCollectionInPreview = false;
    } else if (type === 'collection') {
        document.getElementById('collection-section').classList.add('active');
        showPrepaidInPreview = false;
        showCollectionInPreview = true;
    }
    
    updatePreview();
}

// Toggle AS AGREED for Prepaid
function toggleAsAgreedPrepaid() {
    asAgreedPrepaidMode = !asAgreedPrepaidMode;
    const button = document.getElementById('as-agreed-prepaid-btn');
    
    if (asAgreedPrepaidMode) {
        button.classList.add('active');
        button.innerHTML = '✓ AS AGREED';
        // Clear prepaid charge values
        clearPrepaidChargeValues();
    } else {
        button.classList.remove('active');
        button.innerHTML = 'AS AGREED';
        // Restore default prepaid values
        restoreDefaultPrepaidValues();
    }
    
    updatePreview();
}

// Toggle AS AGREED for Collection
function toggleAsAgreedCollection() {
    asAgreedCollectionMode = !asAgreedCollectionMode;
    const button = document.getElementById('as-agreed-collection-btn');
    
    if (asAgreedCollectionMode) {
        button.classList.add('active');
        button.innerHTML = '✓ AS AGREED';
        // Clear collection charge values
        clearCollectionChargeValues();
    } else {
        button.classList.remove('active');
        button.innerHTML = 'AS AGREED';
        // Restore default collection values
        restoreDefaultCollectionValues();
    }
    
    updatePreview();
}

// Toggle AS AGREED for Conversion
function toggleAsAgreedConversion() {
    asAgreedConversionMode = !asAgreedConversionMode;
    const button = document.getElementById('as-agreed-conversion-btn');
    
    if (asAgreedConversionMode) {
        button.classList.add('active');
        button.innerHTML = '✓ AS AGREED';
        document.getElementById('conversion-rate').value = '';
        document.getElementById('converted-amount').value = '';
    } else {
        button.classList.remove('active');
        button.innerHTML = 'AS AGREED';
        document.getElementById('conversion-rate').value = '1.00';
        updateCurrencyConversion();
    }
    
    updatePreview();
}

// Clear prepaid charge values
function clearPrepaidChargeValues() {
    document.getElementById('weight-charge-pp').value = '';
    document.getElementById('valuation-charge-pp').value = '';
    document.getElementById('tax-pp').value = '';
    document.getElementById('other-charges-agent-pp').value = '';
    document.getElementById('other-charges-carrier-pp').value = '';
    document.getElementById('total-prepaid').value = '';
}

// Clear collection charge values
function clearCollectionChargeValues() {
    document.getElementById('weight-charge-col').value = '';
    document.getElementById('valuation-charge-col').value = '';
    document.getElementById('tax-col').value = '';
    document.getElementById('other-charges-agent-col').value = '';
    document.getElementById('other-charges-carrier-col').value = '';
    document.getElementById('cc-charges-dest').value = '';
    document.getElementById('charges-at-destination').value = '';
    document.getElementById('total-collection').value = '';
    document.getElementById('total-collect-charges').value = '';
}

// Restore default prepaid values
function restoreDefaultPrepaidValues() {
    document.getElementById('weight-charge-pp').value = '0.00';
    document.getElementById('valuation-charge-pp').value = '0.00';
    document.getElementById('tax-pp').value = '0.00';
    document.getElementById('other-charges-agent-pp').value = '0.00';
    document.getElementById('other-charges-carrier-pp').value = '0.00';
    calculatePrepaidTotal();
}

// Restore default collection values
function restoreDefaultCollectionValues() {
    document.getElementById('weight-charge-col').value = '0.00';
    document.getElementById('valuation-charge-col').value = '0.00';
    document.getElementById('tax-col').value = '0.00';
    document.getElementById('other-charges-agent-col').value = '0.00';
    document.getElementById('other-charges-carrier-col').value = '0.00';
    document.getElementById('cc-charges-dest').value = '0.00';
    document.getElementById('charges-at-destination').value = '0.00';
    calculateCollectionTotal();
}

// Rate Lines Management
function initializeRateLines() {
    addRateLine(); // Add first rate line by default
}

function addRateLine() {
    const maxLines = 1;
    if (rateLines >= maxLines) {
        alert(`Maximum ${maxLines} rate lines allowed`);
        return;
    }

    const container = document.getElementById('rate-lines-container');
    if (!container) return;

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
    
    updatePreview();
}

// Dimension Lines Management
function initializeDimensionLines() {
    addDimensionLine();
}

function addDimensionLine() {
    const maxLines = 25;
    if (dimensionLines >= maxLines) {
        alert(`Maximum ${maxLines} dimension lines allowed`);
        return;
    }
    
    const container = document.getElementById('dimension-lines-container');
    if (!container) return;

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
        const lineVolume = (length * width * height * pieces) / 1000000;
        
        line.querySelector('.line-volume').value = lineVolume.toFixed(3);
        totalVolume += lineVolume;
    });
    
    document.getElementById('total-volume-display').textContent = totalVolume.toFixed(3) + ' CBM';
    updatePreview();
}

// Setup event listeners for auto-update
function setupEventListeners() {
    const previewInputs = document.querySelectorAll('input, textarea, select');
    previewInputs.forEach(input => {
        input.addEventListener('input', function() {
            setTimeout(updatePreview, 100);
        });
    });
}

function setDefaultValues() {
    const today = new Date().toISOString().split('T')[0];
    const flightDate = document.getElementById('flight-date');
    if (flightDate) flightDate.value = today;
    
    const valueCarriage = document.getElementById('value-carriage');
    if (valueCarriage) valueCarriage.value = 'NVD';
    
    const valueCustoms = document.getElementById('value-customs');
    if (valueCustoms) valueCustoms.value = 'NCV';
}

// Currency Functions
function updateCurrency() {
    const currencySelect = document.getElementById('currency-code');
    const destCurrencySelect = document.getElementById('destination-currency');
    
    if (currencySelect && destCurrencySelect) {
        currentCurrency = currencySelect.value;
        currentCurrencySymbol = currencySymbols[currentCurrency] || '$';
        destinationCurrency = destCurrencySelect.value;
        destinationCurrencySymbol = currencySymbols[destinationCurrency] || 'Rs';
        
        updateAllCurrencySymbols();
        updatePreview();
        showNotification(`Currency changed to ${currentCurrency}`, 'success');
    }
}

function updateAllCurrencySymbols() {
    document.querySelectorAll('.currency-symbol').forEach(symbol => {
        const fieldId = symbol.id;
        if (fieldId.includes('cc-charges') || fieldId.includes('charges-at-destination') || fieldId.includes('converted-amount')) {
            symbol.textContent = destinationCurrencySymbol;
        } else {
            symbol.textContent = currentCurrencySymbol;
        }
    });
}

function fixCurrencySymbolVisibility() {
    document.querySelectorAll('.currency-input-group input').forEach(input => {
        input.style.paddingLeft = '45px';
    });
}

// Charge Calculation Functions
function calculatePrepaidTotal() {
    const weightCharge = parseFloat(document.getElementById('weight-charge-pp').value) || 0;
    const valuationCharge = parseFloat(document.getElementById('valuation-charge-pp').value) || 0;
    const tax = parseFloat(document.getElementById('tax-pp').value) || 0;
    const otherChargesAgent = parseFloat(document.getElementById('other-charges-agent-pp').value) || 0;
    const otherChargesCarrier = parseFloat(document.getElementById('other-charges-carrier-pp').value) || 0;
    
    const total = weightCharge + valuationCharge + tax + otherChargesAgent + otherChargesCarrier;
    
    const totalPrepaid = document.getElementById('total-prepaid');
    if (totalPrepaid) totalPrepaid.value = total.toFixed(2);
    
    updateCurrencyConversion();
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
    
    const totalCollectionField = document.getElementById('total-collection');
    const totalCollectChargesField = document.getElementById('total-collect-charges');
    
    if (totalCollectionField) totalCollectionField.value = totalCollection.toFixed(2);
    if (totalCollectChargesField) totalCollectChargesField.value = totalCollectCharges.toFixed(2);
    
    updateCurrencyConversion();
    updatePreview();
}

function updateCurrencyConversion() {
    const conversionRate = parseFloat(document.getElementById('conversion-rate').value) || 1;
    let totalAmount = 0;
    
    if (currentPaymentType === 'prepaid') {
        totalAmount = parseFloat(document.getElementById('total-prepaid').value) || 0;
    } else {
        totalAmount = parseFloat(document.getElementById('total-collect-charges').value) || 0;
    }
    
    const convertedAmount = totalAmount * conversionRate;
    const convertedAmountField = document.getElementById('converted-amount');
    if (convertedAmountField) convertedAmountField.value = convertedAmount.toFixed(2);
    
    updatePreview();
}

// MAIN PREVIEW FUNCTION - UPDATED
function updatePreview() {
    const preview = document.getElementById('awb-preview');
    if (!preview) {
        console.error('Preview element not found!');
        return;
    }
    
    // Get basic values with fallbacks
    const awbNumber = getValue('awb-number-1a') || '618';
    const awbSuffix = getValue('awb-number-1b') || '12345675';
    
    preview.innerHTML = `
        <!-- AWB Number Fields -->
        <div class="awb-field field-1a">${awbNumber}</div>
        <div class="awb-field field-1b">${awbSuffix}</div>
        <div class="awb-field field-1">${getValue('origin-iata') || 'ORG'}</div>

        <!-- DUPLICATE FIELDS -->
        <div class="awb-field field-1a-copy">${awbNumber}</div>
        <div class="awb-field field-hyphen">-</div>
        <div class="awb-field field-1b-copy">${awbSuffix}</div>

        <div class="awb-field field-1a-copy-1">${awbNumber}</div>
        <div class="awb-field field-hyphen-1">-</div>
        <div class="awb-field field-1b-copy-1">${awbSuffix}</div>

        <!-- Shipper -->
        <div class="awb-field field-3">${formatShipper()}</div>
        <div class="awb-field field-3a">${getValue('shipper-account') || ''}</div>

        <!-- Consignee -->
        <div class="awb-field field-5">${formatConsignee()}</div>
        <div class="awb-field field-5a">${getValue('consignee-account') || ''}</div>
        
        <!-- Agent Details -->
        <div class="awb-field field-6">${getValue('agent-name') || ''}</div>
        <div class="awb-field field-7">${getValue('agent-iata') || ''}</div>
        <div class="awb-field field-8">${getValue('agent-account') || ''}</div>
        <div class="awb-field field-10">${getValue('accounting-info') || ''}</div>
        
        <!-- Routing -->
        <div class="awb-field field-11a">${getValue('routing-to1') || ''}</div>
        <div class="awb-field field-11b">${getValue('routing-by1') || ''}</div>  
        <div class="awb-field field-11c">${getValue('routing-to2') || ''}</div>
        <div class="awb-field field-11d">${getValue('routing-by2') || ''}</div>
        <div class="awb-field field-11e">${getValue('routing-to3') || ''}</div>
        <div class="awb-field field-11f">${getValue('routing-by3') || ''}</div>

        <!-- Flight Details -->
        <div class="awb-field field-19a">${formatFlightDate()}</div>
        <div class="awb-field field-19b">${getValue('flight-number') || ''}</div>
        
        <!-- Goods Section 22 - Totals -->
        <div class="awb-field field-22j">${document.getElementById('total-pieces-display')?.textContent || '0'}</div>
        <div class="awb-field field-22k">${document.getElementById('total-weight-display')?.textContent || '0.0'}</div>
        <div class="awb-field field-22l">${document.getElementById('total-charge-display')?.textContent || '0.00'}</div>

        <!-- RATE DESCRIPTION LINES -->
        ${generateRateLinesPreview()}

        <!-- DIMENSION LINES -->
        ${generateDimensionLinesPreview()}

        <!-- TOTAL DIMENSION VOLUME -->
        <div class="awb-field dimension-total-display">${getTotalDimensionVolume()}</div>

        <!-- Goods Description -->
        <div class="awb-field field-22i">${getValue('goods-description') || ''}</div>
        
        <!-- Currency and Payment Type -->
        <div class="awb-field field-currency">${currentCurrency}</div>
        <div class="awb-field field-payment-type">${getPaymentTypeDisplay()}</div>

        <!-- Declared Values -->
        <div class="awb-field field-13a">${getValue('value-carriage') || 'NVD'}</div>
        <div class="awb-field field-13b">${getValue('value-customs') || 'NCV'}</div>

        <!-- Prepaid Charges Section -->
        ${showPrepaidInPreview ? generatePrepaidChargesPreview() : ''}
        
        <!-- Collection Charges Section -->
        ${showCollectionInPreview ? generateCollectionChargesPreview() : ''}
        
        <!-- Currency Conversion -->
        <div class="awb-field field-conversion-rate ${asAgreedConversionMode ? 'as-agreed' : ''}">
            ${asAgreedConversionMode ? 'AS AGREED' : currentCurrencySymbol + ' ' + (getValue('conversion-rate') || '1.00')}
        </div>
        <div class="awb-field field-converted-amount ${asAgreedConversionMode ? 'as-agreed' : ''}">
            ${asAgreedConversionMode ? 'AS AGREED' : destinationCurrencySymbol + ' ' + (getValue('converted-amount') || '0.00')}
        </div>
        
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
    if (!date) return '';
    
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    
    return `${day}${month}${year}`;
}

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
        if (index < 1) {
            const pieces = line.querySelector('.pieces').value || '0';
            const weight = line.querySelector('.weight').value || '0.0';
            const unit = line.querySelector('.unit').value || 'K';
            const rateClass = line.querySelector('.rate-class').value || '';
            const commodity = line.querySelector('.commodity').value || '';
            const chargeWeight = line.querySelector('.charge-weight').value || '0.0';
            const rateCharge = line.querySelector('.rate-charge').value || '0.00';
            const total = line.querySelector('.line-total').value || '0.00';
            
            html += `
                <div class="awb-field rate-pieces-${index + 1}">${pieces}</div>
                <div class="awb-field rate-weight-${index + 1}">${weight}</div>
                <div class="awb-field rate-unit-${index + 1}">${unit}</div>
                <div class="awb-field rate-class-${index + 1}">${rateClass}</div>
                <div class="awb-field rate-commodity-${index + 1}">${commodity}</div>
                <div class="awb-field rate-charge-weight-${index + 1}">${chargeWeight}</div>
                <div class="awb-field rate-charge-${index + 1}">${rateCharge}</div>
                <div class="awb-field rate-total-${index + 1}">${total}</div>
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

// UPDATED: Generate prepaid charges preview with separate AS AGREED mode
function generatePrepaidChargesPreview() {
    if (asAgreedPrepaidMode) {
        return `
            <div class="awb-field field-weight-charge-pp as-agreed">AS AGREED</div>
            <div class="awb-field field-valuation-charge-pp as-agreed">AS AGREED</div>
            <div class="awb-field field-tax-pp as-agreed">AS AGREED</div>
            <div class="awb-field field-other-agent-pp as-agreed">AS AGREED</div>
            <div class="awb-field field-other-carrier-pp as-agreed">AS AGREED</div>
            <div class="awb-field field-total-prepaid as-agreed">AS AGREED</div>
        `;
    } else {
        return `
            <div class="awb-field field-weight-charge-pp">${currentCurrencySymbol} ${getValue('weight-charge-pp') || '0.00'}</div>
            <div class="awb-field field-valuation-charge-pp">${currentCurrencySymbol} ${getValue('valuation-charge-pp') || '0.00'}</div>
            <div class="awb-field field-tax-pp">${currentCurrencySymbol} ${getValue('tax-pp') || '0.00'}</div>
            <div class="awb-field field-other-agent-pp">${currentCurrencySymbol} ${getValue('other-charges-agent-pp') || '0.00'}</div>
            <div class="awb-field field-other-carrier-pp">${currentCurrencySymbol} ${getValue('other-charges-carrier-pp') || '0.00'}</div>
            <div class="awb-field field-total-prepaid">${currentCurrencySymbol} ${getValue('total-prepaid') || '0.00'}</div>
        `;
    }
}

// UPDATED: Generate collection charges preview with separate AS AGREED mode
function generateCollectionChargesPreview() {
    if (asAgreedCollectionMode) {
        return `
            <div class="awb-field field-weight-charge-col as-agreed">AS AGREED</div>
            <div class="awb-field field-valuation-charge-col as-agreed">AS AGREED</div>
            <div class="awb-field field-tax-col as-agreed">AS AGREED</div>
            <div class="awb-field field-other-agent-col as-agreed">AS AGREED</div>
            <div class="awb-field field-other-carrier-col as-agreed">AS AGREED</div>
            <div class="awb-field field-cc-charges as-agreed">AS AGREED</div>
            <div class="awb-field field-dest-charges as-agreed">AS AGREED</div>
            <div class="awb-field field-total-collection as-agreed">AS AGREED</div>
            <div class="awb-field field-total-collect-charges as-agreed">AS AGREED</div>
        `;
    } else {
        return `
            <div class="awb-field field-weight-charge-col">${currentCurrencySymbol} ${getValue('weight-charge-col') || '0.00'}</div>
            <div class="awb-field field-valuation-charge-col">${currentCurrencySymbol} ${getValue('valuation-charge-col') || '0.00'}</div>
            <div class="awb-field field-tax-col">${currentCurrencySymbol} ${getValue('tax-col') || '0.00'}</div>
            <div class="awb-field field-other-agent-col">${currentCurrencySymbol} ${getValue('other-charges-agent-col') || '0.00'}</div>
            <div class="awb-field field-other-carrier-col">${currentCurrencySymbol} ${getValue('other-charges-carrier-col') || '0.00'}</div>
            <div class="awb-field field-dest-charges">${destinationCurrencySymbol} ${getValue('charges-at-destination') || '0.00'}</div>
            <div class="awb-field field-total-collection">${currentCurrencySymbol} ${getValue('total-collection') || '0.00'}</div>
            <div class="awb-field field-total-collect-charges">${currentCurrencySymbol} ${getValue('total-collect-charges') || '0.00'}</div>
        `;
    }
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
    
    // Reset AS AGREED modes for charges tab
    if (activeTab.id === 'charges-tab') {
        asAgreedPrepaidMode = false;
        asAgreedCollectionMode = false;
        asAgreedConversionMode = false;
        
        const prepaidBtn = document.getElementById('as-agreed-prepaid-btn');
        const collectionBtn = document.getElementById('as-agreed-collection-btn');
        const conversionBtn = document.getElementById('as-agreed-conversion-btn');
        
        if (prepaidBtn) {
            prepaidBtn.classList.remove('active');
            prepaidBtn.innerHTML = 'AS AGREED';
        }
        if (collectionBtn) {
            collectionBtn.classList.remove('active');
            collectionBtn.innerHTML = 'AS AGREED';
        }
        if (conversionBtn) {
            conversionBtn.classList.remove('active');
            conversionBtn.innerHTML = 'AS AGREED';
        }
        
        restoreDefaultPrepaidValues();
        restoreDefaultCollectionValues();
        document.getElementById('conversion-rate').value = '1.00';
        updateCurrencyConversion();
    }
    
    updatePreview();
}

function clearAllTabs() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (input.type !== 'button' && !input.classList.contains('total-field')) {
            input.value = '';
        }
    });
    
    // Reset all AS AGREED modes
    asAgreedPrepaidMode = false;
    asAgreedCollectionMode = false;
    asAgreedConversionMode = false;
    
    const prepaidBtn = document.getElementById('as-agreed-prepaid-btn');
    const collectionBtn = document.getElementById('as-agreed-collection-btn');
    const conversionBtn = document.getElementById('as-agreed-conversion-btn');
    
    if (prepaidBtn) {
        prepaidBtn.classList.remove('active');
        prepaidBtn.innerHTML = 'AS AGREED';
    }
    if (collectionBtn) {
        collectionBtn.classList.remove('active');
        collectionBtn.innerHTML = 'AS AGREED';
    }
    if (conversionBtn) {
        conversionBtn.classList.remove('active');
        conversionBtn.innerHTML = 'AS AGREED';
    }
    
    setDefaultValues();
    updatePreview();
}

// Notification system
function showNotification(message, type = 'success') {
    const container = document.getElementById('notifications-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-btn" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    container.appendChild(notification);
    
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

// Placeholder functions for buttons
function generateFWB() {
    showNotification('FWB generation feature coming soon!', 'warning');
}

function printAWB() {
    window.print();
}

function copyFWB() {
    showNotification('Copy FWB feature coming soon!', 'warning');
}