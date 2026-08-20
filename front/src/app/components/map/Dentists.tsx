/// <reference types="google.maps" />
import { AdvancedMarker, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import type { LatLngTuple } from "./geo";
import {
  DENTIST_PLACE_TYPES,
  PLACES_NEARBY_MAX_RESULTS,
  PLACES_NEARBY_RADIUS_METERS,
} from "./mapConstants";
import MarkerPopup from "./MarkerPopup";

export type DentistMarker = {
  id: string;
  lat: number;
  lng: number;
  title?: string;
  address?: string;
  googleMapsURI?: string;
};

function mapNearbyPlacesToMarkers(
  places: readonly google.maps.places.Place[],
): DentistMarker[] {
  const next: DentistMarker[] = [];
  for (const place of places) {
    const loc = place.location;

    if (!loc) continue;
    next.push({
      id: place.id,
      lat: loc.lat(),
      lng: loc.lng(),
      title: place.displayName ?? undefined,
      address: place.formattedAddress ?? undefined,
      googleMapsURI: place.googleMapsURI ?? undefined,
    });
  }
  return next;
}

export function Dentists({ position }: { position: LatLngTuple }) {
  const placesLib = useMapsLibrary("places");
  const [markers, setMarkers] = useState<DentistMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<DentistMarker | null>(
    null,
  );

  const lat = position[0];
  const lng = position[1];

  useEffect(() => {
    if (!placesLib) return;

    let cancelled = false;

    const load = async () => {
      try {
        const { places: results } = await placesLib.Place.searchNearby({
          fields: [
            "id",
            "location",
            "displayName",
            "formattedAddress",
            "googleMapsURI",
          ],
          includedPrimaryTypes: [...DENTIST_PLACE_TYPES],
          locationRestriction: {
            center: { lat, lng },
            radius: PLACES_NEARBY_RADIUS_METERS,
          },
          maxResultCount: PLACES_NEARBY_MAX_RESULTS,
          rankPreference: placesLib.SearchNearbyRankPreference.DISTANCE,
        });

        if (cancelled) return;

        setMarkers(mapNearbyPlacesToMarkers(results ?? []));
      } catch {
        if (!cancelled) setMarkers([]);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [placesLib, lat, lng]);

  return (
    <>
      {markers.map((m) => (
        <AdvancedMarker
          key={m.id}
          position={{ lat: m.lat, lng: m.lng }}
          onClick={() => setSelectedMarker(m)}
        >
          <div className="bg-blue-700/85 text-white p-2 rounded-full font-bold text-sm w-10 h-10 flex items-center justify-center">
            🦷
          </div>
        </AdvancedMarker>
      ))}

      {selectedMarker && (
        <MarkerPopup
          selectedMarker={selectedMarker}
          setSelectedMarker={setSelectedMarker}
        />
      )}
    </>
  );
}
