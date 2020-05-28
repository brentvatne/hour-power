import { useEffect, useState } from "react";
import * as LocalStorage from "../state/LocalStorage";
import { PersistedData } from "../types";

// Pull data from local persistent storage into state
export default function usePersistedData(): [boolean, null | PersistedData] {
  const [data, setData] = useState<null | PersistedData>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    async function initializeAsync() {
      try {
        const persistedData = await LocalStorage.loadAsync();
        setData(persistedData);
      } catch (e) {
        console.log(e);
      } finally {
        setDataLoaded(true);
      }
    }

    initializeAsync();
  }, []);

  return [dataLoaded, data];
}
