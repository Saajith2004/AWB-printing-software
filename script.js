// Global variables
let rateLinesCount = 1;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    createRateLines();
    setupEventListeners();
    setDefaultValues();
    updatePreview();
});

// Setup event listeners
function setupEventListeners() {
    // Auto-calculate totals when rate line inputs change
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('rate-input')) {
            calculateRateLineTotal(e.target.closest('.rate-line'));
            calculateSection22Totals();
        }
    });
}

// Set default values
function setDefaultValues() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('flight-date').value = today;
    document.getElementById('value-carriage').value = 'NVD';
    document.getElementById('value-customs').value = 'NCV';
    document.getElementById('insurance-field').value = 'XXX';
}

// Tab navigation
function openTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// Create dynamic rate lines for section 22
function createRateLines() {
    const container = document.getElementById('rate-lines-container');
    const count = parseInt(document.getElementById('rate-lines-count').value);
    container.innerHTML = '';

    // Create header
    const header = document.createElement('div');
    header.className = 'rate-line header';
    header.innerHTML = `
        <div>Line</div>
        <div>Pieces (22A)</div>
        <div>Gross Weight (22B)</div>
        <div>Kg/Lb (22C)</div>
        <div>Rate Class (22D)</div>
        <div>Commodity Item No (22E)</div>
        <div>Chargeable Weight (22F)</div>
        <div>Rate/Charge (22G)</div>
        <div>Total (22H)</div>
    `;
    container.appendChild(header);

    // Create rate lines
    for (let i = 1; i <= count; i++) {
        const rateLine = document.createElement('div');
        rateLine.className = 'rate-line';
        rateLine.innerHTML = `
            <div>${i}</div>
            <input type="number" class="rate-input pieces-22a" placeholder="Pieces" min="0" data-field="22a">
            <input type="number" class="rate-input weight-22b" placeholder="Weight" step="0.1" min="0" data-field="22b">
            <select class="rate-input weight-unit-22c" data-field="22c">
                <option value="K">K</option>
                <option value="L">L</option>
            </select>
            <select class="rate-input rate-class-22d" data-field="22d">
                <option value="C">C - Commodity</option>
                <option value="M">M - Minimum</option>
                <option value="N">N - Normal</option>
                <option value="Q">Q - Quantity</option>
                <option value="R">R - Class Reduction</option>
                <option value="S">S - Class Surcharge</option>
            </select>
            <input type="text" class="rate-input commodity-22e" placeholder="Item No" maxlength="4" data-field="22e">
            <input type="number" class="rate-input charge-weight-22f" placeholder="Chg Weight" step="0.1" min="0" data-field="22f">
            <input type="number" class="rate-input rate-charge-22g" placeholder="Rate" step="0.01" min="0" data-field="22g">
            <input type="number" class="rate-total-22h" placeholder="Total" readonly data-field="22h">
        `;
        container.appendChild(rateLine);
    }
}

// Calculate total for a single rate line
function calculateRateLineTotal(rateLine) {
    const chargeWeight = parseFloat(rateLine.querySelector('.charge-weight-22f').value) || 0;
    const rateCharge = parseFloat(rateLine.querySelector('.rate-charge-22g').value) || 0;
    const total = chargeWeight * rateCharge;
    
    rateLine.querySelector('.rate-total-22h').value = total.toFixed(2);
}

// Calculate totals for section 22 (22J, 22K, 22L)
function calculateSection22Totals() {
    let totalPieces = 0;
    let totalWeight = 0;
    let totalCharge = 0;

    document.querySelectorAll('.rate-line:not(.header)').forEach(line => {
        const pieces = parseFloat(line.querySelector('.pieces-22a').value) || 0;
        const weight = parseFloat(line.querySelector('.weight-22b').value) || 0;
        const charge = parseFloat(line.querySelector('.rate-total-22h').value) || 0;

        totalPieces += pieces;
        totalWeight += weight;
        totalCharge += charge;
    });

    document.getElementById('total-pieces-22j').value = totalPieces;
    document.getElementById('total-weight-22k').value = totalWeight.toFixed(1);
    document.getElementById('total-charge-22l').value = totalCharge.toFixed(2);
}

