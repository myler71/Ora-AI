import { useEffect, useState } from "react";

export function useUserLocation() {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setPosition(userPos);
      },
      (err) => {
        console.log("Location denied or not available", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      },
    );
  }, []);

  return position;
}
