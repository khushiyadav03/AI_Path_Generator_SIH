# backend/setup_full.py
import sys
import os
import json
import numpy as np

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.data.loader import generate_mock_nsqf_courses, save_mock_data
from backend.ml_engine.profiler import LearnerProfiler
from backend.ml_engine.recommender import PathwayRecommender

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODEL_DIR = os.path.join(BASE_DIR, 'ml_engine', 'models')

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)

def run_setup():
    print("=== 1. Generating Dataset (Simulating Download) ===")
    # Generate a larger dataset (e.g. 500 courses) to simulate a real download
    courses = generate_mock_nsqf_courses(count=500)
    save_path = os.path.join(DATA_DIR, 'courses.json')
    save_mock_data(courses, save_path)
    print(f"Dataset saved to {save_path} ({len(courses)} records)")
    
    print("\n=== 2. Pre-processing & Training Unsupervised Model ===")
    # We need to embed some dummy user history to train the clustering model
    # In a real scenario, this would load user_logs.csv
    
    # Simulate 500 users with random semantic vectors (size 384 for MiniLM)
    # Ideally we would generate text profiles and embed them, but for speed we mock vectors
    # aligned with the 5 clusters we want to discover.
    
    print("Training K-Means Profiler on simulated user history...")
    profiler = LearnerProfiler(n_clusters=5)
    
    # Generate synthetic diverse history
    history_vectors = np.random.rand(200, 384).astype(np.float32)
    profiler.fit(history_vectors)
    
    profiler.save(MODEL_DIR)
    print(f"Model saved to {MODEL_DIR}")
    
    print("\n=== Setup Complete ===")
    print("Ready to run project.")

if __name__ == "__main__":
    run_setup()
