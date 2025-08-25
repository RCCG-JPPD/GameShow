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

  return (
    <div className="board-grid fade-in">
      {categories.map(([cid,c])=>(
        <div key={cid} className="board-col">
          <div className="board-col-title">{c.name}</div>
          {(byCat[cid]||[]).map(q=>(
            <div key={q.id} className="board-tile">{q.points}</div>
          ))}
          {(!byCat[cid] || byCat[cid].length===0) && <div className="board-empty">—</div>}
        </div>
      ))}
    </div>
  );
}
