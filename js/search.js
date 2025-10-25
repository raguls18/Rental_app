import { getAllProperties, searchProperties } from './firebase-properties.js';
// Assuming these are needed for dynamic header/login status
import { initializeAuth, getCurrentUser, logout } from './firebase-auth.js'; 

// --- DOM Element References ---
const propertiesGrid = document.getElementById('properties-grid');
const loadingIndicator = document.getElementById('loading-indicator');
const noResultsDiv = document.getElementById('no-results');

const locationInput = document.getElementById('location-search');
const typeFilter = document.getElementById('type-filter');
const bedroomsFilter = document.getElementById('bedrooms-filter');
const rentFilter = document.getElementById('rent-filter');

const applyFiltersBtn = document.getElementById('apply-filters-btn'); 
const clearFiltersBtn = document.getElementById('clear-filters-btn'); 

// --- Utility Functions ---

/**
 * Global array to store favorite property IDs loaded from localStorage.
 * This is the same array used by the inline script in seeker.html.
 */
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');


/**
 * Shows/hides the loading indicator and properties grid.
 * @param {boolean} isLoading 
 */
function showLoading(isLoading) {
    if (loadingIndicator) {
        loadingIndicator.style.display = isLoading ? 'block' : 'none';
    }
    if (propertiesGrid) {
        // Only hide grid if loading, otherwise let renderProperties handle display
        if (isLoading) {
            propertiesGrid.style.display = 'none';
            propertiesGrid.innerHTML = '';
        } else {
             propertiesGrid.style.display = 'grid';
        }
    }
    if (noResultsDiv) {
        noResultsDiv.style.display = 'none';
    }
}

/**
 * Gathers current filter values from the form.
 * @returns {object} Filter object containing location, propertyType, bedrooms, and rentRange.
 */
function getFilters() {
    const filters = {
        location: locationInput.value.trim(),
        propertyType: typeFilter.value,
        bedrooms: bedroomsFilter.value,
        rentRange: rentFilter.value,
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
        if (!filters[key]) {
            delete filters[key];
        }
    });

    return filters;
}

/**
 * Renders a single property card HTML string.
 * @param {object} prop - The property object.
 * @returns {string} The HTML string for the property card.
 */
function renderPropertyCard(prop) {
    const isFavorite = favorites.includes(prop.id);
    const heartIcon = isFavorite ? 'fas fa-heart' : 'far fa-heart';
    const activeClass = isFavorite ? ' active' : '';
    
    // NOTE: We use data-property-id on the main card for the inline script to work
    return `
        <div class="property-card" data-property-id="${prop.id}" onclick="handleViewDetails('${prop.id}')">
            <div class="property-image" style="background-image: url('${prop.images?.[0] || 'https://via.placeholder.com/400x300.png?text=No+Image'}')">
                <span class="property-price">₹${(prop.rent || 0).toLocaleString()}/month</span>
                <button class="favorite-btn${activeClass}" title="Add to Favorites" onclick="toggleFavorite('${prop.id}', this); event.stopPropagation();">
                    <i class="${heartIcon}"></i>
                </button>
            </div>
            <div class="property-details">
                <h3 class="property-title">${prop.title || 'No Title'}</h3>
                <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${prop.address || 'No Address'}, ${prop.city || ''}</p>
                <div class="property-features">
                    <div class="feature"><i class="fas fa-bed"></i> ${prop.bedrooms || 'N/A'} BHK</div>
                    <div class="feature"><i class="fas fa-bath"></i> ${prop.bathrooms || 'N/A'} Baths</div>
                    <div class="feature"><i class="fas fa-ruler-combined"></i> ${prop.area || 'N/A'} sqft</div>
                </div>
                <a href="property-details.html?id=${prop.id}" class="view-details-btn">View Details</a>
            </div>
        </div>
    `;
}

/**
 * Renders a list of property objects into the properties grid.
 * @param {Array} properties - The array of properties to display.
 */
