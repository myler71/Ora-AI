import { InfoWindow } from "@vis.gl/react-google-maps";
import { DentistMarker } from "./Dentists";
import { ADDRESS_SUFFIX_EGYPT } from "./mapConstants";

function formatPopupAddress(address: string) {
  return address.replace(ADDRESS_SUFFIX_EGYPT, "").trim();
}

function MarkerPopup({
  selectedMarker,
  setSelectedMarker,
}: {
  selectedMarker: DentistMarker;
  setSelectedMarker: (marker: DentistMarker | null) => void;
}) {
  return (
    <InfoWindow
      position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
      headerContent={
        <h3 className="text-lg font-bold">{selectedMarker.title}</h3>
      }
      pixelOffset={[0, -40]}
      onCloseClick={() => setSelectedMarker(null)}
    >
      <div className="max-w-sm">
        <p className="text-sm text-gray-500 mb-2">
          {formatPopupAddress(selectedMarker.address ?? "")}
        </p>

        {selectedMarker.googleMapsURI && (
          <a
            href={selectedMarker.googleMapsURI}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 underline"
          >
            Open in Google Maps
          </a>
        )}
      </div>
    </InfoWindow>
  );
}

export default MarkerPopup;
