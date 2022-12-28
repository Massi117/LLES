# Import Tensorflow 2.0
import tensorflow as tf 

# Other libraries
import numpy as np

# Import custom dependencies
from build_model import build_cnn_model
from data_processing import *

# Define the batch size and the number of epochs to use during training
BATCH_SIZE = 32
EPOCHS = 20

# Fetch the datasets:
# Define location of data
train_data_path = 'dataset/train'
val_data_path = 'dataset/test'
# Define the datasets
train_set, val_set = get_dataset(train_data_path, val_data_path, BATCH_SIZE, 64, 64)

# Define the model:
cnn_model = build_cnn_model()
# Initialize the model by passing some data through
for image_batch, labels_batch in train_set:
    print(image_batch.shape)
    print(labels_batch.shape)
    cnn_model.build(image_batch.shape)
    break

# Print the summary of the layers in the model.
print(cnn_model.summary())

cnn_model.compile(loss = tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True), optimizer = 'adam', metrics = ['accuracy'])

model_path="eyedetection.h5"

checkpoint = tf.keras.callbacks.ModelCheckpoint(model_path, monitor='val_accuracy', verbose=1, 
                              save_best_only=True, mode='max')

callbacks_list = [checkpoint]

history = cnn_model.fit(train_set, validation_data=val_set, epochs=EPOCHS, callbacks=callbacks_list)

test_loss, test_acc = cnn_model.evaluate(train_set)

print('Test accuracy:', test_acc)