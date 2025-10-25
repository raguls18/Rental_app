import { initializeAuth, getCurrentUser, getUserData, logout } from "./firebase-auth.js"
import { getPropertyByIds } from "./firebase-properties.js"

let currentUser = null
let userData = null

document.addEventListener("DOMContentLoaded", initProfile)

async function initProfile() {
  await initializeAuth()

  currentUser = getCurrentUser()
  if (!currentUser) {
    console.log("[v0] No user found, redirecting to login")
    window.location.href = "login.html"
    return
  }

  try {
    userData = await getUserData()
    if (!userData) throw new Error("No user data")

    loadProfileData()
    loadFavoritesCount()
    loadSavedSearches()
    loadRecentFavorites()
    setupEventListeners()
  } catch (error) {
    console.error("Error initializing profile:", error)
    alert("Error loading profile. Please try again.")
  }
}

function loadProfileData() {
  document.getElementById("profile-name").textContent = userData.fullname || "User"
  document.getElementById("profile-email").textContent = userData.email || "N/A"
  document.getElementById("profile-phone").textContent = userData.phone || "Not provided"
}

function loadFavoritesCount() {
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
  document.getElementById("favorites-count").textContent = favorites.length
}

function loadSavedSearches() {
  const savedSearches = JSON.parse(localStorage.getItem("savedSearches") || "[]")
  const searchList = document.getElementById("saved-searches-list")

  if (savedSearches.length === 0) {
    searchList.innerHTML = '<p class="empty-state">No saved searches yet. Start searching to save your preferences!</p>'
    return
  }

  searchList.innerHTML = savedSearches
    .map(
      (search, index) => `
        <div class="search-item">
            <div class="search-item-info">
                <div class="search-item-name">${search.name || "Search " + (index + 1)}</div>
                <div class="search-item-details">
                    ${search.location ? `📍 ${search.location}` : ""} 
                    ${search.propertyType ? `🏠 ${search.propertyType}` : ""} 
                    ${search.bedrooms ? `🛏️ ${search.bedrooms}+ BHK` : ""}
                </div>
            </div>
            <div class="search-item-actions">
                <button class="btn-small btn-small-primary" onclick="applySavedSearch(${index})">
                    <i class="fas fa-search"></i> Use
                </button>
                <button class="btn-small btn-small-danger" onclick="deleteSavedSearch(${index})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `,
    )
    .join("")

  document.getElementById("searches-count").textContent = savedSearches.length
}

async function loadRecentFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
  const grid = document.getElementById("recent-favorites-grid")

  if (favorites.length === 0) {
    grid.innerHTML = '<p class="empty-state">No favorites yet. Add properties to your favorites!</p>'
    return
  }

  try {
    const result = await getPropertyByIds(favorites.slice(0, 6))

    if (result.success && result.properties.length > 0) {
      grid.innerHTML = result.properties
        .map(
          (property) => `
                <div class="property-card">
                    <div class="property-image" style="background-image: url('${property.images?.[0] || "/diverse-property-showcase.png"}')"></div>
                    <div class="property-details">
                        <h3>${property.title || "Property"}</h3>
                        <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${property.address || "Location"}</p>
                        <p class="property-price">₹${property.rent?.toLocaleString() || "N/A"}/month</p>
                    </div>
                </div>
            `,
        )
        .join("")
    } else {
      grid.innerHTML = '<p class="empty-state">No favorites yet. Add properties to your favorites!</p>'
    }
  } catch (error) {
    console.error("Error loading favorites:", error)
    grid.innerHTML = '<p class="empty-state">Error loading favorites</p>'
  }
}

function setupEventListeners() {
  const logoutBtn = document.getElementById("nav-logout-btn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (confirm("Are you sure you want to logout?")) {
        await logout()
      }
    })
  }

  // Edit profile
  document.getElementById("edit-profile-btn").addEventListener("click", openEditModal)
  document.querySelector(".modal-close").addEventListener("click", closeEditModal)
  document.querySelector(".modal-close-btn").addEventListener("click", closeEditModal)
  document.getElementById("save-profile-btn").addEventListener("click", saveProfileChanges)

  // Save preferences
  document.getElementById("save-preferences-btn").addEventListener("click", savePreferences)

  // Load saved preferences
  loadSavedPreferences()
}

function openEditModal() {
  document.getElementById("edit-name").value = userData.fullname || ""
  document.getElementById("edit-phone").value = userData.phone || ""
  document.getElementById("edit-bio").value = userData.bio || ""
  document.getElementById("edit-profile-modal").classList.add("active")
}

function closeEditModal() {
  document.getElementById("edit-profile-modal").classList.remove("active")
}

async function saveProfileChanges() {
  const name = document.getElementById("edit-name").value.trim()
  const phone = document.getElementById("edit-phone").value.trim()
  const bio = document.getElementById("edit-bio").value.trim()

  if (!name) {
    alert("Please enter your name")
    return
  }

  try {
    // Update local userData
    userData.fullname = name
    userData.phone = phone
    userData.bio = bio

    // Update localStorage (in a real app, this would update Firebase)
    localStorage.setItem("userProfile", JSON.stringify(userData))

    loadProfileData()
    closeEditModal()
    alert("Profile updated successfully!")
  } catch (error) {
    console.error("Error saving profile:", error)
    alert("Error saving profile. Please try again.")
  }
}

function savePreferences() {
  const preferences = {
    propertyType: document.getElementById("pref-property-type").value,
    bedrooms: document.getElementById("pref-bedrooms").value,
    budget: document.getElementById("pref-budget").value,
    location: document.getElementById("pref-location").value,
    savedAt: new Date().toISOString(),
  }

  localStorage.setItem("searchPreferences", JSON.stringify(preferences))
  alert("Preferences saved successfully!")
}

function loadSavedPreferences() {
  const preferences = JSON.parse(localStorage.getItem("searchPreferences") || "{}")

  if (preferences.propertyType) document.getElementById("pref-property-type").value = preferences.propertyType
  if (preferences.bedrooms) document.getElementById("pref-bedrooms").value = preferences.bedrooms
  if (preferences.budget) document.getElementById("pref-budget").value = preferences.budget
  if (preferences.location) document.getElementById("pref-location").value = preferences.location
}

// Global functions for saved searches
window.applySavedSearch = (index) => {
  const savedSearches = JSON.parse(localStorage.getItem("savedSearches") || "[]")
  const search = savedSearches[index]

  localStorage.setItem("searchParams", JSON.stringify(search))
  window.location.href = "seeker.html"
}

window.deleteSavedSearch = (index) => {
  if (confirm("Delete this saved search?")) {
    const savedSearches = JSON.parse(localStorage.getItem("savedSearches") || "[]")
    savedSearches.splice(index, 1)
    localStorage.setItem("savedSearches", JSON.stringify(savedSearches))
    loadSavedSearches()
  }
}
