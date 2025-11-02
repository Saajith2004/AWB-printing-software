// Global variables
let rateLines = 0;
let dimensionLines = 0;

// In script.js - make sure you have this:
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeRateLines();
    initializeDimensionLines();
    setupEventListeners();
    setDefaultValues();
    updatePreview();
});

// Tab management - ENHANCED VERSION
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
}

// Dimension Lines Management
function initializeDimensionLines() {
    addDimensionLine(); // Add first dimension line by default
}

function addDimensionLine() {
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

// Preview Management - FIXED DATA BINDING
function updatePreview() {
    const preview = document.getElementById('awb-preview');
    const awbNumber = getValue('awb-number') || '';
    const awbParts = awbNumber.split('-');
    
    preview.innerHTML = `
        <!-- AWB Header -->
        <div class="awb-field field-1a">${getValue('awb-number-1a') || '618'}</div>
        <div class="awb-field field-1b">${getValue('awb-number-1b') || '12345675'}</div>
        <div class="awb-field field-1">${getValue('origin-iata') || 'ORG'}</div>

        <!-- DUPLICATE FIELDS IN NEW POSITION-1 -->
        <div class="awb-field field-1a-copy">${awbParts[0] || '618'}</div>
        <div class="awb-field field-hyphen">-</div>
        <div class="awb-field field-1b-copy">${awbParts[1] || '12345675'}</div>

        <!-- DUPLICATE FIELDS IN NEW POSITION-2 -->
        <div class="awb-field field-1a-copy-1">${awbParts[0] || '618'}</div>
        <div class="awb-field field-hyphen-1">-</div>
        <div class="awb-field field-1b-copy-1">${awbParts[1] || '12345675'}</div>

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
        <div class="awb-field field-19a">${getValue('flight-date') || 'DDMMYY'}</div>
        <div class="awb-field field-19b">${getValue('flight-number') || 'FLIGHT'}</div>
        
        <!-- Goods Section 22 -->
        <div class="awb-field field-22j">${document.getElementById('total-pieces-display').textContent}</div>
        <div class="awb-field field-22k">${document.getElementById('total-weight-display').textContent}</div>
        <div class="awb-field field-22l">${document.getElementById('total-charge-display').textContent}</div>
        <div class="awb-field field-22i">${getValue('goods-description') || ''}</div>
        
        <!-- Charges -->
        <div class="awb-field field-13a">${getValue('value-carriage') || 'NVD'}</div>
        <div class="awb-field field-13b">${getValue('value-customs') || 'NCV'}</div>
        
        <!-- Special -->
        <div class="awb-field field-15">${getValue('handling-info') || ''}</div>
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

function formatRouting() {
    const to1 = getValue('routing-to1');
    const by1 = getValue('routing-by1');
    const to2 = getValue('routing-to2');
    const by2 = getValue('routing-by2');
    
    let routing = '';
    if (to1 && by1) routing += `${to1}/${by1}`;
    if (to2 && by2) routing += ` ${to2}/${by2}`;
    
    return routing || 'Requested Routing';
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