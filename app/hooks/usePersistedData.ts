import { useEffect, useState } from "react";
import * as LocalStorage from "../state/LocalStorage";
import { currentUserState } from "../state";
import { useRecoilState } from "recoil";

// Pull data from local persistent storage into state
export default function usePersistedData(): boolean {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

  useEffect(() => {
    if (currentUser.isAuthenticated !== null) {
      setDataLoaded(true);
    }
  }, [currentUser.isAuthenticated]);

  useEffect(() => {
    async function initializeAsync() {
      let persistedData;
      try {
        persistedData = await LocalStorage.loadAsync();
      } catch (e) {
        console.log(e);
      } finally {
        setCurrentUser({
          isAuthenticated: !!persistedData?.credentials?.token,
        });
      }
    }

    initializeAsync();
  }, []);

  return dataLoaded;
}
