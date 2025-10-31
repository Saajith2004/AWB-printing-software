// Global variables
let rateLines = 1;
let dimensionLines = 1;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeRateLines();
    initializeDimensionLines();
    setupEventListeners();
    setDefaultValues();
    updatePreview();
});

// Tab management
function openTab(event, tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show the specific tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to the clicked button
    event.currentTarget.classList.add('active');
}

// Rate Lines Management
function initializeRateLines() {
    addRateLine(); // Add first rate line by default
}

function addRateLine() {
    const container = document.getElementById('rate-lines-container');
    const lineNumber = rateLines;
    
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
    rateLines++;
    document.getElementById('rate-line-count').textContent = rateLines;
    
    // Add event listeners to new inputs
    const inputs = rateLine.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', calculateRateLine);
        input.addEventListener('change', calculateRateLine);
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
}

// Dimension Lines Management
function initializeDimensionLines() {
    addDimensionLine(); // Add first dimension line by default
}

function addDimensionLine() {
    const container = document.getElementById('dimension-lines-container');
    const lineNumber = dimensionLines;
    
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
    dimensionLines++;
    document.getElementById('dimension-line-count').textContent = dimensionLines;
    
    // Add event listeners to new inputs
    const inputs = dimensionLine.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', calculateDimensionLine);
        input.addEventListener('change', calculateDimensionLine);
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
}

// Setup event listeners
function setupEventListeners() {
    // Auto-calculate charge totals
    document.getElementById('weight-charge-pp').addEventListener('input', calculateCharges);
    document.getElementById('tax-pp').addEventListener('input', calculateCharges);
    
    // Auto-update preview on input changes
    const previewInputs = document.querySelectorAll('input, textarea, select');
    previewInputs.forEach(input => {
        input.addEventListener('input', updatePreview);
        input.addEventListener('change', updatePreview);
    });
}

function calculateCharges() {
    const weightPP = parseFloat(document.getElementById('weight-charge-pp').value) || 0;
    const taxPP = parseFloat(document.getElementById('tax-pp').value) || 0;
    const totalPrepaid = weightPP + taxPP;
    
    document.getElementById('total-prepaid').value = totalPrepaid.toFixed(2);
}

function setDefaultValues() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('flight-date').value = today;
    document.getElementById('value-carriage').value = 'NVD';
    document.getElementById('value-customs').value = 'NCV';
}

// Preview Management
function updatePreview() {
    const preview = document.getElementById('awb-preview');
    
    preview.innerHTML = `
        <!-- AWB Header -->
        <div class="awb-field field-1ab">${getValue('awb-number') || 'AWB NUMBER'}</div>
        <div class="awb-field field-1">${getValue('origin-iata') || 'ORG'}</div>
        
        <!-- Shipper -->
        <div class="awb-field field-3">${formatShipper()}</div>
        
        <!-- Consignee -->
        <div class="awb-field field-5">${formatConsignee()}</div>
        
        <!-- Agent Details -->
        <div class="awb-field field-6">${getValue('agent-iata') || 'IATA'}</div>
        <div class="awb-field field-7">${getValue('agent-account') || 'ACC'}</div>
        <div class="awb-field field-8">${getValue('agent-name') || 'AGENT'}</div>
        <div class="awb-field field-9">${getValue('shipper-account') || 'SHIP ACC'}</div>
        <div class="awb-field field-10">${getValue('accounting-info') || 'ACCOUNTING'}</div>
        
        <!-- Routing -->
        <div class="awb-field field-11a">${getValue('dest-iata') || 'DEST'}</div>
        <div class="awb-field field-11b">${formatRouting()}</div>
        <div class="awb-field field-19a">${getValue('carrier-code') || 'CR'}</div>
        <div class="awb-field field-19b">${getValue('flight-number') || 'FLIGHT'}</div>
        
        <!-- Goods totals will be added here -->
        <div style="position: absolute; top: 130mm; left: 20mm; font-size: 10px;">
            Pieces: ${document.getElementById('total-pieces-display').textContent} | 
            Weight: ${document.getElementById('total-weight-display').textContent} | 
            Charge: ${document.getElementById('total-charge-display').textContent}
        </div>
        
        <!-- Dimensions -->
        <div style="position: absolute; top: 140mm; left: 20mm; font-size: 10px;">
            Volume: ${document.getElementById('total-volume-display').textContent}
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
    
    return `${name}\n${address}\n${city}, ${country}`;
}

function formatConsignee() {
    const name = getValue('consignee-name');
    const address = getValue('consignee-address');
    const city = getValue('consignee-city');
    const country = getValue('consignee-country');
    
    if (!name) return 'Consignee information...';
    
    return `${name}\n${address}\n${city}, ${country}`;
}

function formatRouting() {
    const to1 = getValue('routing-to1');
    const by1 = getValue('routing-by1');
    
    if (to1 && by1) {
        return `${to1} by ${by1}`;
    }
    return 'Routing information...';
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
    fwb += `${getValue('awb-number') || '00000000000'}${getValue('origin-iata') || 'XXX'}${getValue('dest-iata') || 'XXX'}/`;
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