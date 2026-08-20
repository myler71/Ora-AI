"""Local knowledge-graph adapter (NetworkX).

A minimal, meaningful dental graph built from the relational data. PostgreSQL
remains the transactional source of truth; this graph only models relationships
for retrieval. A Neo4j adapter can replace `KnowledgeGraph` behind the same
interface when a graph database is justified.
"""

from __future__ import annotations

import networkx as nx
from sqlalchemy.orm import Session

from app.db.models import Allergy, Medication, Patient, Tooth, ToothEvent


class KnowledgeGraph:
    def __init__(self) -> None:
        self.g = nx.DiGraph()

    def add(self, src: str, rel: str, dst: str) -> None:
        self.g.add_edge(src, dst, relation=rel)

    def neighbors(self, node: str) -> list[dict]:
        out = []
        for _, dst, data in self.g.out_edges(node, data=True):
            out.append({"relation": data.get("relation"), "target": dst})
        for src, _, data in self.g.in_edges(node, data=True):
            out.append({"relation": data.get("relation"), "source": src})
        return out

    def relationships_for_patient(self, patient_id: int) -> list[dict]:
        node = f"patient:{patient_id}"
        return self.neighbors(node)

    def to_dict(self) -> dict:
        return {
            "nodes": list(self.g.nodes),
            "edges": [
                {"source": u, "target": v, "relation": d.get("relation")}
                for u, v, d in self.g.edges(data=True)
            ],
        }


def build_graph(session: Session) -> KnowledgeGraph:
    kg = KnowledgeGraph()

    for p in session.query(Patient).all():
        pnode = f"patient:{p.id}"
        kg.add(pnode, "IS", f"person:{p.first_name} {p.last_name}")

    for a in session.query(Allergy).all():
        kg.add(f"patient:{a.patient_id}", "ALLERGIC_TO", f"allergen:{a.allergen}")

    for m in session.query(Medication).all():
        kg.add(f"patient:{m.patient_id}", "TAKES", f"medication:{m.name}")
        if m.indication:
            kg.add(f"medication:{m.name}", "TREATS", f"condition:{m.indication}")

    for t in session.query(Tooth).all():
        kg.add(f"patient:{t.patient_id}", "HAS_TOOTH", f"tooth:{t.tooth_number}")
        if t.status not in ("present",):
            kg.add(f"tooth:{t.tooth_number}", "STATUS", f"status:{t.status}")

    for e in session.query(ToothEvent).all():
        if e.tooth_id:
            tooth = session.get(Tooth, e.tooth_id)
            if tooth:
                kg.add(
                    f"patient:{e.patient_id}",
                    "HAS_TOOTH_EVENT",
                    f"event:{e.event_type}:tooth{tooth.tooth_number}",
                )

    # Static clinical relationships (medication safety) from the knowledge base.
    kg.add("medication:Apixaban", "INTERACTS_WITH", "procedure:extraction")
    kg.add("medication:Alendronate", "CONTRAINDICATED_IN", "condition:MRONJ risk")
    kg.add("procedure:root canal", "REQUIRES", "material:gutta-percha points")
    kg.add("procedure:root canal", "REQUIRES", "material:sodium hypochlorite")
    kg.add("procedure:composite restoration", "REQUIRES", "material:resin composite")
    kg.add(
        "procedure:composite restoration",
        "REQUIRES",
        "material:composite bond (adhesive)",
    )

    return kg
