import { useCallback, useRef, useState } from "react";

import {
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_ID,
} from "../components/map/mapConstants";

import { Dentists } from "../components/map/Dentists";

import { MapSearchBar } from "../components/map/MapSearchBar";

import type { LatLngTuple } from "../components/map/geo";

import { APIProvider, Map as GoogleMap } from "@vis.gl/react-google-maps";

import clsx from "clsx";

import { MapController } from "../components/map/MapController";

import UserMarker from "../components/map/UserMarker";

import { useUserLocation } from "../hooks";

type MapProps = {
  embedded?: boolean;
};

export default function Map({ embedded = false }: MapProps = {}) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const [fullScreen, setFullScreen] = useState(false);

  const userPosition = useUserLocation();

  const [searchAnchor, setSearchAnchor] = useState<LatLngTuple | null>(null);

  const mapFocusPosition = searchAnchor ?? userPosition;

  const handlePlaceSelected = useCallback((lat: number, lng: number) => {
    setSearchAnchor([lat, lng]);
  }, []);

  return (
    <div
      className={clsx(
        "w-full flex items-center justify-center",
        embedded ? "h-[600px]" : "h-screen",
      )}
      ref={mapRef}
    >
      <div
        className={clsx(
          "rounded-xl overflow-hidden",
          fullScreen
            ? "w-full h-full"
            : embedded
              ? "w-full h-full relative shadow-md border"
              : "w-[70vw] h-[70vh] relative z-[1000]",
        )}
      >
        <APIProvider
          apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          libraries={["places"]}
          onLoad={() => {
            if (import.meta.env.DEV) {
              console.log("Maps API has loaded.");
            }
          }}
        >
          {fullScreen && (
            <MapSearchBar
              origin={userPosition}
              onPlaceSelected={handlePlaceSelected}
            />
          )}

          <GoogleMap
            className="w-full h-full"
            mapId={MAP_ID}
            defaultCenter={MAP_DEFAULT_CENTER}
            defaultZoom={MAP_DEFAULT_ZOOM}
            gestureHandling="greedy"
            disableDefaultUI
          >
            <UserMarker userPosition={userPosition} />

            {mapFocusPosition && <Dentists position={mapFocusPosition} />}

            <MapController
              mapRef={mapRef}
              focusPosition={mapFocusPosition}
              fullScreen={fullScreen}
              onFullScreen={setFullScreen}
            />
          </GoogleMap>
        </APIProvider>
      </div>
    </div>
  );
}
