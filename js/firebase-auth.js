import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

let currentUser = null;

export function initializeAuth() {
  return new Promise(resolve => {
    onAuthStateChanged(auth, user => {
      currentUser = user;
      resolve(user);
    });
  });
}

export function getCurrentUser() {
  return currentUser;
}

export function requireAuth() {
  if (!currentUser) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

export async function getUserData() {
  try {
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }
    
    return userDoc.data();
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
}

export async function registerUser(userData) {
  try {
    if (!validateRegistrationData(userData)) {
      throw new Error("Invalid registration data.");
    }
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: userData.fullname });
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      fullname: userData.fullname,
      email: userData.email,
      phone: userData.phone,
      userType: userData.userType,
      createdAt: new Date().toISOString()
    });
    
    // Send the verification email
    await sendEmailVerification(user);

    return { success: true, message: "Registration successful! Please check your email to verify your account." };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function loginUser(loginData) {
  try {
    if (!validateLoginData(loginData)) {
      throw new Error("Email, password, and user type are required.");
    }
    const userCredential = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
    const user = userCredential.user;

    // Check if the user's email is verified
    if (!user.emailVerified) {
      await signOut(auth);
      return { success: false, error: "Please verify your email before logging in. Check your inbox for a verification link." };
    }

    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists()) {
      await signOut(auth);
      return { success: false, error: "User profile not found." };
    }
    
    const userData = userSnap.data();
    if (userData.userType !== loginData.userType) {
      await signOut(auth);
      return { success: false, error: "Wrong user type selected. Please select the correct role (Owner or Tenant)." };
    }

    return { success: true, user, userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function logout() {
  try {
    await signOut(auth);
    currentUser = null;
    console.log("User logged out successfully");
    
    // Redirect to login page after successful logout
    window.location.href = 'login.html'; 

    return { success: true };
  } catch (error) {
    console.error("Logout Error:", error);
    return { success: false, error: error.message };
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Password reset email sent!" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// VALIDATION HELPERS
function validateRegistrationData(data) {
  if (!data.fullname || data.fullname.trim().length < 2) return false;
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return false;
  if (!data.phone || !/^\d{10}$/.test(data.phone)) return false;
  if (!data.password || data.password.length < 6) return false;
  if (data.password !== data.confirmPassword) return false;
  if (!data.userType) return false;
  return true;
}

function validateLoginData(data) {
  return !!(data.email && data.password && data.userType);
}
