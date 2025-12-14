
import numpy as np
import pandas as pd
from typing import List, Dict, Union
try:
    from sentence_transformers import SentenceTransformer
    from sklearn.neighbors import NearestNeighbors
except ImportError:
    SentenceTransformer = None
    NearestNeighbors = None

class PathwayRecommender:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """
        Initialize the recommender system with a pre-trained Sentence Transformer model.
        Falls back to a mock mode if libraries are missing.
        """
        self.model_name = model_name
        self.vectorizer = None
        self.course_vectors = None
        self.course_data = [] # List of dicts
        
        if SentenceTransformer:
            print(f"Loading SBERT model: {model_name}...")
            # This might take a moment on first run
            self.vectorizer = SentenceTransformer(model_name)
        else:
            print("Warning: sentence-transformers not found. Operating in mock mode.")

    def encode(self, texts: List[str]) -> np.ndarray:
        """
        Convert a list of text strings into embeddings.
        """
        if self.vectorizer:
            embeddings = self.vectorizer.encode(texts, convert_to_numpy=True)
            # Ensure contiguous float64 for sklearn compatibility
            return np.ascontiguousarray(embeddings, dtype=np.float64)
        # Mock embeddings for testing without dependencies
        return np.ascontiguousarray(np.random.rand(len(texts), 384), dtype=np.float64)

    def fit_courses(self, courses: List[Dict[str, str]]):
        """
        Ingest course data and build the search index.
        courses: List of dicts, must have 'description' and 'title' keys.
        """
        self.course_data = courses
        
        # Create a rich text representation for embedding
        # e.g. "Title: Python 101. Description: Learn basic coding."
        course_texts = [
            f"Title: {c.get('title', '')}. Description: {c.get('description', '')}. Skills: {c.get('skills', '')}" 
            for c in courses
        ]
        
        self.course_vectors = self.encode(course_texts)
        # Ensure contiguous float64 dtype for sklearn compatibility
        self.course_vectors = np.ascontiguousarray(self.course_vectors, dtype=np.float64)
        
        # Initialize NearestNeighbors for fast retrieval
        if NearestNeighbors:
            self.nn_model = NearestNeighbors(n_neighbors=5, metric='cosine')
            self.nn_model.fit(self.course_vectors)

    def recommend(self, user_profile_text: str, top_k: int = 5) -> List[Dict]:
        """
        Recommend courses based on user profile text (semantic search).
        """
        if not self.course_data:
            return []
            
        user_vector = self.encode([user_profile_text])
        # Ensure contiguous float64 array
        user_vector = np.ascontiguousarray(user_vector, dtype=np.float64)
        
        # Use manual cosine similarity instead of NearestNeighbors to avoid dtype issues
        from sklearn.metrics.pairwise import cosine_similarity
        sims = cosine_similarity(user_vector, self.course_vectors)[0]
        top_indices = sims.argsort()[::-1][:top_k]
        scores = sims[top_indices]

        results = []
        for idx, score in zip(top_indices, scores):
            item = self.course_data[idx].copy()
            item['match_score'] = float(score)
            results.append(item)
            
        return results
