import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// const UTAH_CENTER = [39.32, -111.0937];
const PROVO_CENTER = [40.2338, -111.659];

export default function MapView({
  children,
  markers = [],
  onMarkerClick,
  height = "70vh",
  userRedemptions = {},
  onRedeem,
}) {

    const maxUses = item.numUses;
    const currentUses = userRedemptions[item.id] || 0;

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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <CircleMarker
            key={m.markerId}
            center={m.latlng}
            radius={8}
            pathOptions={{
              color: "#ff5722",
              fillColor: "#ff9800",
              fillOpacity: 0.9,
            }}
            eventHandlers={{
              click: () => onMarkerClick?.(m),
            }}
          >
            <Popup>
              <strong>{m.name}</strong>
              {renderStars(m)}
              <div style={{ fontSize: 12, marginTop: 4 }}>{m.deal}</div>
            </Popup>
          </CircleMarker>
        ))}
        {children}
      </MapContainer>
    </div>
  );
}
