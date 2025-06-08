// Simple distance verification script
// Run this in browser console or as a standalone script

async function verifyAllDistances() {
    const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual Google Maps API key
    const HOME_ADDRESS = 'YOUR_HOME_ADDRESS_HERE'; // Replace with your actual home address
    
    // All nursery addresses from your HTML
    const nurseries = [
        // Tuesday
        { name: 'Apate-Mowgli', address: '10, rue Dieu, 75010 Paris', estimated: '7 min', from: 'home' },
        { name: 'Crèche franco-chinoise', address: '5, rue Yves Toudic, 75010 Paris', estimated: '3 min', from: 'Apate-Mowgli' },
        { name: 'Crèche Gabriel de Mun-Croix Rouge', address: '4, rue Lucien Sampaix, 75010 Paris', estimated: '5 min', from: 'franco-chinoise' },
        { name: 'La Maison Kangourou Vinaigriers', address: '34A, rue des Vinaigriers, 75010 Paris', estimated: '4 min', from: 'Gabriel de Mun' },
        
        // Wednesday
        { name: 'Les Kiklos', address: '1, avenue Claude Vellefaux, 75010 Paris', estimated: '14 min', from: 'home' },
        { name: 'La Maison Kangourou Temple', address: '129, rue du Faubourg du Temple, 75010 Paris', estimated: '8 min', from: 'Les Kiklos' },
        { name: 'Petit Concept', address: '18, rue de l\'Orillon, 75011 Paris', estimated: '6 min', from: 'Kangourou Temple' },
        { name: 'Association Mosaïque', address: '21, rue de la Folie-Méricourt, 75011 Paris', estimated: '8 min', from: 'Petit Concept' },
        
        // Thursday
        { name: 'du petit Touhars', address: '10 rue du petit Touhars, 75003 Paris', estimated: '9 min', from: 'home' },
        { name: 'Charlot', address: '5 rue Charlot, 75003 Paris', estimated: '5 min', from: 'petit Touhars' },
        { name: 'Haudriettes', address: '3 rue des Haudriettes, 75003 Paris', estimated: '3 min', from: 'Charlot' },
        { name: 'Montmorency', address: '8 rue de Montmorency, 75003 Paris', estimated: '4 min', from: 'Haudriettes' },
        
        // Friday
        { name: 'Martin', address: '220 rue Saint-Martin, 75003 Paris', estimated: '8 min', from: 'Montmorency' },
        { name: 'Les Minimes', address: '35 bis rue des Tournelles, 75003 Paris', estimated: '12 min', from: 'Martin' },
        { name: 'Crèche Ganone Yad', address: '145, rue Saint-Maur, 75011 Paris', estimated: '15 min', from: 'Les Minimes' }
    ];

    const results = [];
    
    console.log('Verifying distances with Google Maps...');
    
    for (let nursery of nurseries) {
        let origin;
        if (nursery.from === 'home') {
            origin = HOME_ADDRESS;
        } else {
            // Find the previous nursery's address
            const prevNursery = nurseries.find(n => n.name.toLowerCase().includes(nursery.from.toLowerCase()));
            origin = prevNursery ? prevNursery.address : HOME_ADDRESS;
        }
        
        try {
            const distance = await getWalkingDistance(origin, nursery.address, API_KEY);
            if (distance) {
                const actualMinutes = Math.round(distance.duration.value / 60);
                const estimatedMinutes = parseInt(nursery.estimated);
                const difference = actualMinutes - estimatedMinutes;
                
                results.push({
                    name: nursery.name,
                    estimated: nursery.estimated,
                    actual: `${actualMinutes} min`,
                    difference: difference,
                    needsUpdate: Math.abs(difference) > 1 // Update if difference > 1 minute
                });
                
                console.log(`${nursery.name}: ${nursery.estimated} → ${actualMinutes} min (${difference > 0 ? '+' : ''}${difference})`);
            }
        } catch (error) {
            console.error(`Error checking ${nursery.name}:`, error);
        }
        
        // Delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Generate HTML updates
    generateHTMLUpdates(results);
    return results;
}

async function getWalkingDistance(origin, destination, apiKey) {
    const service = new google.maps.DistanceMatrixService();
    
    return new Promise((resolve, reject) => {
        service.getDistanceMatrix({
            origins: [origin],
            destinations: [destination],
            travelMode: google.maps.TravelMode.WALKING,
            unitSystem: google.maps.UnitSystem.METRIC,
        }, (response, status) => {
            if (status === google.maps.DistanceMatrixStatus.OK) {
                const result = response.rows[0].elements[0];
                if (result.status === 'OK') {
                    resolve(result);
                } else {
                    reject(new Error(`Route not found: ${result.status}`));
                }
            } else {
                reject(new Error(`API Error: ${status}`));
            }
        });
    });
}

function generateHTMLUpdates(results) {
    console.log('\n=== HTML UPDATES NEEDED ===');
    
    const updates = results.filter(r => r.needsUpdate);
    
    if (updates.length === 0) {
        console.log('✅ All distances are accurate! No updates needed.');
        return;
    }
    
    console.log(`Found ${updates.length} distances that need updating:\n`);
    
    updates.forEach(update => {
        console.log(`${update.name}:`);
        console.log(`  Current: ${update.estimated}`);
        console.log(`  Should be: ${update.actual}`);
        console.log(`  HTML search for: "${update.estimated} à pied"`);
        console.log(`  Replace with: "${update.actual} à pied"`);
        console.log('---');
    });
    
    // Also generate summary for easy copying
    const summary = updates.map(u => `${u.name}: ${u.estimated} → ${u.actual}`).join('\n');
    console.log('\n=== SUMMARY ===');
    console.log(summary);
}

// Usage instructions
console.log(`
To verify distances:
1. Open nursery_visit_planner.html in your browser
2. Open browser console (F12)
3. Run: verifyAllDistances()
4. Check the results and update HTML as needed
`);

// Auto-run if Google Maps is available
if (typeof google !== 'undefined' && google.maps) {
    console.log('Google Maps detected! You can run verifyAllDistances() now.');
} else {
    console.log('Load Google Maps first, then run verifyAllDistances()');
} 