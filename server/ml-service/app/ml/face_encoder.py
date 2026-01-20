import face_recognition
import numpy as np
from PIL import Image
from io import BytesIO


MIN_FACE_AREA_RATIO = 0.05     # face must cover at least 5% of image
NUM_JITTERS = 5                # stronger embedding (1 is default)


def get_face_embedding(image_bytes: bytes):
    """
    Returns:
      embedding (list of 128 floats)

    Raises:
      ValueError if:
        - no face
        - multiple faces
        - face too small
    """

    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)

    h, w, _ = image_np.shape
    image_area = h * w

    # Upsample helps HOG on small/medium images
    locations = face_recognition.face_locations(
        image_np,
        number_of_times_to_upsample=1,
        model="hog"
    )

    if len(locations) == 0:
        raise ValueError("No face detected")

    if len(locations) > 1:
        raise ValueError("Multiple faces detected")

    top, right, bottom, left = locations[0]
    face_area = (bottom - top) * (right - left)

    if face_area / image_area < MIN_FACE_AREA_RATIO:
        raise ValueError("Face too small — move closer to camera")

    encoding = face_recognition.face_encodings(
        image_np,
        known_face_locations=locations,
        num_jitters=NUM_JITTERS,
        model="small"   # faster; accuracy mainly comes from jitters
    )[0]

    return encoding.tolist()
