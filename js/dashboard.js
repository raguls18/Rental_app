import {
  requireAuth,
  getCurrentUser,
  getUserData,
  logout,
} from './firebase-auth.js';

import {
  getAllProperties,
  searchProperties,
  incrementInquiries,
} from './firebase-properties.js';

let currentUser = null;
let allProperties = [];

document.addEventListener('DOMContentLoaded', async function () {
  if (!requireAuth()) {
    return;
  }

  currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  await initializeDashboard();
  setupNavigation();
  setupSearch();

  await loadProperties();
  checkSavedSearchParams();
});

async function initializeDashboard() {
  try {
    const userData = await getUserData();

    if (!userData || userData.userType !== 'seeker') {
      alert('Access denied. House seeker account required.');
      window.location.href = 'login.html';
      return;
    }

    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
      userNameElement.textContent = userData.fullname || 'User';
    }
  } catch (error) {
    console.error('Error initializing dashboard:', error);
  }
}

function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const contentSections = document.querySelectorAll('.content-section');

  navLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      if (this.getAttribute('href') === '#' || this.onclick) {
        return;
      }
      e.preventDefault();

      navLinks.forEach((l) => l.classList.remove('active'));
      contentSections.forEach((s) => s.classList.remove('active'));

      this.classList.add('active');

      const targetSection = this.getAttribute('href').substring(1);
      const section = document.getElementById(targetSection);
      if (section) {
        section.classList.add('active');

        if (targetSection === 'favorites') {
          loadFavorites();
        }
      }
    });
  });
}

function setupSearch() {
  const searchBtn = document.getElementById('search-btn');
  const locationSearch = document.getElementById('location-search');

  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }

  if (locationSearch) {
    locationSearch.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }

  const filters = [
    'property-type-filter',
    'rent-range-filter',
    'bedrooms-filter',
  ];
  filters.forEach((filterId) => {
    const filter = document.getElementById(filterId);
    if (filter) {
      filter.addEventListener('change', performSearch);
    }
  });
}

async function loadProperties() {
  try {
    showLoading(true);
    const result = await getAllProperties();

    if (result.success) {
      allProperties = result.properties;
      displayProperties(allProperties);
    } else {
      console.error('Error loading properties:', result.error);
      showError('Error loading properties. Please try again.');
    }
  } catch (error) {
    console.error('Error loading properties:', error);
    showError('Error loading properties. Please try again.');
  } finally {
    showLoading(false);
  }
}

async function performSearch() {
  try {
    showLoading(true);

    const filters = {
      location: document.getElementById('location-search').value,
      propertyType: document.getElementById('property-type-filter').value,
      rentRange: document.getElementById('rent-range-filter').value,
      bedrooms: document.getElementById('bedrooms-filter').value,
    };

    if (filters.rentRange) {
      const [min, max] = filters.rentRange.split('-').map((v) => v.replace('+', ''));
      filters.minRent = parseInt(min) || 0;
      filters.maxRent = max === '' ? 999999999 : parseInt(max) || 999999999;
    }

    const result = await searchProperties(filters);

    if (result.success) {
      displayProperties(result.properties);
    } else {
      console.error('Search error:', result.error);
      showError('Search failed. Please try again.');
    }
  } catch (error) {
    console.error('Search error:', error);
    showError('Search failed. Please try again.');
  } finally {
    showLoading(false);
  }
}

function displayProperties(properties) {
  const searchResults = document.getElementById('search-results');

  if (!searchResults) return;

  if (properties.length === 0) {
    searchResults.innerHTML =
      '<p class="no-results">No properties found matching your criteria.</p>';
    return;
  }

  searchResults.innerHTML = properties
    .map((property) => {
      return `
      <div class="property-card">
        <div class="property-image" style="background-image: url('${property.images?.[0] || 'https://via.placeholder.com/320x200'}')">
          <div class="property-price">₹${property.rent?.toLocaleString() || 'N/A'}/month</div>
          <button class="favorite-btn" onclick="toggleFavorite('${property.id}')">
            <i class="fas fa-heart ${isFavorite(property.id) ? 'favorited' : ''}"></i>
          </button>
        </div>
        <div class="property-details">
          <h3>${property.title || 'Property'}</h3>
          <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${
            property.address || 'Location'
          }</p>
          <div class="property-features">
            <span><i class="fas fa-bed"></i> ${property.bedrooms || 0} Bed</span>
            <span><i class="fas fa-home"></i> ${property.type || 'Property'}</span>
          </div>
          <div class="property-amenities">
            ${(property.amenities || [])
              .slice(0, 3)
              .map((amenity) => `<span class="amenity-tag">${amenity}</span>`)
              .join('')}
            ${
              (property.amenities || []).length > 3
                ? `<span class="amenity-tag">+${property.amenities.length - 3} more</span>`
                : ''
            }
          </div>
          <p class="property-description">${(property.description || '').substring(
            0,
            100
          )}...</p>
          <button
            class="contact-btn"
            onclick="contactOwner('${property.id}', '${property.contact || ''}', '${
          property.ownerName || ''
        }', '${property.title || ''}')"
          >
            Contact Owner
          </button>
        </div>
      </div>
      `;
    })
    .join('');
}

