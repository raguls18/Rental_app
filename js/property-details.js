// Property Details Modal Handler
export function openPropertyDetailsModal(propertyData) {
  const modal = document.getElementById("property-details-modal")

  // Populate basic info
  document.getElementById("modal-property-title").textContent = propertyData.title || "Property"
  document.getElementById("modal-property-price").textContent = `₹${propertyData.rent?.toLocaleString() || "N/A"}`
  document.getElementById("modal-property-location").textContent = propertyData.address || "Location not specified"

  // Populate features
  document.getElementById("modal-bedrooms").textContent = propertyData.bedrooms || "N/A"
  document.getElementById("modal-bathrooms").textContent = propertyData.bathrooms || "N/A"
  document.getElementById("modal-area").textContent = propertyData.area ? `${propertyData.area} sq ft` : "N/A"
  document.getElementById("modal-type").textContent = propertyData.type || "N/A"

  // Populate description
  document.getElementById("modal-description").textContent = propertyData.description || "No description available"

  // Populate amenities
  const amenitiesList = document.getElementById("amenities-list")
  if (propertyData.amenities && propertyData.amenities.length > 0) {
    amenitiesList.innerHTML = propertyData.amenities
      .map((amenity) => `<span class="amenity-tag">${amenity}</span>`)
      .join("")
  } else {
    amenitiesList.innerHTML = "<p>No amenities listed</p>"
  }

  // Populate owner info
  document.getElementById("modal-owner-name").textContent = propertyData.ownerName || "Owner"
  document.getElementById("modal-owner-phone").textContent = propertyData.ownerPhone || "N/A"
  document.getElementById("modal-owner-email").textContent = propertyData.ownerEmail || "N/A"

  // Setup gallery
  setupPropertyGallery(propertyData.images || [])

  // Setup favorite button
  setupFavoriteButton(propertyData.id)

  // Setup contact button
  document.getElementById("modal-contact-btn").onclick = () => {
    alert(`Contact: ${propertyData.ownerPhone || "N/A"}`)
  }

  // Setup compare button
  document.getElementById("modal-compare-btn").onclick = () => {
    addToComparison(propertyData)
  }

  // Show modal
  modal.classList.add("active")

  // Close button
  document.querySelector(".modal-close-btn").onclick = () => {
    modal.classList.remove("active")
  }

  // Close on overlay click
  document.querySelector(".modal-overlay").onclick = () => {
    modal.classList.remove("active")
  }
}

function setupPropertyGallery(images) {
  const mainImage = document.getElementById("main-property-image")
  const thumbnailsContainer = document.getElementById("thumbnails-container")

  if (images.length === 0) {
    mainImage.src = "/diverse-property-showcase.png"
    thumbnailsContainer.innerHTML = ""
    return
  }

  mainImage.src = images[0]

  thumbnailsContainer.innerHTML = images
    .map(
      (img, index) => `
        <div class="thumbnail ${index === 0 ? "active" : ""}" onclick="changeMainImage('${img}', this)">
            <img src="${img}" alt="Property image ${index + 1}">
        </div>
    `,
    )
    .join("")
}

window.changeMainImage = (imageSrc, element) => {
  document.getElementById("main-property-image").src = imageSrc
  document.querySelectorAll(".thumbnail").forEach((thumb) => thumb.classList.remove("active"))
  element.classList.add("active")
}

function setupFavoriteButton(propertyId) {
  const btn = document.getElementById("modal-favorite-btn")
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")

  if (favorites.includes(propertyId)) {
    btn.classList.add("active")
    btn.innerHTML = '<i class="fas fa-heart"></i> Remove from Favorites'
  }

  btn.onclick = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    const index = favorites.indexOf(propertyId)

    if (index > -1) {
      favorites.splice(index, 1)
      btn.classList.remove("active")
      btn.innerHTML = '<i class="far fa-heart"></i> Add to Favorites'
    } else {
      favorites.push(propertyId)
      btn.classList.add("active")
      btn.innerHTML = '<i class="fas fa-heart"></i> Remove from Favorites'
    }

    localStorage.setItem("favorites", JSON.stringify(favorites))
  }
}

function addToComparison(propertyData) {
  const comparison = JSON.parse(localStorage.getItem("propertyComparison") || "[]")

  if (comparison.length >= 3) {
    alert("You can compare up to 3 properties. Remove one to add another.")
    return
  }

  if (comparison.find((p) => p.id === propertyData.id)) {
    alert("This property is already in comparison")
    return
  }

  comparison.push(propertyData)
  localStorage.setItem("propertyComparison", JSON.stringify(comparison))
  alert("Property added to comparison!")
}
