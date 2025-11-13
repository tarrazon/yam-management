import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Eye, Edit, Trash2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const statusColors = {
  active: "bg-green-100 text-green-800",
  en_renovation: "bg-yellow-100 text-yellow-800",
  en_liquidation: "bg-red-100 text-red-800",
  fermee: "bg-slate-100 text-slate-800",
};

const statusLabels = {
  active: "Active",
  en_renovation: "En rénovation",
  en_liquidation: "En liquidation",
  fermee: "Fermée",
};

const typeColors = {
  ehpad: "bg-purple-100 text-purple-800",
  etudiante: "bg-blue-100 text-blue-800",
  affaires: "bg-indigo-100 text-indigo-800",
  tourisme: "bg-amber-100 text-amber-800",
  senior: "bg-rose-100 text-rose-800",
};

export default function ResidencesMapView({ residences, onEdit, onView, onDelete, lotsCountByResidence }) {
  const [geocodedResidences, setGeocodedResidences] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingProgress, setGeocodingProgress] = useState(0);

  useEffect(() => {
    const geocodeResidences = async () => {
      setIsGeocoding(true);
      setGeocodingProgress(0);
      const geocoded = [];

      // Filtrer uniquement les résidences avec adresse ET ville
      const residencesToGeocode = residences.filter(r => r.ville && (r.adresse || r.code_postal));

      for (let i = 0; i < residencesToGeocode.length; i++) {
        const residence = residencesToGeocode[i];
        
        // Construire l'adresse pour la recherche
        const searchParts = [];
        if (residence.adresse) searchParts.push(residence.adresse);
        if (residence.code_postal) searchParts.push(residence.code_postal);
        searchParts.push(residence.ville);
        searchParts.push("France");
        
        const fullAddress = searchParts.join(', ');
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`,
            {
              headers: {
                'Accept': 'application/json',
              }
            }
          );
          const data = await response.json();
          
          if (data && data.length > 0) {
            geocoded.push({
              ...residence,
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon),
            });
          }
        } catch (error) {
          console.error(`Erreur de géocodage pour ${residence.nom}:`, error);
        }

        // Mise à jour de la progression
        setGeocodingProgress(Math.round(((i + 1) / residencesToGeocode.length) * 100));

        // Délai pour respecter les limites de l'API (1 requête par seconde)
        if (i < residencesToGeocode.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setGeocodedResidences(geocoded);
      setIsGeocoding(false);
    };

    if (residences.length > 0) {
      geocodeResidences();
    }
  }, [residences]);

  if (isGeocoding) {
    return (
      <div className="flex items-center justify-center h-96 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1E40AF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Chargement de la carte...</p>
          <p className="text-sm text-slate-400">Géolocalisation des résidences : {geocodingProgress}%</p>
          <div className="w-64 h-2 bg-slate-200 rounded-full mt-4 mx-auto overflow-hidden">
            <div 
              className="h-full bg-[#1E40AF] transition-all duration-300"
              style={{ width: `${geocodingProgress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (geocodedResidences.length === 0) {
    return (
      <Card className="border-none shadow-lg">
        <CardContent className="p-12 text-center">
          <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-semibold mb-2">Aucune résidence à afficher sur la carte</p>
          <p className="text-sm text-slate-400">
            Les résidences doivent avoir au minimum une <strong>ville</strong> renseignée.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            💡 Astuce : Ajoutez l'adresse et le code postal pour une localisation plus précise.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Centre de la carte (moyenne des coordonnées)
  const centerLat = geocodedResidences.reduce((sum, r) => sum + r.lat, 0) / geocodedResidences.length;
  const centerLon = geocodedResidences.reduce((sum, r) => sum + r.lon, 0) / geocodedResidences.length;

  return (
    <div className="space-y-4">
      {geocodedResidences.length < residences.length && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            ⚠️ <strong>{residences.length - geocodedResidences.length}</strong> résidence(s) non affichée(s) car l'adresse est incomplète ou introuvable.
          </p>
        </div>
      )}
      
      <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-slate-200">
        <MapContainer
          center={[centerLat, centerLon]}
          zoom={6}
          style={{ height: "700px", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geocodedResidences.map((residence) => (
            <Marker key={residence.id} position={[residence.lat, residence.lon]}>
              <Popup className="w-80">
                <div className="p-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-5 h-5 text-[#1E40AF]" />
                    <h3 className="font-bold text-[#1E40AF] text-lg">{residence.nom}</h3>
                  </div>
                  
                  <div className="flex gap-2 mb-3">
                    <Badge className={statusColors[residence.statut]}>
                      {statusLabels[residence.statut]}
                    </Badge>
                    <Badge className={typeColors[residence.type_residence]}>
                      {residence.type_residence}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-600">
                        {residence.adresse && <>{residence.adresse}<br /></>}
                        {residence.code_postal} {residence.ville}
                      </p>
                    </div>

                    {residence.gestionnaire && (
                      <p className="text-slate-600">
                        <span className="font-semibold">Gestionnaire:</span> {residence.gestionnaire}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <div>
                        <p className="text-xs text-slate-500">Lots total</p>
                        <p className="font-bold text-[#1E40AF]">{residence.nombre_lots_total || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Portefeuille</p>
                        <p className="font-bold text-[#F59E0B]">{lotsCountByResidence?.[residence.id] || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(residence)}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Voir
                    </Button>
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(residence)}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Modifier
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(residence)}
                        className="hover:bg-red-50 hover:border-red-200"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}