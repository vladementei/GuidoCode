!pip install gspread oauth2client
!pip install --upgrade tensorflow==1.4.0
!pip install opencv-python
!pip install keras==2.1.5
!pip install imageai --upgrade
!pip install -U Flask
!pip install -U flask-cors
!pip install flask-ngrok
!pip install midiutil
import sys
sys.path.append('/content/drive/My Drive/Colab Notebooks')

from collections import namedtuple
from threading import Timer
from flask_ngrok import _run_ngrok
from server_ip_writer import write_api_address
import cv2
from flask_ngrok import run_with_ngrok
import os
from flask import Flask, request, redirect, url_for, send_from_directory, send_file,  render_template
from flask_cors import CORS, cross_origin
from imageai.Detection.Custom import CustomObjectDetection
from image_modifier import warp_image
from convert_utils_1 import convert_song, convert_midi #, convert_midi_to_text
import tensorflow as tf

detector = CustomObjectDetection()
detector.setModelTypeAsYOLOv3()
detector.setModelPath("/content/drive/My Drive/Colab Notebooks/last-detect.h5")
detector.setJsonPath("/content/drive/My Drive/Colab Notebooks/best-conf.json")
detector.loadModel()
graph = tf.get_default_graph()

UPLOAD_FOLDER = '/content/drive/My Drive/Colab Notebooks/uploads/'
ALLOWED_EXTENSIONS = set(['png', 'jpg'])

template_dir = '/content/drive/My Drive/Colab Notebooks/templates/'
static_dir = '/content/drive/My Drive/Colab Notebooks/static/'

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# Message = namedtuple('Message', 'text')
# messages = []
# midtxt="hello"
# song=[]

def allowed_file(filename):
    return filename[-3:].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
@cross_origin()
def upload_file():
    if request.method == 'POST':
        img_notes = request.files['file']
        if img_notes and allowed_file(img_notes.filename):
            print ('**found file', img_notes.filename)
            # global messages
            # messages = []
            # global midtxt
            # midtxt = "hello"
            # global song
            # song = []
            img_notes.save(UPLOAD_FOLDER + img_notes.filename)
            while not os.path.exists(UPLOAD_FOLDER  + img_notes.filename):
                time.sleep(5)

            global graph
            with graph.as_default():

                sliced_image = warp_image(cv2.imread(UPLOAD_FOLDER + img_notes.filename), isDebug=False)
                if sliced_image is None:
                    print("Image slice failed, use original image")
                else:
                    print("Image slice succes, override original image")
                    cv2.imwrite(UPLOAD_FOLDER + img_notes.filename, sliced_image)

                detections = detector.detectObjectsFromImage(
                    input_image=UPLOAD_FOLDER + img_notes.filename,
                    output_image_path=UPLOAD_FOLDER + "detected.jpg",
                    minimum_percentage_probability=70,
                    display_object_name=True,
                    display_percentage_probability=True
                )
                song = convert_song(detections, UPLOAD_FOLDER + img_notes.filename)
                convert_midi(song, UPLOAD_FOLDER + img_notes.filename)
                # midtxt = convert_midi_to_text(song)
                # messages.append(Message(midtxt))

            with open(UPLOAD_FOLDER + img_notes.filename+'.mid', 'rb') as midi_file:
                leader = midi_file.read(4)
                if leader != b'MThd':
                    raise ValueError('Not a MIDI file!')
            print('server_success')
            return send_file(midi_file.name);
    elif request.method == 'GET':
        # return render_template('basic.html')

        return '''
        <!doctype html>
        <title>Upload new File</title>
        <h1>Upload new File</h1>
        <form action="" method=post enctype=multipart/form-data>
          <p><input type=file name=file>
             <input type=submit value=Upload>
        </form>
        '''

#run_with_ngrok(app)

# @app.route('/animation', methods=['GET'])
# def animation():
#     return render_template('animation.html',messages=messages)


def start_ngrok():
    ngrok_address = _run_ngrok()
    write_api_address(ngrok_address)
    print(f" * Running on {ngrok_address}")

def new_run():
    thread = Timer(1, start_ngrok)
    thread.setDaemon(True)
    thread.start()
    old_run()

old_run = app.run
app.run = new_run

app.run()