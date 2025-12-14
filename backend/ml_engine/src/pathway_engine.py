# src/pathway_engine.py

"""
This file combines:
1. features.py -> build_feature_vector
2. clustering.py -> predict_cluster
3. pathway generation (career roadmap)
"""

from typing import Dict, List
from .features import build_feature_vector
from .clustering import predict_cluster

import json
import os

# path relative to ml_engine package location
CURDIR = os.path.dirname(__file__)
# courses.json lives in the parent ml_engine folder (one level up from src)
COURSES_JSON = os.path.abspath(os.path.join(CURDIR, "..", "courses.json"))

def load_courses_db():
    try:
        with open(COURSES_JSON, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

# call once at import
COURSES_DB = load_courses_db()


def pick_courses_for_role(role_key: str, cluster_label: str, top_n: int = 3):
    """
    role_key: e.g., "data_analyst", "machine_learning", "software_developer"
    cluster_label: "Beginner"/"Intermediate"/"Advanced"
    """
    out = []
    role_obj = COURSES_DB.get(role_key, {})
    # cluster-specific prioritized list
    cluster_list = role_obj.get("cluster_courses", {}).get(cluster_label, [])
    for c in cluster_list[:top_n]:
        out.append({"title": c["title"], "platform": c["platform"], "url": c["url"]})

    # if cluster list insufficient, supplement with skill-based courses
    if len(out) < top_n:
        # iterate role skills to add more variety
        skills_map = role_obj.get("skills", {})
        for skill, courses in skills_map.items():
            for c in courses:
                candidate = {"title": c["title"], "platform": c["platform"], "url": c["url"]}
                if candidate not in out:
                    out.append(candidate)
                if len(out) >= top_n:
                    break
            if len(out) >= top_n:
                break

    return out[:top_n]


# Roadmaps for each cluster
CLUSTER_ROADMAP = {
    0: {
        "label": "Beginner",
        "skills": [
            "Fundamental concepts of chosen domain",
            "Basic programming / tools",
            "Introductory projects",
        ],
        "courses": [
            "YouTube basics playlist",
            "Beginner Coursera specialization",
        ],
        "certifications": [
            "Foundational certification in chosen field"
        ],
    },
    1: {
        "label": "Intermediate",
        "skills": [
            "Advanced tools & real datasets",
            "Intermediate problem-solving",
            "Portfolio-building projects",
        ],
        "courses": [
            "Coursera intermediate course",
            "Udemy hands-on projects course",
        ],
        "certifications": [
            "Google / Meta career cert",
        ],
    },
    2: {
        "label": "Advanced",
        "skills": [
            "Industry-level skills",
            "Real-world capstone projects",
            "Interview preparation",
        ],
        "courses": [
            "Specialized Coursera program",
            "Advanced Udemy bootcamp",
        ],
        "certifications": [
            "Professional certification",
        ],
    },
}


def generate_learning_pathway(
    user_profile: Dict,
    current_skills: List[str],
    career_aspiration: str,
):
    """
    Main ML function called from backend.
    """

    # 1) Build feature vector from user input
    features = build_feature_vector(
        user_profile,
        current_skills,
        career_aspiration
    )

    # 2) Assign cluster using KMeans
    cluster_id = predict_cluster(features)

    # 3) Retrieve the roadmap for this cluster (fallback to 0)
    roadmap = CLUSTER_ROADMAP.get(cluster_id, CLUSTER_ROADMAP[0])

    # 4) Determine canonical role from the features (features includes 'role')
    role = features.get("role", "").strip().lower()

    # 5) Map role -> key used in courses.json
    role_key_map = {
        "data analyst": "data_analyst",
        "data scientist": "machine_learning",
        "machine learning engineer": "machine_learning",
        "software developer": "software_developer",
        "web developer": "software_developer"
    }
    role_key = role_key_map.get(role, "data_analyst")

    # 6) Pick curated courses from courses.json (top 3)
    recommended_courses = pick_courses_for_role(role_key, roadmap["label"], top_n=3)

    # 7) Final response object
    return {
        "cluster_id": int(cluster_id),
        "cluster_label": roadmap["label"],
        "career_aspiration": career_aspiration,
        "recommended_skills": roadmap["skills"],
        "recommended_courses": recommended_courses,
        "recommended_certifications": roadmap["certifications"],
    }


# Manual test
if __name__ == "__main__":
    user = {
        "avg_score": 0.55,
        "experience_years": 1
    }

    skills = ["python", "excel"]
    aspiration = "Data Analyst"

    result = generate_learning_pathway(user, skills, aspiration)
    print("Generated Pathway:\n", result)
