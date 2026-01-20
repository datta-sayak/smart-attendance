import numpy as np 

def euclidean_distance(a, b):
    return np.linalg.norm(np.array(a) - np.array(b))

def match_embedding(detected_emb, known_embeddings):
    """
    known_embeddings: list of embeddings for ONE student
    Returns: best_distance (float)
    """
    distances = [euclidean_distance(detected_emb, e) for e in known_embeddings]
    return min(distances) if distances else None