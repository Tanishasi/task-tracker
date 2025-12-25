from __future__ import annotations

import json
from dataclasses import dataclass

from .config import settings
from .models import Category, Intent, Severity, Source


@dataclass
class Classification:
    category: Category
    intent: Intent
    severity: Severity
    source: Source


def _fallback_classify(text: str, source: Source | None = None) -> Classification:
    t = text.lower()

    category = Category.note
    if any(k in t for k in ["incident", "outage", "breach", "sev"]):
        category = Category.incident
    elif any(k in t for k in ["error", "fail", "failure", "bug", "issue"]):
        category = Category.issue
    elif any(k in t for k in ["todo", "action", "please", "fix", "call", "email", "ship"]):
        category = Category.task
    elif any(k in t for k in ["log:", "trace", "stack", "timestamp"]):
        category = Category.log
    elif any(k in t for k in ["meeting", "deploy", "release", "event"]):
        category = Category.event

    intent = Intent.unknown
    if "?" in t or any(k in t for k in ["how to", "can we", "what is", "why"]):
        intent = Intent.question
    elif any(k in t for k in ["deadline", "due", "by eod", "by tomorrow", "by "]):
        intent = Intent.deadline
    elif any(k in t for k in ["warn", "warning", "risk", "attention"]):
        intent = Intent.warning
    elif category == Category.task:
        intent = Intent.todo
    else:
        intent = Intent.information

    severity = Severity.unknown
    if any(k in t for k in ["sev1", "p0", "critical", "urgent", "immediately", "outage"]):
        severity = Severity.high
    elif any(k in t for k in ["sev2", "p1", "major", "asap"]):
        severity = Severity.medium
    elif any(k in t for k in ["minor", "low", "nice to have"]):
        severity = Severity.low

    resolved_source = source or Source.unknown

    return Classification(
        category=category,
        intent=intent,
        severity=severity,
        source=resolved_source,
    )


def classify_input(text: str, source: Source | None = None) -> Classification:
    if not settings.openai_api_key:
        return _fallback_classify(text=text, source=source)

    try:
        from openai import OpenAI

        client = OpenAI(api_key=settings.openai_api_key)

        system = (
            "You classify unstructured operational inputs into structured fields. "
            "Return ONLY valid JSON (no markdown) with keys: "
            "category, intent, severity, source. "
            "Allowed category: issue,event,log,task,incident,note. "
            "Allowed intent: todo,warning,deadline,information,question,unknown. "
            "Allowed severity: low,medium,high,unknown. "
            "Allowed source: human,machine,vendor,unknown. "
        )

        user = {"text": text, "source_hint": (source.value if source else None)}

        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": json.dumps(user)},
            ],
            temperature=0,
        )

        content = resp.choices[0].message.content or "{}"
        data = json.loads(content)

        return Classification(
            category=Category(data.get("category", Category.note.value)),
            intent=Intent(data.get("intent", Intent.unknown.value)),
            severity=Severity(data.get("severity", Severity.unknown.value)),
            source=Source(data.get("source", (source.value if source else Source.unknown.value))),
        )
    except Exception:
        return _fallback_classify(text=text, source=source)
