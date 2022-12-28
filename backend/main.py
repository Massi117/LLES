# Import Tensorflow 2.0
import tensorflow as tf 

# Other libraries
import numpy as np
import cv2 as cv

# Import our model
from build_model import *
from data_processing import *

# Define the model
new_model = build_cnn_model()
# Initialize the model by passing some data through
new_model.build(input_shape=(1,64,64,3))
# Print the summary of the layers in the model.
print(new_model.summary())

new_model.compile(loss = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True), optimizer = 'adam', metrics = ['accuracy'])

# Loads the weights
new_model.load_weights("backend/eyedetection.h5")

# Evaluate the model
#test_loss, test_acc = new_model.evaluate(test_set)
#print('Test accuracy:', test_acc)


# Create a VideoCapture object and read from input file
# If the input is the camera, pass 0 instead of the video file name
cap = cv.VideoCapture(0)
 
# Check if camera opened successfully
if (cap.isOpened()== False): 
  print("Error opening video stream or file")
 
# Read until video is completed
while(cap.isOpened()):
  # Capture frame-by-frame
  ret, frame = cap.read()
  if ret == True:
 
    # Display the resulting frame
    cv.imshow('Frame',frame)

    # Preprocess each frame
    frame_resized = rescaleFrame(frame, 64, 64)
    #grayFrame = cv.cvtColor(frame_resized, cv.COLOR_BGR2GRAY)
    new_frame = tf.convert_to_tensor(frame_resized, dtype=tf.float32)
    frame_tensor = tf.image.convert_image_dtype(new_frame, dtype=tf.float32, saturate=False)
    frame_tensor = tf.expand_dims(frame_tensor, axis=0)

    # Predict each frame
    prediction = new_model.predict(frame_tensor)
    if prediction[0][0] >= prediction[0][1]:
        print('Single Image Prediction: Closed Eyes')
    else:
        print('Single Image Prediction: Open Eyes')

 
  # Press Q on keyboard to  exit
  if cv.waitKey(25) & 0xFF == ord('q'):
    break
  # Break the loop
  else: 
    break
 
# When everything done, release the video capture object
cap.release()
 
# Closes all the frames
cv.destroyAllWindows()
