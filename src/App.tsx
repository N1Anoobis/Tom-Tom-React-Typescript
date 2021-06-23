import * as tt from "@tomtom-international/web-sdk-maps";
import { useEffect, useRef, useState } from "react";
import "@tomtom-international/web-sdk-maps/dist/maps.css";

import styles from "./App.module.css";

interface Props {}

const App: React.FC<Props> = () => {
  const mapElement: any = useRef();
  const [map, setMap] = useState({});
  const [longitude, setLongitude] = useState(100.5018);
  const [latitude, setLatitude] = useState(13.7563);

  useEffect(() => {
    let map = tt.map({
      key: "bJ07pLsJ2koMcN1GDHUu1hfSmGmg2dkE",
      container: mapElement.current,
      stylesVisibility: {
        trafficIncidents: true,
        trafficFlow: true,
      },
      center: [longitude, latitude],
      zoom: 14,
    });

    setMap(map);

    const addMarker = () => {
      const element = document.createElement("div");
      element.className = styles.marker;

      const marker = new tt.Marker({
        draggable: true,
        element: element,
      })
        .setLngLat([longitude, latitude])
        .addTo(map);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        setLongitude(lngLat.lng);
        setLatitude(lngLat.lat);
      });
    };
    addMarker();

    return () => map.remove();
  }, [longitude, latitude]);

  return (
    <>
      {map && (
        <div className={styles.app}>
          <div ref={mapElement} className={styles.map}></div>
          <div className={styles.search}>
            <h1>Where to?</h1>
            <input
              type="text"
              id="longitude"
              className="longitude"
              placeholder="Put in Longitude"
              onChange={(e) => {
                setLongitude(Number(e.target.value));
              }}
            />
            <input
              type="text"
              id="latitude"
              className="latitude"
              placeholder="Put in Latitude"
              onChange={(e) => {
                setLatitude(Number(e.target.value));
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default App;
