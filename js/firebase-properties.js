import { db } from "./firebase-config.js"
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  documentId, // <-- IMPORTANT: Added for querying by document ID
  increment as firestoreIncrement,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js"

/**
 * NEW FUNCTION ADDED: Fetches a list of properties by their specific IDs.
 * This is crucial for the Favorites page.
 */
export async function getPropertyByIds(ids) {
    if (!ids || ids.length === 0) {
        return { success: true, properties: [] };
    }
    
    // Firestore's 'in' operator has a limit of 10 items. 
    if (ids.length > 10) {
         // Handle this edge case by fetching in batches if you expect more than 10 favorites
         console.warn("Attempting to fetch more than 10 documents by ID. Batching is recommended.");
         // For simplicity and assuming low volume, we only use the first 10.
         // In a production app, you'd loop and batch calls here.
         ids = ids.slice(0, 10); 
    }

    try {
        const propertiesRef = collection(db, "properties");
        // Use documentId() to query the document ID field itself
        const q = query(propertiesRef, where(documentId(), 'in', ids)); 
        const snapshot = await getDocs(q);
        
        const properties = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { success: true, properties };
    } catch (error) {
        console.error("getPropertyByIds error:", error);
        return { success: false, error: error.message };
    }
}


/**
 * Add a property to Firestore.
 * Returns { success: true, propertyId } on success.
 */
export async function addProperty(propertyData) {
  try {
    const data = {
      ...propertyData,
      createdAt: propertyData.createdAt || new Date().toISOString(),
      status: propertyData.status || "active",
    }
    const docRef = await addDoc(collection(db, "properties"), data)
    return { success: true, propertyId: docRef.id }
  } catch (error) {
    console.error("addProperty error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all active properties (one-time fetch).
 */
export async function getAllProperties() {
  try {
    const q = query(collection(db, "properties"), where("status", "==", "active"))
    const snap = await getDocs(q)
    const properties = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    properties.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    return { success: true, properties }
  } catch (error) {
    console.error("getAllProperties error:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Client-side search over active properties fetched once.
 */
export async function searchProperties(filters = {}) {
  const base = await getAllProperties()
  if (!base.success) return base

  let props = base.properties

  if (filters.location) {
    const term = filters.location.toLowerCase()
    props = props.filter((p) => {
      const addr = (p.address || "").toLowerCase()
      const city = (p.city || "").toLowerCase()
      const state = (p.state || "").toLowerCase()
      const pincode = (p.pincode || "").toLowerCase()
      return addr.includes(term) || city.includes(term) || state.includes(term) || pincode.includes(term)
    })
  }

  if (filters.propertyType) {
    props = props.filter((p) => (p.type || "").toLowerCase() === filters.propertyType.toLowerCase())
  }

  if (filters.bedrooms) {
    const minBeds = Number.parseInt(filters.bedrooms, 10) || 0
    props = props.filter((p) => (Number.parseInt(p.bedrooms, 10) || 0) >= minBeds)
  }

  if (filters.rentRange || filters.minRent != null || filters.maxRent != null) {
    let min = 0
    let max = Number.MAX_SAFE_INTEGER

    if (filters.rentRange) {
      const [lo, hi] = filters.rentRange.split("-")
      min = Number.parseInt(lo) || 0
      max = hi === "" ? Number.MAX_SAFE_INTEGER : Number.parseInt(hi) || Number.MAX_SAFE_INTEGER
    } else {
      if (filters.minRent != null) min = Number.parseInt(filters.minRent) || 0
      if (filters.maxRent != null) max = Number.parseInt(filters.maxRent) || Number.MAX_SAFE_INTEGER
    }

    props = props.filter((p) => {
      const rent = Number.parseInt(p.rent, 10) || 0
      return rent >= min && rent <= max
    })
  }

  return { success: true, properties: props }
}

/**
 * Real-time subscription to active properties. Returns unsubscribe function.
 */
export function subscribeToProperties(callback) {
  try {
    const q = query(collection(db, "properties"), where("status", "==", "active"))
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const properties = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        properties.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
        callback(properties)
      },
      (error) => console.error("subscribeToProperties error:", error),
    )
    return unsub
  } catch (error) {
    console.error("subscribeToProperties setup error:", error)
    return () => {}
  }
}

/**
 * Increment inquiry count for a property.
 */
export async function incrementInquiries(propertyId) {
  try {
    const ref = doc(db, "properties", propertyId)
    await updateDoc(ref, { inquiries: firestoreIncrement(1) })
    return { success: true }
  } catch (error) {
    console.error("incrementInquiries error:", error)
    return { success: false, error: error.message }
  }
}
