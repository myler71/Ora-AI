import os
from dotenv import load_dotenv

load_dotenv()
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field


class Analysis(BaseModel):
    summary: str = Field(default="")
    findings: list[str] = Field(default_factory=list)


llm = ChatGroq(
    model=os.getenv("GROQ_MODEL"),
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.1,
).with_structured_output(Analysis)
prompt = ChatPromptTemplate.from_messages(
    [("system", "You are a dental analyst. Return JSON."), ("human", "{q}")]
)
chain = prompt | llm
out = chain.invoke(
    {"q": "Summarize: patient has caries on tooth 27. List one finding."}
)
print("TYPE:", type(out).__name__)
print("summary:", out.summary[:120])
print("findings:", out.findings)
