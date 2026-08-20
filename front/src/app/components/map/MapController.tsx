import { RefObject, useEffect } from "react";

import { useMap } from "@vis.gl/react-google-maps";

import { Maximize2, Minimize2 } from "lucide-react";

import type { LatLngTuple } from "./geo";

import { MAP_CAMERA_ZOOM } from "./mapConstants";

interface MapControllerProps {
  focusPosition: LatLngTuple | null;

  fullScreen: boolean;

  onFullScreen: (fullScreen: boolean) => void;

  mapRef: RefObject<HTMLDivElement | null>;
}

export function MapController({
  focusPosition,

  fullScreen,

  onFullScreen,

  mapRef,
}: MapControllerProps) {
  const map = useMap();

  const lat = focusPosition?.[0];

  const lng = focusPosition?.[1];

  useEffect(() => {
    if (!map || lat === undefined || lng === undefined) return;

    map.panTo({ lat, lng });

    map.setZoom(MAP_CAMERA_ZOOM);
  }, [map, lat, lng]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;

      onFullScreen(isFullscreen);

      document.body.style.overflow = isFullscreen ? "hidden" : "auto";
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener(
        "fullscreenchange",

        handleFullscreenChange,
      );

      document.body.style.overflow = "auto";
    };
  }, [onFullScreen]);

  const toggleFullScreen = async () => {
    if (!document.fullscreenElement) {
      await mapRef.current?.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFullScreen}
      aria-label={fullScreen ? "Exit Full Screen" : "Full Screen"}
      className="absolute top-6 right-6 flex cursor-pointer items-center justify-center rounded-full border-0 bg-white p-2 shadow-md outline-none transition-colors hover:bg-gray-100"
    >
      {fullScreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
    </button>
  );
}
