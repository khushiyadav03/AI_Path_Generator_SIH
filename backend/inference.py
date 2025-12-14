# backend/inference.py
import sys
import json
import os
import numpy as np

# Add the parent directory to sys.path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.ml_engine.recommender import PathwayRecommender
from backend.ml_engine.profiler import LearnerProfiler
from backend.ml_engine.features import build_feature_vector, enrich_features_with_embedding

# Constants for paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODEL_DIR = os.path.join(BASE_DIR, 'ml_engine', 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

def load_resources():
    # Load Courses
    courses_path = os.path.join(DATA_DIR, 'courses.json')
    with open(courses_path, 'r') as f:
        courses = json.load(f)
        
    # Load Recommender
    rec = PathwayRecommender(model_name='all-MiniLM-L6-v2')
    rec.fit_courses(courses)
    
    # Load Profiler
    profiler = LearnerProfiler(n_clusters=5)
    try:
        profiler.load(MODEL_DIR)
    except:
        # Fallback if not trained (should not happen if setup ran)
        pass
        
    return rec, profiler

def main():
    try:
        # Read input from first argument (JSON string)
        if len(sys.argv) > 1:
            input_json = sys.argv[1]
        else:
            # Fallback for testing: read from stdin
            input_json = sys.stdin.read()
            
        data = json.loads(input_json)
        
        user_asp = data.get('aspiration', '')
        user_skills = data.get('skills', [])
        
        # Load models
        print("[DEBUG] Loading resources...", file=sys.stderr)
        rec, profiler = load_resources()
        
        # 1. Feature Engineering
        print("[DEBUG] Building features...", file=sys.stderr)
        features = build_feature_vector({}, user_skills, user_asp)
        
        print("[DEBUG] Enriching features with embedding...", file=sys.stderr)
        features = enrich_features_with_embedding(features, user_asp)
        
        # 2. Profiling
        print("[DEBUG] Creating user vector...", file=sys.stderr)
        user_vec = np.array(features['semantic_embedding']).astype(np.float64)
        if user_vec.ndim == 1:
             user_vec = user_vec.reshape(1, -1)
        
        print(f"[DEBUG] User vector shape: {user_vec.shape}, dtype: {user_vec.dtype}", file=sys.stderr)
        
        print("[DEBUG] Predicting persona...", file=sys.stderr)
        persona_id = profiler.predict_persona(user_vec)

        persona_label = profiler.get_cluster_insights(persona_id)
        
        # 3. Recommendations
        print("[DEBUG] Getting recommendations...", file=sys.stderr)
        # Combine aspiration + skills for better semantic search
        query = f"{user_asp} {', '.join(user_skills)}"
        recs = rec.recommend(query, top_k=5)
        
        result = {
            "status": "success",
            "profile": {
                "persona_id": persona_id,
                "persona_label": persona_label,
                "inferred_role": features.get("role", "General Learner")
            },
            "recommendations": recs
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        import traceback
        traceback.print_exc(file=sys.stderr)
        error_res = {"status": "error", "message": str(e)}
        print(json.dumps(error_res))

if __name__ == "__main__":
    main()
