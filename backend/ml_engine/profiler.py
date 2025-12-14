
import numpy as np
import pickle
import os
from typing import List, Dict
try:
    from sklearn.cluster import KMeans
    from sklearn.decomposition import PCA
except ImportError:
    KMeans = None
    PCA = None

class LearnerProfiler:
    def __init__(self, n_clusters: int = 5):
        """
        Unsupervised Clustering for Learner Personas.
        """
        self.n_clusters = n_clusters
        self.kmeans = None
        self.pca = None
        
        if KMeans:
            self.kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            self.pca = PCA(n_components=10) # Dimensionality reduction for better clustering
        
    def fit(self, user_vectors: np.ndarray):
        """
        Train the clustering model on a history of user embedding vectors.
        """
        if not KMeans:
            print("sklearn not found. Sketch mode.")
            return

        # Ensure float64 dtype
        user_vectors = user_vectors.astype(np.float64)

        print(f"Clustering {len(user_vectors)} profiles into {self.n_clusters} personas...")
        # Optional: PCA reduction if vectors are large (384 dims)
        if user_vectors.shape[1] > 50:
             self.pca.fit(user_vectors)
             reduced_vectors = self.pca.transform(user_vectors)
             self.kmeans.fit(reduced_vectors)
        else:
             self.kmeans.fit(user_vectors)
             
    def predict_persona(self, user_vector: np.ndarray) -> int:
        """
        Assign a new user to an existing persona cluster.
        """
        if not self.kmeans:
            return 0
            
        if user_vector.ndim == 1:
            user_vector = user_vector.reshape(1, -1)
        
        # KMeans was likely trained with float32, so convert to float32
        user_vector = np.ascontiguousarray(user_vector, dtype=np.float32)
            
        if self.pca:
            user_vector = self.pca.transform(user_vector)
            # Ensure float32 after PCA transform as well
            user_vector = np.ascontiguousarray(user_vector, dtype=np.float32)
            
        return int(self.kmeans.predict(user_vector)[0])

    def get_cluster_insights(self, cluster_id: int) -> str:
        """
        Return a human-readable label or insight for the cluster (placeholder).
        In a real app, this would be derived from the centroids.
        """
        # Dictionary of likely cluster themes based on our NSQF synthetic data
        # This is a heuristic until we implement automated cluster labeling
        themes = {
            0: "Tech Savvy / Data Science Aspirants",
            1: "Vocational / Trades & Technician",
            2: "Creative / Design",
            3: "Business / Management",
            4: "Entry Level / General Skilling"
        }
        return themes.get(cluster_id, "General Learner Group")
        
    def save(self, directory: str):
        if self.kmeans:
            with open(os.path.join(directory, 'kmeans_model.pkl'), 'wb') as f:
                pickle.dump(self.kmeans, f)
            with open(os.path.join(directory, 'pca_model.pkl'), 'wb') as f:
                pickle.dump(self.pca, f)

    def load(self, directory: str):
        try:
            with open(os.path.join(directory, 'kmeans_model.pkl'), 'rb') as f:
                self.kmeans = pickle.load(f)
            with open(os.path.join(directory, 'pca_model.pkl'), 'rb') as f:
                self.pca = pickle.load(f)
        except Exception as e:
            print(f"Could not load profiler models: {e}")
