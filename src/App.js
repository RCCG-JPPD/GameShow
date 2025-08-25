import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Controller from "./pages/Controller.jsx";
import Display from "./pages/Display.jsx";
import Buzz from "./pages/Buzz.jsx";
import { Container, Nav } from "react-bootstrap";

export default function App() {
  return (
    <>
      {true && (<Nav className="p-2 bg-dark text-light small gap-3">
        <Link className="nav-link text-light" to="/controller">Controller</Link>
        <Link className="nav-link text-light" to="/display">Display</Link>
        <Link className="nav-link text-light" to="/buzz">Buzz (players)</Link>
        <span className="ms-auto me-3">Jesus People Parish Game Show</span>
      </Nav>)}
      <Container fluid className="py-3">
        <Routes>
          <Route path="/" element={<Navigate to="/display" replace />} />
          <Route path="/controller" element={<Controller />} />
          <Route path="/display" element={<Display />} />
          <Route path="/buzz" element={<Buzz />} />
          <Route path="*" element={<div>Not found</div>} />
        </Routes>
      </Container>
    </>
  );
}
