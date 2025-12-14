# src/features.py

"""
Enhanced feature builder for LearnPathAI (lightweight NLP).
- Extracts skills from free-text using a predefined skill vocabulary.
- Normalizes career aspiration to canonical roles.
- Produces ML-ready numeric features:
    avg_score, experience_level, skill_count,
    market_demand, skill_coverage_ratio, missing_skills_count

Notes:
- This is intentionally lightweight (no heavy transformer libraries).
- At the end of the file there's guidance (commented) showing how to
  replace the simple embeddings with sentence-transformers later.
"""

from typing import Dict, List, Tuple
import re

# -------------------------
# Config / Small knowledge base
# -------------------------
# canonical roles -> market demand (dummy)
CAREER_DEMAND_MAP = {
    "data analyst": 0.9,
    "data scientist": 0.95,
    "machine learning engineer": 0.95,
    "software developer": 0.85,
    "web developer": 0.75,
    "cyber security": 0.88,
    "ui/ux designer": 0.7,
    "devops engineer": 0.86,
}

# A small canonical skill vocabulary (expand later)
SKILL_VOCAB = [
    "python", "pandas", "numpy", "sql", "excel", "tableau", "power bi",
    "machine learning", "deep learning", "tensorflow", "pytorch",
    "data analysis", "statistics", "probability", "linux",
    "git", "html", "css", "javascript", "react", "node",
    "c++", "java", "c", "docker", "kubernetes", "nlp",
    "computer vision", "aws", "azure", "gcp", "matplotlib", "seaborn"
]

# role -> required skill list (example mappings; expand later)
ROLE_REQUIRED_SKILLS = {
    "data analyst": ["excel", "sql", "python", "pandas", "tableau"],
    "data scientist": ["python", "pandas", "numpy", "statistics", "machine learning"],
    "machine learning engineer": ["python", "tensorflow", "pytorch", "machine learning", "docker"],
    "software developer": ["git", "java", "c++", "html", "css", "javascript"],
    "web developer": ["html", "css", "javascript", "react", "node"],
    "devops engineer": ["linux", "docker", "kubernetes", "aws"],
    "cyber security": ["linux", "networking", "python"],
    "ui/ux designer": ["ui/ux", "figma", "html", "css"]
}

# -------------------------
# Helpers
# -------------------------
def normalize(value: float, min_val: float, max_val: float) -> float:
    """Clamp & scale to 0..1."""
    try:
        v = float(value)
    except Exception:
        v = 0.0
    if max_val - min_val == 0:
        return 0.0
    out = (v - min_val) / (max_val - min_val)
    return float(max(0.0, min(1.0, out)))


def _tokenize_text(text: str) -> List[str]:
    """Lowercase + split on non-alphanumeric characters."""
    if not text:
        return []
    text = text.lower()
    tokens = re.split(r"[^a-z0-9\+#+\-/]+", text)  # keep tokens like c++, c#
    tokens = [t.strip() for t in tokens if t and len(t) > 0]
    return tokens


def extract_skills_from_text(text: str, vocab: List[str] = SKILL_VOCAB) -> List[str]:
    """
    Simple skill extractor: checks if any vocab item appears as substring in text tokens.
    Returns list of matched canonical skills (lowercased).
    """
    if not text:
        return []
    text_lc = text.lower()
    # exact token match or substring match for multi-word skills
    found = set()
    for skill in vocab:
        skill_lc = skill.lower()
        if skill_lc in text_lc:
            found.add(skill_lc)
    return sorted(list(found))


def normalize_aspiration(aspiration: str) -> str:
    """
    Map free-text aspiration to canonical role keys from CAREER_DEMAND_MAP.
    Uses simple token checks and synonyms.
    """
    if not aspiration:
        return ""
    a = aspiration.lower()
    # direct mapping checks
    for role in CAREER_DEMAND_MAP.keys():
        if role in a:
            return role

    # simple synonyms
    if "data scientist" in a or "ml engineer" in a or "machine learning" in a:
        return "machine learning engineer" if "engineer" in a or "developer" in a else "data scientist"
    if "data" in a and "analyst" in a:
        return "data analyst"
    if "frontend" in a or "react" in a or "ui" in a or "ux" in a:
        return "ui/ux designer"
    if "devops" in a or "k8s" in a or "kubernetes" in a:
        return "devops engineer"
    if "web" in a and "developer" in a:
        return "web developer"
    if "software" in a or "developer" in a:
        return "software developer"

    # fallback: empty string (unknown)
    return ""


