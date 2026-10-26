
const propertyImages = {
  "Green Valley Villa":
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",

  "Sunshine Apartments":
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80",

  "Royal Residency":
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",

  "Lake View House":
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80",

  "Orchid Heights":
    "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80",

  "Sunrise Bungalow":
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",

  "City Center Flat":
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",

  "Palm Residency":
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80",

  "Peaceful Cottage":
    "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=80",

  "Skyline Towers":
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",

  "Comfort Stay PG":
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",

  "Urban Nest Co-living":
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",

  "Business Plaza Office":
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",

  "City Centre Retail Shop":
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80",
};

const fallbackImages = {
  Villa:
    "https://images.unsplash.com/photo-1613490493576-7de63acd8115?auto=format&fit=crop&w=900&q=80",

  Apartment:
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80",

  House:
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80",

  Bungalow:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",

  PG:
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80",

  "Co-living":
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",

  Commercial:
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
};

export function getPropertyImage(property) {
  if (!property) {
    return fallbackImages.House;
  }

  // Prefer the image saved with the property, if available.
  const savedImage =
    property.imageUrl ||
    property.imageURL ||
    property.image_url;

  if (typeof savedImage === "string" && savedImage.trim()) {
    return savedImage.trim();
  }

  // Support different property-name fields.
  const name = String(
    property.propertyName || property.name || ""
  ).trim().toLowerCase();

  const matchedName = Object.keys(propertyImages).find(
    (key) => key.toLowerCase() === name
  );

  if (matchedName) {
    return propertyImages[matchedName];
  }

  // Use the property type as a fallback.
  const type = String(
    property.propertyType || property.type || ""
  ).trim().toLowerCase();

  const matchedType = Object.keys(fallbackImages).find(
    (key) => key.toLowerCase() === type
  );

  return fallbackImages[matchedType] || fallbackImages.House;
}
