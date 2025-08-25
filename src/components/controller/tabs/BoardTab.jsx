import React, { useMemo } from "react";
import { Row, Col, Card } from "react-bootstrap";
import NextPickerBadge from "../../shared/NextPickerBadge.jsx";
import { selectTile } from "../../../rtdb/actions.js";
import { MAX_CATEGORIES, MAX_QUESTIONS_PER_CATEGORY } from "../../../utils/constants.js";

export default function BoardTab({ meta, cats, qs }) {
  const order = meta?.turn?.order || [];
  const index = meta?.turn?.index || 0;

  const categories = useMemo(
    () =>
      Object.entries(cats || {})
        .sort((a, b) => (a[1].order ?? 0) - (b[1].order ?? 0))
        .slice(0, MAX_CATEGORIES),
    [cats]
  );

  const byCat = useMemo(() => {
    const map = {};
    Object.entries(qs || {}).forEach(([id, q]) => {
      if (!map[q.categoryId]) map[q.categoryId] = [];
      map[q.categoryId].push({ id, ...q });
    });
    Object.keys(map).forEach((cid) => {
      map[cid] = map[cid]
        .filter((q) => !q.used)
        .sort((a, b) => {
          if (a.points !== b.points) return a.points - b.points;
          return (a.createdAt ?? 0) - (b.createdAt ?? 0);
        })
        .slice(0, MAX_QUESTIONS_PER_CATEGORY);
    });
    return map;
  }, [qs]);

  const selectingTeam = order.length ? order[index] : null;

  const handleSelect = (cid, qid) => {
    const firstAttemptSec = meta?.timers?.firstAttemptSec ?? 35;
    selectTile({ categoryId: cid, questionId: qid, selectingTeam, firstAttemptSec });
  };

  return (
    <div className="p-2">
      <NextPickerBadge order={order} index={index} />
      <Row className="g-3">
        {categories.map(([cid, c]) => {
          const tiles = byCat[cid] || [];
          const mdCols = Math.max(3, Math.floor(12 / Math.min(categories.length, 4)));
          const lgCols = Math.max(2, Math.floor(12 / Math.min(categories.length, 6)));
          return (
            <Col key={cid} xs={12} md={mdCols} lg={lgCols}>
              <Card className="h-100">
                <Card.Header className="fw-bold text-center">{c.name}</Card.Header>
                <Card.Body className="d-grid gap-2">
                  {tiles.map((q) => (
                    <button
                      key={q.id}
                      className="btn btn-outline-primary tile-btn"
                      onClick={() => handleSelect(cid, q.id)}
                    >
                      {q.points}
                    </button>
                  ))}
                  {tiles.length === 0 && (
                    <div className="text-muted small text-center">No unused questions</div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
