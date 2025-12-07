import React from "react";

export default function RestaurantList({
  items = [],
  onSelect,
  style,
  showSearch,
  onSearch,
  userRedemptions = {},
  onRedeem,
}) {
  
  const renderStars = (deal) => {
    const maxUses = deal.numUses;
    const currentUses = userRedemptions[deal.id] || 0;

    if (maxUses === null || maxUses === -1) {
      return (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onRedeem?.(deal.id);
          }}
          style={{ 
            fontSize: 12, 
            color: "#ef4444", 
            fontWeight: "bold", 
            cursor: "pointer",
            display: "inline-block",
            padding: "4px 0",
          }}
        >
          <span style={{ fontSize: 20, verticalAlign: "middle", marginRight: 4 }}>★</span> 
          Unlimited (Tap to redeem)
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
            if (!isRedeemed) onRedeem?.(deal.id);
          }}
          style={{
            cursor: isRedeemed ? "default" : "pointer",
            fontSize: 20,
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
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: 12, marginRight: 6, color: "#666" }}>Uses:</span>
        {stars}
      </div>
    );
  };

  return (
    <div style={{ width: 320, maxWidth: 920, margin: "0 auto", ...style }}>
      <h2 style={{ marginTop: 0 }}>Restaurants</h2>
      {showSearch && (
        <input
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder="Search restaurants or deals"
          style={{
            width: "100%",
            padding: "8px 10px",
            marginBottom: 12,
            borderRadius: 6,
            border: "1px solid #ddd",
            boxSizing: "border-box",
          }}
        />
      )}
      <div
        style={{
          maxHeight: "72vh",
          overflowY: "auto",
          border: "1px solid #eee",
          borderRadius: 8,
          background: "#fff",
        }}
      >
        <ul style={{ padding: 0, listStyle: "none", margin: 0 }}>
          {items.map((r) => (
            <li
              key={r.id}
              style={{
                padding: 12,
                borderBottom: "1px solid #f1f1f1",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 4
              }}
              onClick={() => onSelect?.(r)}
            >
              <div style={{ fontWeight: 600, fontSize: 16 }}>{r.name}</div>
              <div style={{ fontSize: 13, color: "#666" }}>{r.deal}</div>
              
              <div style={{ marginTop: 4 }}>
                {renderStars(r)}
              </div>
            </li>
          ))}
          {items.length === 0 && (
            <li style={{ padding: 12, color: "#666" }}>No restaurants yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}