// Calculate volume from dimensions
function calculateVolume() {
    const length = parseFloat(document.getElementById('dim-length').value) || 0;
    const width = parseFloat(document.getElementById('dim-width').value) || 0;
    const height = parseFloat(document.getElementById('dim-height').value) || 0;
    const pieces = parseInt(document.getElementById('dim-pieces').value) || 1;

    const volume = (length * width * height * pieces) / 1000000; // Convert cm³ to m³
    document.getElementById('volume-result').value = volume.toFixed(3) + ' CBM';
}

// Update currency symbols
function updateCurrencySymbols() {
    const currencyCode = document.getElementById('currency-code').value;
    const symbols = {
        'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 
        'SGD': 'S$', 'AED': 'AED', 'INR': '₹'
    };
    const symbol = symbols[currencyCode] || '$';
    
    document.querySelectorAll('.currency-symbol').forEach(span => {
        span.textContent = symbol;
    });
}

// Calculate charge totals
function calculateTotals() {
    // Calculate Total Prepaid
    const weightPP = parseFloat(document.getElementById('weight-charge-pp').value) || 0;
    const valuationPP = parseFloat(document.getElementById('valuation-charge-pp').value) || 0;
    const taxPP = parseFloat(document.getElementById('tax-pp').value) || 0;
    const agentPP = parseFloat(document.getElementById('agent-charges-pp').value) || 0;
    const carrierPP = parseFloat(document.getElementById('carrier-charges-pp').value) || 0;
    
    const totalPrepaid = weightPP + valuationPP + taxPP + agentPP + carrierPP;
    document.getElementById('total-prepaid').value = totalPrepaid.toFixed(2);

    // Calculate Total Collect
    const weightCC = parseFloat(document.getElementById('weight-charge-cc').value) || 0;
    const valuationCC = parseFloat(document.getElementById('valuation-charge-cc').value) || 0;
    const taxCC = parseFloat(document.getElementById('tax-cc').value) || 0;
    const agentCC = parseFloat(document.getElementById('agent-charges-cc').value) || 0;
    const carrierCC = parseFloat(document.getElementById('carrier-charges-cc').value) || 0;
    
    const totalCollect = weightCC + valuationCC + taxCC + agentCC + carrierCC;
    document.getElementById('total-collect').value = totalCollect.toFixed(2);
}

// Update AWB Preview
function updatePreview() {
    const preview = document.getElementById('awb-preview');
    
    preview.innerHTML = `
        <div class="awb-outline">
            <!-- Header Section -->
            <div class="awb-section header-section">
                <div class="field-box box-1ab">${getValue('awb-number') || 'AWB NUMBER'}</div>
                <div class="field-box box-1">${getValue('origin-iata') || 'ORG'}</div>
                <div class="awb-title">AIR WAYBILL</div>
            </div>

            <!-- Shipper Section -->
            <div class="awb-section shipper-section">
                <div class="section-label">Shipper's Name and Address</div>
                <div class="field-box box-3 large-box">${formatShipper()}</div>
            </div>

            <!-- Consignee Section -->
            <div class="awb-section consignee-section">
                <div class="section-label">Consignee's Name and Address</div>
                <div class="field-box box-5 large-box">${formatConsignee()}</div>
            </div>

            <!-- Agent & Accounting Section -->
            <div class="awb-section agent-section">
                <div class="field-box box-6">${getValue('agent-iata') || 'IATA'}</div>
                <div class="field-box box-7">${getValue('agent-cass') || 'CASS'}</div>
                <div class="field-box box-8">${getValue('agent-account') || 'ACC NO'}</div>
                <div class="field-box box-9">${getValue('shipper-account') || 'SHIP ACC'}</div>
                <div class="field-box box-10 large-box">${getValue('accounting-info') || 'ACCOUNTING INFO'}</div>
            </div>

            <!-- Routing Section -->
            <div class="awb-section routing-section">
                <div class="field-box box-11a">${getValue('dest-iata') || 'DEST'}</div>
                <div class="field-box box-11b large-box">${formatRouting()}</div>
                <div class="field-box box-19a">${getValue('carrier-code') || 'CR'}</div>
                <div class="field-box box-19b">${getValue('flight-number') || 'FLIGHT'}</div>
            </div>

            <!-- Goods Section 22 -->
            <div class="awb-section goods-section">
                <div class="section-22-grid">
                    ${generateSection22Preview()}
                </div>
            </div>

            <!-- Charges Section -->
            <div class="awb-section charges-section">
                <div class="field-box box-31">${getValue('shipper-certification') || 'SHIPPER CERT'}</div>
                <div class="field-box box-32c">${getValue('carrier-execution') || 'CARRIER EXEC'}</div>
            </div>
        </div>
    `;
}

