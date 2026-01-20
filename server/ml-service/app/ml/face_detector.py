import face_recognition
import numpy as np
from PIL import Image
from io import BytesIO

MIN_FACE_AREA_RATIO = 0.04
NUM_JITTERS = 3

def detect_faces_and_embeddings(image_bytes: bytes):
  
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)
    
    h, w, _ = image_np.shape
    image_area = h * w

    locations = face_recognition.face_locations(
      image_np,
      number_of_times_to_upsample=1,
      model="hog"   # CPU-friendly, works in Docker
    )
    
    if not locations:
      return []
    

    encodings = face_recognition.face_encodings(
      image_np, 
      locations,
      num_jitters= NUM_JITTERS,
      model="small" 
    )

    faces = []
    
    for (top, right, bottom, left), enc in zip(locations, encodings):
      face_area = (bottom-left) * (right - top)
      if face_area / image_area < MIN_FACE_AREA_RATIO:
        continue
      
      faces.append({
          "box": (top, right, bottom, left),
          "embedding": enc.tolist()
        })
      
    return faces
