import numpy as np
import tensorflow as tf
from sklearn import datasets

# Test NumPy
print("NumPy version:", np.__version__)
arr = np.array([1, 2, 3])
print("NumPy array:", arr)

# Test TensorFlow
print("\nTensorFlow version:", tf.__version__)
tensor = tf.constant([1, 2, 3])
print("TensorFlow tensor:", tensor)

# Test scikit-learn
print("\nscikit-learn test:")
iris = datasets.load_iris()
print("Loaded iris dataset with shape:", iris.data.shape)

print("\nAll imports successful! Your environment is set up correctly.") 