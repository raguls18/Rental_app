import { db, storage } from "./firebase-config.js"
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js"
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-storage.js"
import {
  subscribeToProperties, // new realtime helper
} from "./firebase-properties.js"

export async function addPropertyWithFiles(propertyData, imageFiles, videoFile) {
  try {
    const imageUrls = []

    // Upload images
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const imageRef = ref(storage, `properties/${propertyData.ownerId}/images/${Date.now()}_${file.name}`)
      await uploadBytes(imageRef, file)
      const url = await getDownloadURL(imageRef)
      imageUrls.push(url)
    }

    // Upload video if provided
    let videoUrl = null
    if (videoFile) {
      const videoRef = ref(storage, `properties/${propertyData.ownerId}/videos/${Date.now()}_${videoFile.name}`)
      await uploadBytes(videoRef, videoFile)
      videoUrl = await getDownloadURL(videoRef)
    }

    propertyData.images = imageUrls
    if (videoUrl) propertyData.video = videoUrl
    propertyData.createdAt = new Date().toISOString()
    propertyData.status = "active"

    const docRef = await addDoc(collection(db, "properties"), propertyData)
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Add Property error:", error)
    return { success: false, error: error.message }
  }
}

const currentUser = null
let allProperties = []
let unsubscribeProps = null // track realtime unsubscribe

async function loadProperties() {
  try {
    showLoading(true)

    if (unsubscribeProps) {
      unsubscribeProps()
      unsubscribeProps = null
    }

    unsubscribeProps = subscribeToProperties((properties) => {
      allProperties = properties

      // If filters are filled, re-apply search; else show all
      const locationEl = document.getElementById("location-search")
      const hasAnyFilter =
        (locationEl && locationEl.value && locationEl.value.trim() !== "") ||
        document.getElementById("property-type-filter")?.value ||
        document.getElementById("rent-range-filter")?.value ||
        document.getElementById("bedrooms-filter")?.value

      if (hasAnyFilter) {
        performSearch()
      } else {
        displayProperties(allProperties)
      }
    })
  } catch (error) {
    console.error("Error loading properties:", error)
    showError("Error loading properties. Please try again.")
  } finally {
    showLoading(false)
  }
}

function showLoading(isLoading) {
  // Implementation here
}

function showError(message) {
  // Implementation here
}

function displayProperties(properties) {
  // Implementation here
}

function performSearch() {
  // Implementation here
}