// Helper functions
function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value : '';
}

function formatShipper() {
    const name = getValue('shipper-name');
    const address = getValue('shipper-address');
    const city = getValue('shipper-city');
    const country = getValue('shipper-country');
    
    if (!name) return 'Shipper information...';
    
    return `${name}\n${address}\n${city} ${country}`;
}

function formatConsignee() {
    const name = getValue('consignee-name');
    const address = getValue('consignee-address');
    const city = getValue('consignee-city');
    const country = getValue('consignee-country');
    
    if (!name) return 'Consignee information...';
    
    return `${name}\n${address}\n${city} ${country}`;
}

function formatRouting() {
    const to1 = getValue('routing-to1');
    const by1 = getValue('routing-by1');
    const to2 = getValue('routing-to2');
    const by2 = getValue('routing-by2');
    
    let routing = '';
    if (to1 && by1) routing += `${to1} by ${by1}`;
    if (to2 && by2) routing += ` / ${to2} by ${by2}`;
    
    return routing || 'Routing information...';
}

function generateSection22Preview() {
    let html = '';
    const rateLines = document.querySelectorAll('.rate-line:not(.header)');
    
    rateLines.forEach((line, index) => {
        const pieces = line.querySelector('.pieces-22a').value || '';
        const weight = line.querySelector('.weight-22b').value || '';
        const unit = line.querySelector('.weight-unit-22c').value || 'K';
        const rateClass = line.querySelector('.rate-class-22d').value || '';
        const commodity = line.querySelector('.commodity-22e').value || '';
        const chargeWeight = line.querySelector('.charge-weight-22f').value || '';
        const rate = line.querySelector('.rate-charge-22g').value || '';
        const total = line.querySelector('.rate-total-22h').value || '';
        
        html += `
            <div class="field-box box-22a">${pieces}</div>
            <div class="field-box box-22b">${weight}</div>
            <div class="field-box box-22c">${unit}</div>
            <div class="field-box box-22d">${rateClass}</div>
            <div class="field-box box-22e">${commodity}</div>
            <div class="field-box box-22f">${chargeWeight}</div>
            <div class="field-box box-22g">${rate}</div>
            <div class="field-box box-22h">${total}</div>
        `;
    });
    
    // Add totals
    html += `
        <div class="field-box box-22j">${getValue('total-pieces-22j')}</div>
        <div class="field-box box-22k">${getValue('total-weight-22k')}</div>
        <div class="field-box box-22l">${getValue('total-charge-22l')}</div>
        <div class="field-box box-22i large-box">${getValue('goods-description') || 'Goods description...'}</div>
    `;
    
    return html;
}

// Generate FWB Message
function generateFWB() {
    const fwbMessage = buildFWBMessage();
    document.getElementById('fwb-message').value = fwbMessage;
    document.getElementById('fwb-output').style.display = 'block';
}

function buildFWBMessage() {
    let fwb = 'FWB/1\n';
    
    // AWB Consignment Details
    const awbNo = getValue('awb-number') || '00000000000';
    const origin = getValue('origin-iata') || 'XXX';
    const destination = getValue('dest-iata') || 'XXX';
    const totalPieces = getValue('total-pieces-22j') || '0';
    const totalWeight = getValue('total-weight-22k') || '0.0';
    
    fwb += `${awbNo}${origin}${destination}/T${totalPieces}K${totalWeight}\n`;
    
    // Add other FWB segments here...
    
    return fwb;
}

// Copy FWB Message
function copyFWB() {
    const fwbText = document.getElementById('fwb-message');
    fwbText.select();
    document.execCommand('copy');
    alert('FWB message copied to clipboard!');
}

// Print AWB
function printAWB() {
    updatePreview();
    setTimeout(() => {
        window.print();
    }, 500);
}

// Clear Form
function clearForm() {
    document.querySelectorAll('input, textarea, select').forEach(element => {
        if (!['button', 'submit'].includes(element.type) && element.id !== 'copy-type') {
            element.value = '';
        }
    });
    
    // Reset select elements
    document.getElementById('rate-lines-count').selectedIndex = 0;
    document.getElementById('currency-code').selectedIndex = 0;
    document.getElementById('special-handling').selectedIndex = 0;
    
    // Set default values
    setDefaultValues();
    createRateLines();
    
    document.getElementById('fwb-output').style.display = 'none';
    updatePreview();
}