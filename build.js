const fs = require('fs');
require('dotenv/config');

console.log('Building nursery visit planner...');

// Read the source HTML file (we'll create a template)
const sourceFile = 'index.template.html';
const outputFile = 'index.html';

try {
    let htmlContent = fs.readFileSync(sourceFile, 'utf8');
    
    // Replace environment variables
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
    const homeAddress = process.env.HOME_ADDRESS || 'YOUR_HOME_ADDRESS_HERE';
    
    htmlContent = htmlContent.replace(/{{GOOGLE_MAPS_API_KEY}}/g, googleMapsApiKey);
    htmlContent = htmlContent.replace(/YOUR_HOME_ADDRESS_HERE/g, homeAddress);
    
    // Write the output file
    fs.writeFileSync(outputFile, htmlContent);
    
    console.log('✅ Build completed successfully!');
    console.log(`📄 Generated: ${outputFile}`);
    console.log(`🗝️  API Key: ${googleMapsApiKey.substring(0, 10)}...`);
    console.log(`🏠 Home Address: ${homeAddress.length > 20 ? homeAddress.substring(0, 20) + '...' : homeAddress}`);
    
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
} 