# -------------------------
# Public function
# -------------------------
def build_feature_vector(
    user_profile: Dict,
    current_skills: List[str],
    career_aspiration: str,
) -> Dict:
    """
    Convert user raw input into a richer numeric feature dictionary.

    Returns keys:
      - avg_score: 0..1
      - experience_level: normalized 0..1 (0..5 years)
      - skill_count: normalized 0..1 (0..10 skills)
      - market_demand: 0..1 from CAREER_DEMAND_MAP (default 0.6)
      - skill_coverage_ratio: fraction of role-required skills present (0..1)
      - missing_skills_count: normalized count of missing required skills (0..1)
      - extracted_skills: list[str] (also returned for debugging/consumption)
    """

    # --- basic numeric features ---
    try:
        avg_score = float(user_profile.get("avg_score", 0.5))
    except Exception:
        avg_score = 0.5
    avg_score = max(0.0, min(1.0, avg_score))

    try:
        exp_years = float(user_profile.get("experience_years", 0.0))
    except Exception:
        exp_years = 0.0
    experience_level = normalize(exp_years, 0.0, 5.0)

    # current skills canonicalization (normalize input skills)
    input_skills = []
    if current_skills:
        for s in current_skills:
            if not s:
                continue
            input_skills.append(s.strip().lower())

    # also extract skills from free-text fields like "projects" or "bio" if present
    free_text_fields = []
    if "bio" in user_profile and user_profile["bio"]:
        free_text_fields.append(user_profile["bio"])
    if "projects" in user_profile and user_profile["projects"]:
        # projects may be list or text
        if isinstance(user_profile["projects"], list):
            free_text_fields.extend([str(p) for p in user_profile["projects"]])
        else:
            free_text_fields.append(str(user_profile["projects"]))

    # extract from aspiration text as well
    extracted_from_asp = extract_skills_from_text(career_aspiration)
    extracted_from_free = []
    for t in free_text_fields:
        extracted_from_free.extend(extract_skills_from_text(t))

    extracted_skills = set(input_skills + extracted_from_asp + extracted_from_free)

    # skill_count (0..10 mapped to 0..1)
    skill_count_raw = len(extracted_skills)
    skill_count = normalize(skill_count_raw, 0.0, 10.0)

    # map aspiration -> canonical role
    role = normalize_aspiration(career_aspiration)
    market_demand = CAREER_DEMAND_MAP.get(role, 0.6)

    # required skills for that role
    required = ROLE_REQUIRED_SKILLS.get(role, [])
    required_norm = [r.lower() for r in required]

    if required_norm:
        # compute coverage ratio: how many required skills exist in extracted_skills
        matched = 0
        for req in required_norm:
            # check substring presence in extracted_skills or in input skills
            for s in extracted_skills:
                if req in s or s in req:
                    matched += 1
                    break
        skill_coverage_ratio = matched / max(1, len(required_norm))
        missing_skills_count = len(required_norm) - matched
        missing_skills_count_norm = normalize(missing_skills_count, 0.0, len(required_norm))
    else:
        skill_coverage_ratio = 0.0
        missing_skills_count_norm = 0.0

    return {
        "avg_score": float(avg_score),
        "experience_level": float(experience_level),
        "skill_count": float(skill_count),
        "market_demand": float(market_demand),
        "skill_coverage_ratio": float(skill_coverage_ratio),
        "missing_skills_count": float(missing_skills_count_norm),
        "extracted_skills": sorted(list(extracted_skills)),
        "role": role,
    }


# -------------------------
# OPTIONAL: how to add dense embeddings (future)
# -------------------------
# If you later want real semantic embeddings, install:
#   pip install -U sentence-transformers
# and use:
#
# from sentence_transformers import SentenceTransformer
# model = SentenceTransformer("all-MiniLM-L6-v2")
# embedding = model.encode([career_aspiration], convert_to_numpy=True)[0]
#
# You can then compute cosine similarity between embeddings of user aspiration
# and embeddings of job descriptions or course descriptions. For now we used
# simpler rule-based matching which is robust and lightweight for a college demo.
#
