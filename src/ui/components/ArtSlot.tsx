import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { UI_ASSETS, type UIAssetKey, type UIAssetFit } from "../assets/uiAssets";

type ArtSlotProps = {
  assetKey: UIAssetKey;
  className?: string;
  alt?: string;
  fit?: UIAssetFit;
  radius?: number | string;
};

const ArtSlot = ({ assetKey, className = "", alt = "", fit, radius }: ArtSlotProps) => {
  const asset = UI_ASSETS[assetKey];
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    if (asset.type !== "bg") {
      return undefined;
    }
    const probe = new Image();
    probe.src = asset.path;
    probe.onload = () => setHasError(false);
    probe.onerror = () => setHasError(true);
    return () => {
      probe.onload = null;
      probe.onerror = null;
    };
  }, [asset.path, asset.type]);

  const resolvedFit = fit ?? asset.fit;
  const radiusValue = useMemo(() => {
    if (radius === undefined) return undefined;
    return typeof radius === "number" ? `${radius}px` : radius;
  }, [radius]);

  const sharedStyle: CSSProperties = {
    aspectRatio: asset.aspect,
    borderRadius: radiusValue,
  };

  if (asset.type === "img" && !hasError) {
    return (
      <img
        className={`art-slot art-img ${className}`.trim()}
        src={asset.path}
        alt={alt}
        draggable={false}
        onError={() => setHasError(true)}
        style={{
          ...sharedStyle,
          objectFit: resolvedFit,
        }}
      />
    );
  }

  const fallbackClass = hasError && asset.fallback === "gradient" ? "art-fallback" : "";

  return (
    <div
      className={`art-slot ${asset.type === "img" ? "art-img" : "art-bg"} ${fallbackClass} ${className}`.trim()}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      style={{
        ...sharedStyle,
        backgroundImage: !hasError && asset.type === "bg" ? `url(${asset.path})` : undefined,
        backgroundSize: resolvedFit,
      }}
    />
  );
};

export default ArtSlot;
