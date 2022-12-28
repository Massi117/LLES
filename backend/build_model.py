# Import Tensorflow 2.0
import tensorflow as tf 

# Build the CNN model
def build_cnn_model(classes=2):
    cnn_model = tf.keras.Sequential([

        # Normalize
        tf.keras.layers.Rescaling(1./255),

        # Define the first convolutional layer & the first max pooling layer
        tf.keras.layers.Conv2D(filters=32, kernel_size=(3,3), padding='same', activation=tf.nn.relu), 
        tf.keras.layers.MaxPool2D(pool_size=(2,2)),

        # Define the second convolutional layer & the second max pooling layer
        tf.keras.layers.Conv2D(filters=64, kernel_size=(3,3), padding='same', activation=tf.nn.relu),
        tf.keras.layers.MaxPool2D(pool_size=(2,2)),

        # Define the third convolutional layer & the third max pooling layer
        tf.keras.layers.Conv2D(filters=128, kernel_size=(3,3), padding='same', activation=tf.nn.relu),
        tf.keras.layers.MaxPool2D(pool_size=(2,2)),

        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(64, activation=tf.nn.relu),

        # Define the last Dense layer to output the classification 
        # probabilities. Pay attention to the activation needed a probability
        # output
        tf.keras.layers.Dense(classes, activation=tf.nn.softmax)
    ])
    
    return cnn_model