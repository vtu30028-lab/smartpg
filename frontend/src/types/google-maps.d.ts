declare namespace google.maps {
  class Map {
    constructor(el: HTMLElement, opts: MapOptions);
    panTo(latLng: LatLngLiteral): void;
    setZoom(zoom: number): void;
  }
  class Marker {
    constructor(opts: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(latLng: LatLngLiteral): void;
    getPosition(): LatLng | null;
    addListener(event: string, handler: () => void): void;
  }
  class InfoWindow {
    setContent(content: string): void;
    open(map?: Map, anchor?: Marker): void;
  }
  class LatLng {
    lat(): number;
    lng(): number;
  }
  interface MapOptions {
    center: LatLngLiteral;
    zoom: number;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
    styles?: object[];
  }
  interface MarkerOptions {
    map?: Map;
    position: LatLngLiteral;
    title?: string;
    zIndex?: number;
    label?: { text: string; color?: string; fontSize?: string; fontWeight?: string };
    icon?: object;
  }
  interface LatLngLiteral {
    lat: number;
    lng: number;
  }
  enum SymbolPath {
    CIRCLE,
    BACKWARD_CLOSED_ARROW,
  }
}

declare namespace google {
  const maps: typeof google.maps;
}

declare const google: typeof google;