function renderProperties(properties) {
    showLoading(false);

    if (!propertiesGrid) return;

    if (properties.length === 0) {
        if (noResultsDiv) {
            noResultsDiv.style.display = 'block';
        }
        propertiesGrid.innerHTML = '';
        return;
    }

    // Use the new renderPropertyCard function
    propertiesGrid.innerHTML = properties.map(renderPropertyCard).join('');
    
    // **NOTE:** Since the inline script adds a DOMContentLoaded listener,
    // and this function runs *after* DOM content is loaded, we explicitly call
    // the initialization function from the inline script to attach listeners.
    // Assuming you move initializeFavorites out of the immediate execution block
    // in seeker.html or rename the local one:
    // **(Assuming your inline script defines `window.initializeFavorites`):**
    if (window.initializeFavorites) {
        window.initializeFavorites();
    }
}


// --- Main Logic Functions (No changes needed below, just context) ---

/**
 * Gathers filter values and calls the search function from firebase-properties.js
 */
async function performSearch() {
    showLoading(true);
    
    const filters = getFilters();
    
    try {
        const result = await searchProperties(filters);

        if (result.success) {
            renderProperties(result.properties);
        } else {
            console.error("Search failed:", result.error);
            showLoading(false);
            propertiesGrid.innerHTML = '<p class="error-message">Sorry, an error occurred while searching for properties.</p>';
        }
    } catch(error) {
        console.error("Error during search:", error);
        showLoading(false);
        propertiesGrid.innerHTML = '<p class="error-message">A network error occurred. Please check your connection.</p>';
    }
}

/**
 * Clears all filter inputs and reloads properties.
 */
function clearFilters() {
    locationInput.value = '';
    typeFilter.value = '';
    bedroomsFilter.value = '';
    rentFilter.value = '';
    performSearch();
}

/**
 * Pre-fills filters from localStorage (for redirection from index.html)
 */
function preFillFilters() {
    const searchParams = JSON.parse(localStorage.getItem('searchParams') || '{}');
    localStorage.removeItem('searchParams'); 

    if (searchParams.location) locationInput.value = searchParams.location;
    if (searchParams.propertyType) typeFilter.value = searchParams.propertyType;
    if (searchParams.rentRange) rentFilter.value = searchParams.rentRange;
}

/**
 * Loads properties when the page is first opened, using pre-filled filters if available.
 */
async function initialLoad() {
    // 1. Check for logged-in user (optional, but good for a dashboard)
    await initializeAuth();
    const currentUser = getCurrentUser();
    if (!currentUser) {
        // If not logged in, redirect them back to the login page
        window.location.href = 'login.html'; 
        return;
    }
    
    // 2. Pre-fill filters from index.html search bar
    preFillFilters();

    // 3. Load/Search properties (either initial load or with pre-filled filters)
    if (Object.keys(getFilters()).length > 0) {
        // If filters were pre-filled, perform search
        await performSearch();
    } else {
        // Otherwise, load all properties initially
        showLoading(true);
        const result = await getAllProperties();
        if (result.success) {
            renderProperties(result.properties);
        } else {
            console.error("Failed to load properties:", result.error);
            showLoading(false);
            propertiesGrid.innerHTML = '<p class="no-results">Could not load properties at this time. Please try again later.</p>';
        }
    }
}

// --- Event Listeners Setup ---

function setupListeners() {
    // New: Use dedicated buttons instead of changing on every input/select change
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', performSearch);
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    // Allow 'Enter' key in the location search to trigger search
    locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Global function to handle clicks on the View Details button in the card
    window.handleViewDetails = function(propertyId) {
        // Navigate to a dedicated details page
        window.location.href = `property-details.html?id=${propertyId}`;
    };
}


// --- Execute on Load ---
document.addEventListener('DOMContentLoaded', () => {
    initialLoad();
    setupListeners();
});
