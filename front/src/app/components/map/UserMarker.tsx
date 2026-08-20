import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";
import type { LatLngTuple } from "./geo";

function UserMarker({ userPosition }: { userPosition: LatLngTuple | null }) {
  if (!userPosition) return null;

  return (
    <AdvancedMarker
      position={{
        lat: userPosition[0],
        lng: userPosition[1],
      }}
      title="Your location"
      className="bg-red-500/85 text-white p-2 rounded-full font-bold text-sm w-10 h-10 flex items-center justify-center"
    >
      <MapPin size={24} className="text-white" />
    </AdvancedMarker>
  );
}

export default UserMarker;