function checkSavedSearchParams() {
  const savedParams = localStorage.getItem('searchParams');
  if (savedParams) {
    try {
      const params = JSON.parse(savedParams);

      if (params.location) {
        document.getElementById('location-search').value = params.location;
      }
      if (params.propertyType) {
        document.getElementById('property-type-filter').value = params.propertyType;
      }
      if (params.rentRange) {
        document.getElementById('rent-range-filter').value = params.rentRange;
      }

      performSearch();
      localStorage.removeItem('searchParams');
    } catch (error) {
      console.error('Error parsing saved search params:', error);
    }
  }
}

function showLoading(show) {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.display = show ? 'block' : 'none';
  }
}

function showError(message) {
  const searchResults = document.getElementById('search-results');
  if (searchResults) {
    searchResults.innerHTML = `<p class="error-message">${message}</p>`;
  }
}

function isFavorite(propertyId) {
  const favorites = JSON.parse(localStorage.getItem(`favorites_${currentUser.uid}`)) || [];
  return favorites.includes(propertyId);
}

async function loadFavorites() {
  const favoritesContainer = document.getElementById('favorites-list');
  if (!favoritesContainer || !currentUser) return;

  const favorites = JSON.parse(localStorage.getItem(`favorites_${currentUser.uid}`)) || [];
  const favoriteProperties = allProperties.filter((property) =>
    favorites.includes(property.id)
  );

  if (favoriteProperties.length === 0) {
    favoritesContainer.innerHTML = '<p>No favorite properties yet.</p>';
    return;
  }

  favoritesContainer.innerHTML = favoriteProperties
    .map((property) => {
      return `
        <div class="property-card">
          <div class="property-image" style="background-image: url('${property.images?.[0] || 'https://via.placeholder.com/320x200'}')">
            <div class="property-price">₹${property.rent?.toLocaleString() || 'N/A'}/month</div>
            <button class="favorite-btn" onclick="toggleFavorite('${property.id}')">
              <i class="fas fa-heart favorited"></i>
            </button>
          </div>
          <div class="property-details">
            <h3>${property.title || 'Property'}</h3>
            <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${
              property.address || 'Location'
            }</p>
            <div class="property-features">
              <span><i class="fas fa-bed"></i> ${property.bedrooms || 0} Bed</span>
              <span><i class="fas fa-home"></i> ${property.type || 'Property'}</span>
            </div>
            <button
              class="contact-btn"
              onclick="contactOwner('${property.id}', '${property.contact || ''}', '${
          property.ownerName || ''
        }', '${property.title || ''}')"
            >
              Contact Owner
            </button>
          </div>
        </div>
      `;
    })
    .join('');
}

window.toggleFavorite = function (propertyId) {
  if (!currentUser) {
    alert('Please login to save favorites');
    return;
  }

  let favorites = JSON.parse(localStorage.getItem(`favorites_${currentUser.uid}`)) || [];

  const favoriteIndex = favorites.indexOf(propertyId);
  if (favoriteIndex > -1) {
    favorites.splice(favoriteIndex, 1);
  } else {
    favorites.push(propertyId);
  }

  localStorage.setItem(`favorites_${currentUser.uid}`, JSON.stringify(favorites));

  const activeSection = document.querySelector('.content-section.active');
  if (activeSection.id === 'search') {
    performSearch();
  } else if (activeSection.id === 'favorites') {
    loadFavorites();
  }
};

window.contactOwner = async function (propertyId, contact, ownerName, propertyTitle) {
  if (!contact) {
    alert('Contact information not available for this property.');
    return;
  }

  await incrementInquiries(propertyId);

  alert(`Contact ${ownerName} for "${propertyTitle}"\nPhone: ${contact}`);
};

window.handleLogout = async function () {
  if (confirm('Are you sure you want to logout?')) {
    await logout();
  }
};
