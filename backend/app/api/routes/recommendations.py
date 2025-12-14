# backend/app/api/routes/recommendations.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any

# Try importing the ML function from possible locations.
# This makes the router resilient whether your ml package is inside backend/ml_engine
# or located at ../src (LearnPathAI-ML/src). Adjust later if needed.
try:
    from ml_engine.pathway_engine import generate_learning_pathway
except Exception:
    try:
        from src.pathway_engine import generate_learning_pathway
    except Exception:
        # fallback stub if ML not available — router still loads for dev
        def generate_learning_pathway(user_profile, current_skills, career_aspiration):
            return {
                "cluster_id": 0,
                "cluster_label": "Beginner (stub)",
                "career_aspiration": career_aspiration,
                "recommended_skills": ["Fundamentals (stub)"],
                "recommended_courses": ["YouTube basics (stub)"],
                "recommended_certifications": ["Foundational cert (stub)"],
            }


router = APIRouter(prefix="/recommendations", tags=["recommendations"])


class RecommendationRequest(BaseModel):
    user_profile: Dict[str, Any] = Field(..., example={"avg_score": 0.6, "experience_years": 1})
    current_skills: List[str] = Field(..., example=["python", "excel"])
    career_aspiration: str = Field(..., example="Data Analyst")


@router.post("/", response_model=Dict[str, Any])
async def get_recommendations(payload: RecommendationRequest):
    """
    Accepts a user's profile + skills + aspiration and returns a recommended learning pathway.
    """
    try:
        result = generate_learning_pathway(
            user_profile=payload.user_profile,
            current_skills=payload.current_skills,
            career_aspiration=payload.career_aspiration,
        )
        return result
    except Exception as e:
        # In dev, return error string; in prod, hide internals.
        raise HTTPException(status_code=500, detail=str(e))
