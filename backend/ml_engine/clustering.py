# src/clustering.py

"""
Updated clustering module for LearnPathAI.

This version trains KMeans on 6-feature vectors that match the enhanced
build_feature_vector() output:
  - avg_score
  - experience_level
  - skill_count
  - market_demand
  - skill_coverage_ratio
  - missing_skills_count

Save this file as src/clustering.py (overwrite existing).
Then run: python -m src.clustering
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import joblib
import os
from typing import Dict

# Paths - use absolute so module works from any CWD
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "kmeans_model.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.joblib")


# --------------------------------------------
# STEP 1: Generate Dummy Training Dataset (6 features)
# --------------------------------------------
def generate_dummy_dataset(n=600):
    """
    Return a DataFrame with columns:
    ['avg_score', 'experience_level', 'skill_count',
     'market_demand', 'skill_coverage_ratio', 'missing_skills_count']
    The synthetic data attempts to simulate beginner / intermediate / advanced groups.
    """
    # split roughly into 3 groups
    n1 = n // 3
    n2 = n // 3
    n3 = n - n1 - n2

    # BEGINNER: low scores, low experience, few skills, varied market demand,
    # low coverage, high missing count
    beginners = (
        np.random.rand(n1, 6) * np.array([0.35, 0.25, 0.2, 1.0, 0.3, 0.6])
        + np.array([0.0, 0.0, 0.0, 0.0, 0.0, 0.3])
    )

    # INTERMEDIATE: medium scores, some experience and skills,
    # moderate coverage, moderate missing
    intermediates = (
        np.random.rand(n2, 6) * np.array([0.25, 0.35, 0.4, 1.0, 0.5, 0.4])
        + np.array([0.35, 0.2, 0.2, 0.0, 0.2, 0.1])
    )

    # ADVANCED: high scores, higher experience, more skills,
    # higher coverage ratio, low missing skills count
    advanced = (
        np.random.rand(n3, 6) * np.array([0.25, 0.3, 0.4, 1.0, 0.3, 0.2])
        + np.array([0.65, 0.5, 0.5, 0.0, 0.5, 0.0])
    )

    data = np.vstack([beginners, intermediates, advanced])

    df = pd.DataFrame(
        data,
        columns=[
            "avg_score",
            "experience_level",
            "skill_count",
            "market_demand",
            "skill_coverage_ratio",
            "missing_skills_count",
        ],
    )

    # ensure values are in 0..1
    df = df.clip(0.0, 1.0)

    return df


# --------------------------------------------
# STEP 2: Train KMeans + save model
# --------------------------------------------
def train_model(n_samples: int = 600, n_clusters: int = 3):
    print("🔧 Generating dummy dataset (6-feature)...")
    df = generate_dummy_dataset(n=n_samples)

    print("🔧 Dataset sample (head):")
    print(df.head().to_string(index=False))

    print("🔧 Scaling features...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df.values)

    print("🔧 Training KMeans clustering (n_clusters=%d)..." % n_clusters)
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
    kmeans.fit(X_scaled)

    # Create model folder if not exists
    os.makedirs(MODEL_DIR, exist_ok=True)

    print(f"💾 Saving model to {MODEL_PATH} and scaler to {SCALER_PATH} ...")
    joblib.dump(kmeans, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    print("✅ Training complete!")
    return kmeans, scaler


# --------------------------------------------
# STEP 3: Predict cluster for a new user (6-feature dict)
# --------------------------------------------
def predict_cluster(feature_dict: Dict) -> int:
    """
    feature_dict must contain numeric keys:
      - avg_score
      - experience_level
      - skill_count
      - market_demand
      - skill_coverage_ratio
      - missing_skills_count

    Returns cluster id (int).
    """

    # If models are not present, train them automatically
    if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
        print("⚠ Model or scaler not found — training now (this may take a few seconds)...")
        train_model()

    kmeans = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

    # Build feature vector in the exact order used during training
    features = np.array(
        [
            [
                float(feature_dict.get("avg_score", 0.0)),
                float(feature_dict.get("experience_level", 0.0)),
                float(feature_dict.get("skill_count", 0.0)),
                float(feature_dict.get("market_demand", 0.0)),
                float(feature_dict.get("skill_coverage_ratio", 0.0)),
                float(feature_dict.get("missing_skills_count", 0.0)),
            ]
        ]
    )

    features_scaled = scaler.transform(features)
    cluster = kmeans.predict(features_scaled)[0]
    return int(cluster)


# --------------------------------------------
# Quick manual test (run as module)
# --------------------------------------------
if __name__ == "__main__":
    print("🚀 Training clustering model with 6-feature synthetic data...")
    train_model()

    sample = {
        "avg_score": 0.65,
        "experience_level": 0.2,
        "skill_count": 0.4,
        "market_demand": 0.9,
        "skill_coverage_ratio": 0.5,
        "missing_skills_count": 0.2,
    }
    print("Sample features:", sample)
    print("Predicted cluster:", predict_cluster(sample))
