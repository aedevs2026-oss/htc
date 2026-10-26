"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LocateFixed, MapPin, Navigation, Search, ShieldCheck, X } from "lucide-react";

type LocationResult = { lat: number; lon: number } | null;

export function DealerLocationPrompt() {
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [location, setLocation] = useState<LocationResult>(null);
  const [message, setMessage] = useState("Allow location access to see dealer search results near you, or search by city or PIN code.");
  const [place, setPlace] = useState("");

  useEffect(() => {
    let alive = true;
    const dismissed = window.sessionStorage.getItem("htc-dealer-location-prompt-dismissed");
    if (dismissed) { setChecking(false); return; }
    setOpen(true);
    if (!navigator.geolocation) {
      setChecking(false);
      setMessage("Location is not supported in this browser. Search by city or PIN code instead.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { if (!alive) return; setLocation({ lat: coords.latitude, lon: coords.longitude }); setChecking(false); setMessage("We found your location. Open the map to explore HTC dealer options nearby."); },
      (error) => { if (!alive) return; setChecking(false); setMessage(error.code === error.PERMISSION_DENIED ? "Location permission was declined. You can still search by city or PIN code." : "We couldn't detect your location. Try again or search by city or PIN code."); },
      { enableHighAccuracy: false, timeout: 9000, maximumAge: 300000 }
    );
    return () => { alive = false; };
  }, []);

  const close = () => { setOpen(false); window.sessionStorage.setItem("htc-dealer-location-prompt-dismissed", "1"); };
  const mapUrl = location
    ? `https://www.google.com/maps/search/HTC+Furniture+dealer/@${location.lat},${location.lon},12z`
    : `https://www.google.com/maps/search/HTC+Furniture+dealer+${encodeURIComponent(place.trim() || "near me")}/`;
  const searchUrl = `https://www.google.com/maps/search/HTC+Furniture+dealer+${encodeURIComponent(place.trim())}/`;

  if (!open) return null;
  return <div className="dealer-location-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <section className="dealer-location-modal" role="dialog" aria-modal="true" aria-labelledby="dealer-location-title">
      <button className="dealer-location-close" type="button" onClick={close} aria-label="Close dealer finder"><X size={18}/></button>
      <div className="dealer-location-modal-icon"><LocateFixed size={24}/></div>
      <p className="eyebrow">A showroom close to you</p>
      <h2 id="dealer-location-title">Find your nearest HTC dealer.</h2>
      <p className="dealer-location-message" aria-live="polite">{checking ? "Checking your location… Your browser may ask for permission." : message}</p>
      {location && <div className="dealer-location-found"><MapPin size={16}/> Location detected successfully</div>}
      <Link href={mapUrl} target="_blank" rel="noreferrer" className="button button-dark dealer-location-primary"><Navigation size={16}/>{location ? "View nearby dealers" : "Search dealers on map"}</Link>
      <div className="dealer-location-or"><span/>or<span/></div>
      <form className="dealer-location-form" onSubmit={(event) => { event.preventDefault(); if (place.trim()) window.open(searchUrl, "_blank", "noopener,noreferrer"); }}>
        <MapPin size={16}/><label className="sr-only" htmlFor="dealer-modal-place">City or PIN code</label><input id="dealer-modal-place" value={place} onChange={(event) => setPlace(event.target.value)} placeholder="Enter city or PIN code"/><button type="submit" aria-label="Search city or PIN code" disabled={!place.trim()}><Search size={17}/></button>
      </form>
      <p className="dealer-location-privacy"><ShieldCheck size={13}/> Location is used only to centre your dealer search.</p>
      <button className="dealer-location-skip" type="button" onClick={close}>Maybe later</button>
    </section>
  </div>;
}
