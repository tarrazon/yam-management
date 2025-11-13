import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin, Check, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AddressAutocomplete({ 
  onAddressSelect,
  initialAddress = "",
  initialVille = "",
  initialCodePostal = ""
}) {
  const [searchTerm, setSearchTerm] = useState(initialAddress);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Rechercher les adresses
  const searchAddress = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=fr&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Erreur de recherche d'adresse:", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm && !selectedAddress) {
        searchAddress(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectSuggestion = (suggestion) => {
    const address = suggestion.address;
    const fullAddress = [
      suggestion.address.house_number,
      suggestion.address.road,
    ].filter(Boolean).join(' ');

    const ville = address.city || address.town || address.village || address.municipality || "";
    const codePostal = address.postcode || "";

    setSearchTerm(suggestion.display_name);
    setSelectedAddress(suggestion);
    setShowSuggestions(false);
    
    onAddressSelect({
      adresse: fullAddress,
      ville: ville,
      code_postal: codePostal,
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
    });
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedAddress(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="adresse_search" className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-[#F59E0B]" />
        Rechercher l'adresse complète *
      </Label>
      
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              id="adresse_search"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Ex: 12 rue de la République, Paris..."
              className={`pr-10 ${selectedAddress ? 'border-green-500 bg-green-50' : ''}`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-[#1E40AF] animate-spin" />
              ) : selectedAddress ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : searchTerm && suggestions.length === 0 ? (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              ) : null}
            </div>
          </div>
        </div>

        {selectedAddress && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-800">Adresse validée :</p>
                <p className="text-xs text-green-700 mt-1">{selectedAddress.display_name}</p>
              </div>
            </div>
          </div>
        )}

        {showSuggestions && suggestions.length > 0 && !selectedAddress && (
          <Card className="absolute z-50 w-full mt-1 shadow-xl border-2 border-[#1E40AF] max-h-80 overflow-y-auto">
            <div className="p-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full text-left p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#1E40AF] mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {suggestion.display_name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {suggestion.address.postcode} {suggestion.address.city || suggestion.address.town || suggestion.address.village}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}

        {searchTerm && !isSearching && suggestions.length === 0 && !selectedAddress && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Aucune adresse trouvée. Vérifiez l'orthographe ou soyez plus précis.
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500 mt-2">
          Tapez au moins 3 caractères pour voir les suggestions. L'adresse sera validée automatiquement.
        </p>
      </div>
    </div>
  );
}