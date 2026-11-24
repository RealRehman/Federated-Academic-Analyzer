
from app.ml.data.graduate_dropout_preprocessing import (
    prepare_graduate_dropout_data
)

X, y, preprocessor, label_encoder = prepare_graduate_dropout_data()

print("\nFeature matrix shape:", X.shape)
print("Target array shape:", y.shape)

print("\nFirst 5 target values:", y[:5])

print("\nPreprocessor created:", preprocessor is not None)
print("Label encoder created:", label_encoder is not None)

