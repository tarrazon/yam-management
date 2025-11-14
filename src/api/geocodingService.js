const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export async function geocodeAddress(address, ville) {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured');
    return null;
  }

  const fullAddress = `${address}, ${ville}`;
  const encodedAddress = encodeURIComponent(fullAddress);

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const { lat, lng } = result.geometry.location;

      return {
        latitude: lat,
        longitude: lng,
        formatted_address: result.formatted_address
      };
    }

    console.warn('No results found for address:', fullAddress);
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

export async function checkStreetViewAvailability(latitude, longitude) {
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured');
    return false;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/streetview/metadata?location=${latitude},${longitude}&radius=50&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Street View metadata request failed');
    }

    const data = await response.json();
    return data.status === 'OK';
  } catch (error) {
    console.error('Error checking Street View availability:', error);
    return false;
  }
}

export async function verifyAddressAndGetCoordinates(address, ville) {
  const geocodeResult = await geocodeAddress(address, ville);

  if (!geocodeResult) {
    return {
      success: false,
      error: 'Impossible de vérifier l\'adresse. Veuillez vérifier que l\'adresse est correcte.'
    };
  }

  const streetViewAvailable = await checkStreetViewAvailability(
    geocodeResult.latitude,
    geocodeResult.longitude
  );

  return {
    success: true,
    latitude: geocodeResult.latitude,
    longitude: geocodeResult.longitude,
    formatted_address: geocodeResult.formatted_address,
    street_view_available: streetViewAvailable
  };
}
