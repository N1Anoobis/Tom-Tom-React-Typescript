import * as tt from "@tomtom-international/web-sdk-maps";
import * as ttapi from "@tomtom-international/web-sdk-services";
import { useEffect, useRef, useState } from "react";
import "@tomtom-international/web-sdk-maps/dist/maps.css";

import styles from "./App.module.css";
import { FeatureCollection, LineString, MultiLineString } from "geojson";

interface Props {}

interface PopupI {
  [key: string]: tt.PointLike;
}

const App: React.FC<Props> = () => {
  const mapElement: any = useRef();
  const [map, setMap] = useState({});
  const [longitude, setLongitude] = useState(100.5018);
  const [latitude, setLatitude] = useState(13.7563);
  const [timeToDestination, setTimeToDestination] = useState('');

  const convertToPoints = (lngLat: { lat: any; lng: any }) => {
    return {
      point: {
        latitude: lngLat.lat,
        longitude: lngLat.lng,
      },
    };
  };

  const drawRoute = (
    geoJson: FeatureCollection<
      LineString | MultiLineString,
      ttapi.GeoJsonRouteProperties
    >,
    map: tt.Map
  ) => {
    if (map.getLayer("route")) {
      map.removeLayer("route");
      map.removeSource("route");
    }
    map.addLayer({
      id: "route",
      type: "line",
      source: {
        type: "geojson",
        data: geoJson,
      },
      paint: {
        "line-color": "red",
        "line-width": 6,
      },
    });
  };

  const addDeliveryMarker = (lngLat: tt.LngLatLike, map: tt.Map) => {
    const element = document.createElement("div");
    element.className = styles.markerDelivery;
    new tt.Marker({
      element: element,
    })
      .setLngLat(lngLat)
      .addTo(map);
  };

  useEffect(() => {
    const origin = {
      lng: longitude,
      lat: latitude,
    };
    const destinations: any[] = [];

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
      const popupOffset: PopupI = { bottom: [0, -25] };
      const popup = new tt.Popup({
        offset: popupOffset,
      }).setHTML("This is you!");

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
      marker.setPopup(popup).togglePopup();
    };
    addMarker();

    const sortDestinations = (locations: any[] | any) => {
      const pointsForDestinations = locations.map(
        (destination: { lat: any; lng: any }) => {
          return convertToPoints(destination);
        }
      );
      const callParameters = {
        key: "bJ07pLsJ2koMcN1GDHUu1hfSmGmg2dkE",
        destinations: pointsForDestinations,
        origins: [convertToPoints(origin)],
      };

      return new Promise<ttapi.CalculateRouteResponse | any>(
        (resolve, reject) => {
          ttapi.services
            .matrixRouting(callParameters)
            .then((matrixAPIResults) => {
              const results = matrixAPIResults.matrix[0];
              const resultsArray = results.map(
                (
                  result: {
                    response: { routeSummary: { travelTimeInSeconds: any } };
                  },
                  index: number
                ) => {
                  return {
                    location: locations[index],
                    drivingtime:
                      result.response.routeSummary.travelTimeInSeconds,
                  };
                }
              );
              const SECONDS = resultsArray[resultsArray.length - 1].drivingtime;
              setTimeToDestination(
                new Date(SECONDS * 1000).toISOString().substr(11, 8)
              );

              resultsArray.sort(
                (a: { drivingtime: number }, b: { drivingtime: number }) => {
                  return a.drivingtime - b.drivingtime;
                }
              );
              const sortedLocations = resultsArray.map(
                (result: { location: any }) => {
                  return result.location;
                }
              );
              resolve(sortedLocations);
            });
        }
      );
    };

    const recalculateRoutes = () => {
      sortDestinations(destinations).then((sorted) => {
        sorted.unshift(origin);
        ttapi.services
          .calculateRoute({
            key: "bJ07pLsJ2koMcN1GDHUu1hfSmGmg2dkE",
            locations: sorted,
          })
          .then((routeData) => {
            const geoJson = routeData.toGeoJson();
            drawRoute(geoJson, map);
          });
      });
    };

    map.on("click", (e) => {
      destinations.push(e.lngLat);
      addDeliveryMarker(e.lngLat, map);
      recalculateRoutes();
    });

    return () => map.remove();
  }, [longitude, latitude]);

  return (
    <>
      <h1>time to destination: {timeToDestination}</h1>
      {map && (
        <div className={styles.app}>
          <div ref={mapElement} className={styles.map}></div>
          <div className={styles.search}>
            <h1>Where to?</h1>
            <input
              type="number"
              id="longitude"
              className="longitude"
              placeholder="Put in Longitude"
              onChange={(e) => {
                setLongitude(Number(e.target.value));
              }}
            />
            <input
              type="number"
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
