// src/components/display/BoardView.jsx
import React, { useMemo } from "react";

export default function BoardView({ cats, qs }) {
  const categories = useMemo(
    () => Object.entries(cats||{}).sort((a,b)=>(a[1].order??0)-(b[1].order??0)).slice(0,8),
    [cats]
  );
  const byCat = useMemo(()=>{
    const m={};
    Object.entries(qs||{}).forEach(([id,q])=>{
      if(!m[q.categoryId]) m[q.categoryId]=[];
      m[q.categoryId].push({id,...q});
    });
    Object.keys(m).forEach(cid=>{
      m[cid]=m[cid].filter(x=>!x.used).sort((a,b)=> a.points!==b.points ? a.points-b.points : (a.createdAt??0)-(b.createdAt??0)).slice(0,6);
    });
    return m;
  },[qs]);

  const grid = { display:"grid", gridTemplateColumns: `repeat(${Math.max(1, categories.length)}, 1fr)`, gap:"0.75rem", padding:"1rem", minHeight:"100vh", background:"#fff", color:"#111" };
  const colStyle = { padding: "0.5rem" };
  const titleStyle = { fontSize: "clamp(14px, 1.6vw, 22px)", fontWeight: 800, marginBottom: "0.5rem", textAlign: "center", color:"#0d6efd" };
  const tileStyle = { display:"flex", alignItems:"center", justifyContent:"center", background:"var(--tile-bg)", border:`2px solid var(--tile-border)`, borderRadius: "12px", minHeight:"8rem", fontSize:"clamp(22px, 3vw, 44px)", marginBottom:"0.5rem", color:"#0d6efd", fontWeight: 800 };
  const emptyStyle = { ...tileStyle, opacity: 0.4, color:"#6c757d" };

  return (
    <div className="board-grid fade-in" style={grid}>
      {categories.map(([cid,c])=>(
        <div key={cid} className="board-col" style={colStyle}>
          <div className="board-col-title" style={titleStyle}>{c.name}</div>
          {(byCat[cid]||[]).map(q=>(
            <div key={q.id} className="board-tile" style={tileStyle}>{q.points}</div>
          ))}
          {(!byCat[cid] || byCat[cid].length===0) && <div className="board-empty" style={emptyStyle}>—</div>}
        </div>
      ))}
    </div>
  );
}
