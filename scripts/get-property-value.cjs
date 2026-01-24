#!/usr/bin/env node

/**
 * Standalone Script to Fetch Property Value from Zillow
 *
 * This script can be run once per month to get an updated property valuation.
 *
 * Usage:
 *   node scripts/get-property-value.js
 *
 * Or add to package.json:
 *   "scripts": {
 *     "update-value": "node scripts/get-property-value.js"
 *   }
 *
 * Then run: npm run update-value
 */

const fs = require('fs');
const path = require('path');

// Configuration - Update this with your property address
const PROPERTY_ADDRESS = '14102 129th Ave NE';

// Storage file for the estimate
const STORAGE_FILE = path.join(__dirname, '..', 'property-value-data.json');

/**
 * Instructions for manual update
 */
function printInstructions() {
  console.log('\n📊 Property Value Update Tool\n');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('Follow these steps to update your property value:\n');
  console.log('1. Open your browser and go to:');
  console.log('   https://www.zillow.com/how-much-is-my-home-worth/\n');
  console.log('2. Enter your property address:');
  console.log(`   ${PROPERTY_ADDRESS}\n`);
  console.log('3. Copy the Zestimate value shown (e.g., $1,089,100)\n');
  console.log('4. Run this script with the value:');
  console.log('   node scripts/get-property-value.js 1089100\n');
  console.log('   (Note: Enter the number without $ or commas)\n');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

/**
 * Save the property value estimate
 */
function saveEstimate(value, address = PROPERTY_ADDRESS) {
  const estimate = {
    address,
    zestimate: parseFloat(value),
    lastUpdated: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(estimate, null, 2));

    console.log('\n✅ Property value saved successfully!\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Address:       ${estimate.address}`);
    console.log(`Zestimate:     $${estimate.zestimate.toLocaleString()}`);
    console.log(`Last Updated:  ${new Date(estimate.lastUpdated).toLocaleDateString()}`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('💡 This value can now be imported into your Property Manager app.');
    console.log('   Update the "Current Market Value" in Settings > Property Details\n');

    return estimate;
  } catch (error) {
    console.error('❌ Error saving estimate:', error.message);
    process.exit(1);
  }
}

/**
 * Load the saved estimate
 */
function loadEstimate() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('❌ Error loading saved estimate:', error.message);
  }
  return null;
}

/**
 * Show the current saved estimate
 */
function showCurrentEstimate() {
  const estimate = loadEstimate();

  if (estimate) {
    const lastUpdated = new Date(estimate.lastUpdated);
    const daysAgo = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));

    console.log('\n📌 Current Saved Property Value\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Address:       ${estimate.address}`);
    console.log(`Zestimate:     $${estimate.zestimate.toLocaleString()}`);
    console.log(`Last Updated:  ${lastUpdated.toLocaleDateString()} (${daysAgo} days ago)`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (daysAgo > 30) {
      console.log('⚠️  This estimate is more than 30 days old. Consider updating it.\n');
    }
  } else {
    console.log('\n📌 No saved property value found.\n');
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  // No arguments - show instructions and current value
  showCurrentEstimate();
  printInstructions();
} else if (args[0] === '--show' || args[0] === '-s') {
  // Show current saved value
  showCurrentEstimate();
} else {
  // Save new value
  const value = args[0];

  if (isNaN(value) || parseFloat(value) <= 0) {
    console.error('\n❌ Error: Please provide a valid number');
    console.log('\nExample: node scripts/get-property-value.js 1089100\n');
    process.exit(1);
  }

  saveEstimate(value);
}
