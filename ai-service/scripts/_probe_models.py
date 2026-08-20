import os
from dotenv import load_dotenv

load_dotenv()
from groq import Groq

c = Groq(api_key=os.getenv("GROQ_API_KEY"))
candidates = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.6-27b",
    "groq/compound-mini",
]
for model in candidates:
    try:
        r = c.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": 'Reply with JSON {"answer":"ok"}'}],
            response_format={"type": "json_object"},
            max_tokens=50,
        )
        print("OK", model, "->", r.choices[0].message.content[:60])
    except Exception as e:
        print("FAIL", model, "->", str(e)[:120])
