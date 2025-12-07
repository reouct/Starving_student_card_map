import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const PROVO_CENTER = [40.2338, -111.659];

// Component to handle map movement
function Recenter({ selectedItem }) {
  const map = useMap();

  useEffect(() => {
    if (selectedItem && selectedItem.locations && selectedItem.locations.length > 0) {
      const loc = selectedItem.locations[0];
      // Move map to the first location of the selected deal
      map.flyTo([loc.lat, loc.long], 14, {
        duration: 1.5
      });
    }
  }, [selectedItem, map]);

  return null;
}

export default function MapView({
  children,
  markers = [],
  onMarkerClick,
  selectedItem,
  height = "70vh",
  userRedemptions = {},
  onRedeem,
}) {
  const markerRefs = useRef({});

  // Effect to open popup when selectedItem changes
  useEffect(() => {
    if (selectedItem && selectedItem.id) {
      // Find the first marker that matches the selected deal ID
      const match = markers.find((m) => m.id === selectedItem.id);
      if (match) {
        const markerInstance = markerRefs.current[match.markerId];
        if (markerInstance) {
          markerInstance.openPopup();
        }
      }
    }
  }, [selectedItem, markers]);

  const renderStars = (item) => {
    const maxUses = item.numUses;
    const currentUses = userRedemptions[item.id] || 0;

    if (maxUses === null || maxUses === -1) {
      return (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onRedeem?.(item.id);
          }}
          style={{ 
            fontSize: 12, 
            color: "#ef4444", 
            fontWeight: "bold", 
            cursor: "pointer",
            display: "inline-block",
            padding: "2px 0",
          }}
        >
          <span style={{ fontSize: 18, verticalAlign: "middle", marginRight: 4 }}>★</span> 
          Unlimited
        </div>
      );
    }

    const stars = [];
    for (let i = 0; i < maxUses; i++) {
      const isRedeemed = i < currentUses;
      stars.push(
        <span
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            if (!isRedeemed) onRedeem?.(item.id);
          }}
          style={{
            cursor: isRedeemed ? "default" : "pointer",
            fontSize: 18,
            color: isRedeemed ? "#ef4444" : "#e5e7eb",
            marginRight: 2,
            lineHeight: 1,
            transition: "color 0.2s"
          }}
        >
          ★
        </span>
      );
    }
    
    return (
      <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
        <span style={{ fontSize: 12, marginRight: 6, color: "#666" }}>Uses:</span>
        {stars}
      </div>
    );
  };

  return (
    <div
      style={{ flex: 1, borderRadius: 8, overflow: "hidden", minHeight: 200 }}
    >
      <MapContainer
        center={PROVO_CENTER}
        zoom={10}
        style={{ height: height, width: "100%" }}
      >
        <Recenter selectedItem={selectedItem} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => {
          const isSelected = selectedItem?.id === m.id;
          return (
            <CircleMarker
              key={m.markerId}
              ref={(el) => (markerRefs.current[m.markerId] = el)}
              center={m.latlng}
              radius={8}
              pathOptions={{
                color: isSelected ? "#2f6fed" : "#ff5722", // Blue if selected, Orange otherwise
                fillColor: isSelected ? "#3b82f6" : "#ff9800",
                fillOpacity: 0.9,
              }}
              eventHandlers={{
                click: () => onMarkerClick?.(m),
              }}
            >
              <Popup>
                <strong>{m.name}</strong>
                
                {/* Clickable Address Link */}
                {m.address && (
                  <div style={{ fontSize: 12, margin: "4px 0" }}>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.address)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: "#3b82f6", textDecoration: "none" }}
                    >
                      📍 {m.address}
                    </a>
                  </div>
                )}

                {renderStars(m)}
                <div style={{ fontSize: 12, marginTop: 4, fontStyle: "italic" }}>{m.deal}</div>
              </Popup>
            </CircleMarker>
          );
        })}
        {children}
      </MapContainer>
    </div>
  );
}