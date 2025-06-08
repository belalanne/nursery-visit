// Configuration for Nursery Visit Planner
// Replace these values with your actual data

const CONFIG = {
    // Get your API key from Google Cloud Console
    // Enable: Maps JavaScript API, Directions API, Distance Matrix API
    GOOGLE_MAPS_API_KEY: 'YOUR_API_KEY_HERE',
    
    // Your home address (starting point for all routes)
    HOME_ADDRESS: 'YOUR_HOME_ADDRESS_HERE',
    
    // Nursery data with addresses
    NURSERIES: [
        // Tuesday morning
        { name: 'Apate-Mowgli', address: '10, rue Dieu, 75010 Paris', phone: '01 53 19 88 50', day: 'tuesday', session: 'morning', time: '10:00-10:30' },
        { name: 'Crèche franco-chinoise', address: '5, rue Yves Toudic, 75010 Paris', phone: '01 42 00 88 88', day: 'tuesday', session: 'morning', time: '10:45-11:15' },
        
        // Tuesday afternoon
        { name: 'Crèche Gabriel de Mun-Croix Rouge', address: '4, rue Lucien Sampaix, 75010 Paris', phone: '01 46 07 34 80', day: 'tuesday', session: 'afternoon', time: '14:00-14:30' },
        { name: 'La Maison Kangourou Vinaigriers', address: '34A, rue des Vinaigriers, 75010 Paris', phone: '01 88 40 11 90', day: 'tuesday', session: 'afternoon', time: '14:45-15:15' },
        
        // Wednesday morning
        { name: 'Les Kiklos', address: '1, avenue Claude Vellefaux, 75010 Paris', phone: '09 81 95 82 31', day: 'wednesday', session: 'morning', time: '10:00-10:30' },
        { name: 'La Maison Kangourou Temple', address: '129, rue du Faubourg du Temple, 75010 Paris', phone: '01 48 03 85 98', day: 'wednesday', session: 'morning', time: '10:45-11:15' },
        
        // Wednesday afternoon
        { name: 'Petit Concept', address: '18, rue de l\'Orillon, 75011 Paris', phone: '01 43 57 12 92', day: 'wednesday', session: 'afternoon', time: '14:00-14:30' },
        { name: 'Association Mosaïque', address: '21, rue de la Folie-Méricourt, 75011 Paris', phone: '01 43 57 93 37', day: 'wednesday', session: 'afternoon', time: '14:45-15:15' },
        
        // Thursday morning
        { name: 'du petit Touhars', address: '10 rue du petit Touhars, 75003 Paris', phone: '01 44 78 65 08', day: 'thursday', session: 'morning', time: '10:00-10:30', note: 'Rappeler jeudi (c\'est parfait !)' },
        { name: 'Charlot', address: '5 rue Charlot, 75003 Paris', phone: '09 84 49 47 81', day: 'thursday', session: 'morning', time: '10:45-11:15' },
        
        // Thursday afternoon
        { name: 'Haudriettes', address: '3 rue des Haudriettes, 75003 Paris', phone: '01 80 48 96 93', day: 'thursday', session: 'afternoon', time: '14:00-14:30' },
        { name: 'Montmorency', address: '8 rue de Montmorency, 75003 Paris', phone: '01 42 71 01 47', day: 'thursday', session: 'afternoon', time: '14:45-15:15' },
        
        // Friday morning
        { name: 'Martin', address: '220 rue Saint-Martin, 75003 Paris', phone: '01 44 78 65 08', day: 'friday', session: 'morning', time: '10:00-10:30' },
        { name: 'Les Minimes', address: '35 bis rue des Tournelles, 75003 Paris', phone: 'pas de numéro', day: 'friday', session: 'morning', time: '10:45-11:15' },
        
        // Friday afternoon
        { name: 'Crèche Ganone Yad', address: '145, rue Saint-Maur, 75011 Paris', phone: '01 48 05 44 15', day: 'friday', session: 'afternoon', time: '14:00-14:30' }
    ]
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
