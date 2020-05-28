import { useState, useEffect } from "react";
import { Asset } from "expo-asset";

export default function useAssets(assets: { [key: string]: any }) {
  let [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    async function loadAssetsAsync() {
      try {
        const assetAssetIds = Object.values(assets);
        const assetLoadingPromises = assetAssetIds.map((assetId) =>
          Asset.fromModule(assetId).downloadAsync()
        );

        await Promise.all(assetLoadingPromises);
      } catch (e) {
        console.warn(e);
      } finally {
        setAssetsLoaded(true);
      }
    }

    loadAssetsAsync();
  });

  return assetsLoaded;
}
