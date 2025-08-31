// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Controller from "./pages/Controller.jsx";
import Display from "./pages/Display.jsx";
import Buzz from "./pages/Buzz.jsx";
import { Container, Nav } from "react-bootstrap";

export default function App() {
  const location = useLocation();
  const isDisplay = location.pathname.startsWith("/display");
  const isBuzz = location.pathname.startsWith("/buzz");

  const routes = (
    <Routes>
      <Route path="/" element={<Navigate to="/display" replace />} />
      <Route path="/controller" element={<Controller />} />
      <Route path="/display" element={<Display />} />
      <Route path="/buzz" element={<Buzz />} />
      <Route path="*" element={<div>Not found</div>} />
    </Routes>
  );

  // Hide Nav/layout on /display and /buzz so it’s truly full-screen
  if (isDisplay||isBuzz) return <>{routes}</>;

  return (
    <>
      {/* Bright top nav */}
      <Nav className="p-2 bg-light border-bottom small" style={{ color: "#0d6efd" }}>
        <Link className="nav-link" to="/controller" style={{ color: "#0d6efd" }}>Controller</Link>
        <Link className="nav-link" to="/display" style={{ color: "#0d6efd" }}>Display</Link>
        <Link className="nav-link" to="/buzz" style={{ color: "#0d6efd" }}>Buzz (players)</Link>
        <span className="ms-auto me-3" style={{ color: "#198754", fontWeight: 600 }}>
          Jesus People Parish Game Show
        </span>
      </Nav>

      <Container fluid className="py-3">
        {routes}
      </Container>
    </>
  );
}
