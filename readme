# RentHouse - Property Rental Platform

A modern web application for renting and listing properties built with Firebase and vanilla JavaScript.

## Project Overview

RentHouse is a two-sided marketplace connecting property owners with tenants. Users can register as either an owner or a seeker, browse properties, manage favorites, and communicate directly.

## Features

### For Seekers (Tenants)
- Browse and search properties with advanced filters
- Save favorite properties
- View detailed property information
- Contact property owners directly via WhatsApp
- Manage profile and preferences
- View saved searches

### For Owners
- List properties with images and details
- Manage property listings
- View inquiries from interested tenants
- Track property performance

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Firestore, Authentication)
- **Storage**: Firebase Cloud Storage
- **Real-time**: Firestore Real-time Database

## Project Structure

\`\`\`
├── index.html                 # Landing page
├── login.html                 # Authentication page
├── register.html              # User registration
├── seeker.html                # Property search page
├── property-details.html      # Property details view
├── favoritesseeker.html       # Favorites management
├── seeker-profile.html        # User profile
├── owner-dashboard.html       # Owner property management
├── add-property.html          # Add new property
├── css/                       # Stylesheets
│   ├── style.css              # Global styles
│   ├── property-details.css   # Property details styling
│   ├── favorites.css          # Favorites page styling
│   └── ...
├── js/                        # JavaScript modules
│   ├── firebase-config.js     # Firebase configuration
│   ├── firebase-auth.js       # Authentication logic
│   ├── firebase-properties.js # Property management
│   ├── property-details.js    # Property details logic
│   ├── favorites.js           # Favorites logic
│   └── ...
└── public/                    # Static assets
\`\`\`

## Firebase Setup

### Collections Structure

#### Users Collection
\`\`\`json
{
  "uid": "user_id",
  "fullname": "User Name",
  "email": "user@example.com",
  "phone": "1234567890",
  "userType": "seeker|owner",
  "createdAt": "2024-01-01T00:00:00Z"
}
\`\`\`

#### Properties Collection
\`\`\`json
{
  "title": "Property Title",
  "description": "Property description",
  "address": "Street address",
  "city": "City name",
  "state": "State",
  "pincode": "123456",
  "rent": 25000,
  "bedrooms": 2,
  "bathrooms": 1,
  "area": 1200,
  "type": "house|apartment|villa",
  "amenities": ["WiFi", "Parking"],
  "images": ["image_url_1", "image_url_2"],
  "ownerUid": "owner_user_id",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z"
}
\`\`\`

## Key Features Explained

### 1. User Registration & Authentication
- Users register with email, password, phone, and name
- Email verification required before login
- Two user types: Seeker (tenant) and Owner
- Phone number validation (10 digits)

### 2. Property Management
- Owners can add properties with images, amenities, and details
- Properties are stored in Firestore with owner UID
- Real-time property updates
- Property status management (active/inactive)

### 3. Favorites System
- Favorites stored in browser localStorage
- Synced with user profile
- Quick add/remove functionality
- Favorites count displayed in profile

### 4. Property Details Page
- Displays complete property information
- Shows owner contact details (name, phone, email)
- Share property via WhatsApp, Email, or copy link
- Contact owner button opens WhatsApp with pre-filled message
- Add/remove from favorites

### 5. Search & Filtering
- Filter by location, property type, bedrooms, price range
- Real-time search results
- Save search preferences
- Sort by newest, price (low to high), price (high to low)

## Important Data Flow

### Registration → Profile → Property Details

1. **Registration** (`register.html`)
   - User enters: fullname, email, phone, password, userType
   - Data saved to Firebase `users` collection with UID

2. **Profile** (`seeker-profile.html`)
   - Fetches user data from Firebase using current user UID
   - Displays: name, email, phone
   - Shows favorites count from localStorage

3. **Property Details** (`property-details.html`)
   - Fetches property data from Firebase
   - Uses `ownerUid` from property to fetch owner details
   - Displays owner name, phone, email from users collection
   - Enables contact via WhatsApp with owner's phone number

## Common Issues & Solutions

### Issue: Phone/Email showing "Not provided" in Property Details
**Solution**: Ensure:
1. Property document has `ownerUid` field set correctly
2. Owner's user document has `phone` and `email` fields populated
3. Check Firebase console to verify data structure

### Issue: Favorites count shows 4 but only 1 property displays
**Solution**: 
1. Check localStorage favorites array: `JSON.parse(localStorage.getItem('favorites'))`
2. Verify all favorite property IDs exist in Firebase
3. Check `getPropertyByIds()` function - it has a 10-item limit per query

### Issue: Contact Owner button not working
**Solution**:
1. Verify owner's phone number is in correct format (10 digits)
2. Check if phone number is stored in Firebase users collection
3. Ensure WhatsApp is installed on device (for mobile)

## Installation & Setup

1. Clone the repository
2. Configure Firebase credentials in `js/firebase-config.js`
3. Set up Firestore database with collections: `users`, `properties`
4. Deploy to a web server or use locally with a development server
5. Access via browser at configured URL

## Usage

### For Seekers
1. Register as a Seeker
2. Browse properties using Search page
3. Click on property to view details
4. Add to favorites or contact owner
5. View all favorites in Favorites page

### For Owners
1. Register as an Owner
2. Go to Owner Dashboard
3. Add new properties with images and details
4. Manage existing listings
5. View inquiries from interested tenants

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Payment integration for booking
- Advanced analytics for owners
- Messaging system between users
- Property reviews and ratings
- Virtual property tours
- Mobile app version

## Support

For issues or questions, please check the Firebase console for error logs and verify data structure matches the schema provided above.
\`\`\`

Now let me fix the property-details.js to properly fetch owner data:
