/// <reference types="google.maps" />
import { memo, useEffect, useId, useRef, useState } from "react";
import { useDebounce } from "../../hooks";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import type { LatLngTuple } from "./geo";
import {
  AUTOCOMPLETE_DEBOUNCE_MS,
  AUTOCOMPLETE_LOCATION_BIAS_RADIUS_METERS,
  EG_REGION_CODE,
  EG_REGION_CODES,
  SEARCH_INPUT_PLACEHOLDER,
} from "./mapConstants";

type MapSearchBarProps = {
  origin: LatLngTuple | null;
  onPlaceSelected: (lat: number, lng: number) => void;
};

type SuggestionRow = {
  key: string;
  placePrediction: google.maps.places.PlacePrediction;
  label: string;
  sublabel: string | null;
};

function toRows(
  suggestions: google.maps.places.AutocompleteSuggestion[],
): SuggestionRow[] {
  const rows: SuggestionRow[] = [];
  for (const s of suggestions) {
    const placePrediction = s.placePrediction;
    if (!placePrediction) continue;
    const main = placePrediction.mainText?.text;
    const full = placePrediction.text.text;
    const sub = placePrediction.secondaryText?.text ?? null;
    rows.push({
      key: placePrediction.placeId,
      placePrediction,
      label: main ?? full,
      sublabel: sub,
    });
  }
  return rows;
}

export const MapSearchBar = memo(function MapSearchBar({
  origin,
  onPlaceSelected,
}: MapSearchBarProps) {
  const listId = useId();
  const placesLib = useMapsLibrary("places");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const debouncedQuery = useDebounce(query, AUTOCOMPLETE_DEBOUNCE_MS);

  const originLat = origin?.[0];
  const originLng = origin?.[1];

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      setLoading(false);
      sessionTokenRef.current = null;
      return;
    }
    if (!placesLib) return;

    let cancelled = false;
    setLoading(true);

    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
    }

    const request: google.maps.places.AutocompleteRequest = {
      input: debouncedQuery,
      sessionToken: sessionTokenRef.current,
      includedRegionCodes: [...EG_REGION_CODES],
      region: EG_REGION_CODE,
    };
    if (
      originLat !== undefined &&
      originLng !== undefined
    ) {
      request.locationBias = {
        center: { lat: originLat, lng: originLng },
        radius: AUTOCOMPLETE_LOCATION_BIAS_RADIUS_METERS,
      };
      request.origin = { lat: originLat, lng: originLng };
    }

    placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
      .then(({ suggestions: list }) => {
        if (cancelled) return;
        setSuggestions(toRows(list ?? []));
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [placesLib, debouncedQuery, originLat, originLng]);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  const handleSelect = async (row: SuggestionRow) => {
    if (!placesLib) return;
    setOpen(false);
    setQuery(row.label);
    setSuggestions([]);

    try {
      const place = row.placePrediction.toPlace();
      await place.fetchFields({ fields: ["location"] });
      const loc = place.location;
      sessionTokenRef.current = null;
      if (!loc) return;
      onPlaceSelected(loc.lat(), loc.lng());
    } catch {
      sessionTokenRef.current = null;
    }
  };

  return (
    <div
      ref={rootRef}
      className="absolute left-1/2 -translate-x-1/2 top-[72px] z-[1000] w-[90%] max-w-md"
    >
      <input
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={suggestions.length > 0 ? listId : undefined}
        aria-autocomplete="list"
        autoComplete="off"
        className="w-full p-3 rounded-xl border shadow bg-white"
        placeholder={SEARCH_INPUT_PLACEHOLDER}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {(loading || (open && suggestions.length > 0)) && (
        <ul
          id={listId}
          role="listbox"
          className="mt-1 max-h-72 overflow-auto rounded-xl border bg-white shadow-lg"
        >
          {loading && suggestions.length === 0 && (
            <li className="px-3 py-2 text-sm text-neutral-500">Searching…</li>
          )}
          {suggestions.map((row) => (
            <li key={row.key} role="option">
              <button
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-neutral-100 text-sm border-b border-neutral-100 last:border-b-0"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void handleSelect(row)}
              >
                <span className="font-medium text-neutral-900">
                  {row.label}
                </span>
                {row.sublabel && (
                  <span className="block text-neutral-500 text-xs mt-0.5">
                    {row.sublabel}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
