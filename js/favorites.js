import { getPropertyByIds } from "./firebase-properties.js"
import { initializeAuth, getCurrentUser } from "./firebase-auth.js"

const favoritesGrid = document.getElementById("favorites-grid")
const loadingIndicator = document.getElementById("loading-indicator")
const emptyFavoritesDiv = document.getElementById("empty-favorites")

function renderPropertyCard(prop) {
  let imageUrl = "https://via.placeholder.com/400x300.png?text=No+Image+Found"

  if (prop.images && Array.isArray(prop.images) && prop.images.length > 0 && prop.images[0]) {
    imageUrl = prop.images[0]
  }

  const heartIcon = "fas fa-heart"
  const activeClass = " active"

  return `
        <div class="property-card" data-property-id="${prop.id}" data-price="${prop.rent || 0}" onclick="handleViewDetails('${prop.id}')">
            <div class="property-image" style="background-image: url('${imageUrl}');">
                <span class="property-price">₹${(prop.rent || 0).toLocaleString()}/month</span>
                <button class="favorite-btn${activeClass}" title="Remove from Favorites" onclick="toggleFavorite('${prop.id}', this); event.stopPropagation();">
                    <i class="${heartIcon}"></i>
                </button>
            </div>
            <div class="property-details">
                <h3 class="property-title">${prop.title || "No Title"}</h3>
                <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${prop.address || "No Address"}, ${prop.city || ""}</p>
                <div class="property-features">
                    <div class="feature"><i class="fas fa-bed"></i> ${prop.bedrooms || "N/A"} BHK</div>
                    <div class="feature"><i class="fas fa-bath"></i> ${prop.bathrooms || "N/A"} Baths</div>
                    <div class="feature"><i class="fas fa-ruler-combined"></i> ${prop.area || "N/A"} sqft</div>
                </div>
                <a href="property-details.html?id=${prop.id}" class="view-details-btn">View Details</a>
            </div>
        </div>
    `
}

async function loadFavorites() {
  loadingIndicator.style.display = "flex"
  emptyFavoritesDiv.style.display = "none"
  favoritesGrid.innerHTML = ""

  await initializeAuth()
  const currentUser = getCurrentUser()
  if (!currentUser) {
    return
  }

  const favoriteIds = JSON.parse(localStorage.getItem("favorites") || "[]")

  if (favoriteIds.length === 0) {
    loadingIndicator.style.display = "none"
    emptyFavoritesDiv.style.display = "block"
    return
  }

  try {
    const result = await getPropertyByIds(favoriteIds)

    loadingIndicator.style.display = "none"

    if (result.success && result.properties.length > 0) {
      favoritesGrid.innerHTML = result.properties.map(renderPropertyCard).join("")
      document.getElementById("favorites-count").textContent =
        `${result.properties.length} ${result.properties.length === 1 ? "property" : "properties"} saved`
    } else {
      emptyFavoritesDiv.style.display = "block"
    }
  } catch (error) {
    console.error("Error loading favorites:", error)
    loadingIndicator.style.display = "none"
    favoritesGrid.innerHTML =
      '<p class="loading-text" style="color: #ff6b6b;">Failed to load favorite properties. Please check console for details.</p>'
  }
}

document.addEventListener("DOMContentLoaded", loadFavorites)

window.reloadFavorites = loadFavorites
