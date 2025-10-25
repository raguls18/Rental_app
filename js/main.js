// Main website functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the website
    initializeWebsite();
    
    // Setup search functionality on homepage
    setupHomepageSearch();
    
    // Load sample properties if none exist
    loadSampleProperties();
});

function initializeWebsite() {
    // Show current user info if logged in
    updateNavigationForUser();
    
    // Set up smooth scrolling
    setupSmoothScrolling();
}

function updateNavigationForUser() {
    const loginBtn = document.querySelector('.btn-login');
    const registerBtn = document.querySelector('.btn-register');
    
    if (currentUser) {
        // User is logged in, show dashboard link instead
        if (loginBtn) {
            loginBtn.textContent = 'Dashboard';
            loginBtn.href = currentUser.userType === 'owner' ? 'owner-dashboard.html' : 'seeker.html';
        }
        
        if (registerBtn) {
            registerBtn.textContent = 'Logout';
            registerBtn.href = '#';
            registerBtn.onclick = function(e) {
                e.preventDefault();
                logout();
            };
        }
    }
}

function setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

function setupHomepageSearch() {
    const searchBtn = document.querySelector('#search-btn');
    const locationSearch = document.querySelector('#location-search');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performHomepageSearch);
    }
    
    if (locationSearch) {
        locationSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performHomepageSearch();
            }
        });
    }
}

function performHomepageSearch() {
    const location = document.getElementById('location-search').value;
    const propertyType = document.getElementById('property-type').value;
    const rentRange = document.getElementById('rent-range').value;
    
    // Store search parameters
    const searchParams = {
        location,
        propertyType,
        rentRange
    };
    
    localStorage.setItem('searchParams', JSON.stringify(searchParams));
    
    // Redirect to seeker dashboard or show results
    if (currentUser && currentUser.userType === 'seeker') {
        window.location.href = 'seeker.html';
    } else {
        // For non-logged users, show results on the same page
        showSearchResults(searchParams);
    }
}

function showSearchResults(searchParams) {
    let filteredProperties = properties;
    
    // Apply filters
    if (searchParams.location) {
        filteredProperties = filteredProperties.filter(property => 
            property.address.toLowerCase().includes(searchParams.location.toLowerCase()) ||
            property.title.toLowerCase().includes(searchParams.location.toLowerCase())
        );
    }
    
    if (searchParams.propertyType) {
        filteredProperties = filteredProperties.filter(property => 
            property.type === searchParams.propertyType
        );
    }
    
    if (searchParams.rentRange) {
        filteredProperties = filteredProperties.filter(property => {
            const rent = property.rent;
            switch (searchParams.rentRange) {
                case '0-10000':
                    return rent <= 10000;
                case '10000-25000':
                    return rent > 10000 && rent <= 25000;
                case '25000-50000':
                    return rent > 25000 && rent <= 50000;
                case '50000+':
                    return rent > 50000;
                default:
                    return true;
            }
        });
    }
    
    // Display results
    const propertiesGrid = document.getElementById('properties-grid');
    if (propertiesGrid) {
        displayProperties(filteredProperties, propertiesGrid);
        
        // Scroll to results
        document.getElementById('properties').scrollIntoView({
            behavior: 'smooth'
        });
    }
}

function loadSampleProperties() {
    // If no properties exist, create some sample ones
    if (properties.length === 0) {
        const sampleProperties = [
            {
                id: 1,
                title: "Modern 2BHK Apartment in City Center",
                type: "apartment",
                rent: 25000,
                bedrooms: 2,
                address: "MG Road, Bangalore, Karnataka",
                description: "Beautiful 2BHK apartment with modern amenities in the heart of the city. Perfect for professionals and small families.",
                amenities: ["parking", "gym", "wifi", "pool"],
                contact: "9876543210",
                images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&w=500"],
                ownerId: 0,
                ownerName: "Sample Owner",
                createdAt: new Date().toISOString(),
                views: 45,
                inquiries: 12
            },
            {
                id: 2,
                title: "Spacious 3BHK Villa with Garden",
                type: "villa",
                rent: 45000,
                bedrooms: 3,
                address: "Koramangala, Bangalore, Karnataka",
                description: "Luxurious 3BHK villa with private garden and parking. Ideal for families looking for space and comfort.",
                amenities: ["parking", "garden", "wifi", "pet-friendly"],
                contact: "9876543211",
                images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&w=500"],
                ownerId: 0,
                ownerName: "Villa Owner",
                createdAt: new Date().toISOString(),
                views: 78,
                inquiries: 23
            },
            {
                id: 3,
                title: "Cozy 1BHK Studio Apartment",
                type: "apartment",
                rent: 15000,
                bedrooms: 1,
                address: "HSR Layout, Bangalore, Karnataka",
                description: "Perfect studio apartment for bachelors or young professionals. Fully furnished with all modern amenities.",
                amenities: ["wifi", "gym", "parking"],
                contact: "9876543212",
                images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&w=500"],
                ownerId: 0,
                ownerName: "Studio Owner",
                createdAt: new Date().toISOString(),
                views: 92,
                inquiries: 31
            }
        ];
        
        properties = sampleProperties;
        localStorage.setItem('properties', JSON.stringify(properties));
    }
    
    // Display properties on homepage
    const propertiesGrid = document.getElementById('properties-grid');
    if (propertiesGrid) {
        displayProperties(properties.slice(0, 6), propertiesGrid); // Show only first 6 properties
    }
}
