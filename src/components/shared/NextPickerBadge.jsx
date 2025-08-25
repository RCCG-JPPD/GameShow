import React from "react";
import { Badge } from "react-bootstrap";

export default function NextPickerBadge({ order = [], index = 0 }) {
  if (!order.length) return null;
  const next = order[index];
  return (
    <div className="mb-2">
      Next picker: <Badge bg="light" text="dark" style={{ backgroundColor: next, color: "white" }}>{next}</Badge>
    </div>
  );
}
