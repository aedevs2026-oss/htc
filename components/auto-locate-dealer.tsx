"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LocateFixed, MapPin, Navigation, RefreshCw, Search, ShieldCheck } from "lucide-react";

type PositionState = { status: "checking" | "found" | "denied" | "unsupported" | "error"; lat?: number; lon?: number; message?: string };
export function AutoLocateDealer() {
  const [position, setPosition] = useState<PositionState>({ status: "checking" });
  const [place, setPlace] = useState("");
  const [manualSearch, setManualSearch] = useState(false);
  const locate = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) { setPosition({ status: "unsupported", message: "Location is not supported in this browser. Search by city or PIN code instead." }); return; }
    setPosition({ status: "checking" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setPosition({ status: "found", lat: coords.latitude, lon: coords.longitude }),
      (error) => setPosition({ status: error.code === error.PERMISSION_DENIED ? "denied" : "error", message: error.code === error.PERMISSION_DENIED ? "Location access was declined. You can still search by city or PIN code." : "We couldn't detect your location. Check browser permissions or search by city or PIN code." }),
      { enableHighAccuracy: false, timeout: 9000, maximumAge: 300000 }
    );
  };
  useEffect(() => { locate(); }, []);
  const mapUrl = position.status === "found" ? `https://www.google.com/maps/search/HTC+Furniture+dealer/@${position.lat},${position.lon},12z` : `https://www.google.com/maps/search/HTC+Furniture+dealer+${encodeURIComponent(place.trim() || "near me")}/`;
  const manualUrl = `https://www.google.com/maps/search/HTC+Furniture+dealer+${encodeURIComponent(place.trim())}/`;
  return <section className="auto-locate-card" aria-live="polite">
    <div className="auto-locate-icon"><LocateFixed size={23}/></div>
    <div className="auto-locate-copy">
      <p className="eyebrow">Personalised showroom search</p>
      <h3>{position.status === "found" ? "Your location is ready." : position.status === "checking" ? "Finding your nearest dealer…" : "Find a dealer close to you."}</h3>
      <p>{position.status === "found" ? "We can open a map centred on your current location. Your exact coordinates stay in this browser and are used only for this search." : position.message || "Allow location access to discover nearby HTC dealer options, or search by city or PIN code."}</p>
      <div className="dealer-location-input-row">
        <MapPin size={17}/><label className="sr-only" htmlFor="dealer-location-input">City or PIN code</label>
        <input id="dealer-location-input" value={place} onChange={(event) => setPlace(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && place.trim()) window.open(manualUrl, "_blank", "noopener,noreferrer"); }} placeholder="Enter your city or PIN code" />
        <Link className="dealer-location-search" href={manualUrl} target="_blank" rel="noreferrer" aria-label="Search dealers by city or PIN code"><Search size={16}/><span>Search</span></Link>
      </div>
      <div className="auto-locate-actions">
        <button type="button" className="button button-dark" onClick={locate}><Navigation size={15}/> {position.status === "found" ? "Refresh my location" : "Use my current location"}</button>
        {position.status === "found" && <Link href={mapUrl} target="_blank" rel="noreferrer" className="auto-locate-secondary">View nearby dealers <Navigation size={14}/></Link>}
        {position.status !== "found" && <span className="location-privacy"><ShieldCheck size={13}/> Only used for this search</span>}
      </div>
    </div>
    <span className={`auto-locate-status ${position.status === "found" ? "is-ready" : ""}`}><MapPin size={13}/>{position.status === "found" ? "Location ready" : position.status === "checking" ? "Locating" : "Manual search available"}</span>
  </section>;
}
