import sys, time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


def t(label, fn):
    s = time.time()
    fn()
    print(f"OK {label} ({time.time()-s:.1f}s)", flush=True)


t("engine", lambda: __import__("app.db.engine", fromlist=["x"]))
t("models", lambda: __import__("app.db.models", fromlist=["x"]))
t("retrieval.pipeline", lambda: __import__("app.retrieval.pipeline", fromlist=["x"]))
t("agents.llm", lambda: __import__("app.agents.llm", fromlist=["x"]))
t("agents.specialists", lambda: __import__("app.agents.specialists", fromlist=["x"]))
t(
    "graph.knowledge_graph",
    lambda: __import__("app.graph.knowledge_graph", fromlist=["x"]),
)
t("memory.store", lambda: __import__("app.memory.store", fromlist=["x"]))
t("safety.guardrails", lambda: __import__("app.safety.guardrails", fromlist=["x"]))
t(
    "observability.tracer",
    lambda: __import__("app.observability.tracer", fromlist=["x"]),
)
t("graph.workflow", lambda: __import__("app.graph.workflow", fromlist=["x"]))
t("api.routes", lambda: __import__("app.api.routes", fromlist=["x"]))
t("main", lambda: __import__("app.main", fromlist=["x"]))
print("ALL IMPORTS OK", flush=True)
