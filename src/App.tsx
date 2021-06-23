import * as tt from "@tomtom-international/web-sdk-maps";
import { useEffect, useRef, useState } from "react";

interface Props {
}

const App: React.FC<Props> = () => {
  const mapElement: any = useRef()
  const [map, setMap] = useState({})

useEffect(() => {
 let map = tt.map({
  key: 'bJ07pLsJ2koMcN1GDHUu1hfSmGmg2dkE',
  container: mapElement.current,
});

setMap(map)
}, [])

  return <div className="App">
    <div ref={mapElement}></div>
  </div>;
};

export default App;
