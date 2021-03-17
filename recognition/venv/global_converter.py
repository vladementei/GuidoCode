from collections import namedtuple

from threading import Timer
from flask_ngrok import _run_ngrok
from server_ip_writer import write_api_address
import cv2
from flask_ngrok import run_with_ngrok
import os
from flask import Flask, request, redirect, url_for, send_from_directory, send_file,  render_template
from imageai.Detection.Custom import CustomObjectDetection
from image_modifier import warp_image
from convert_utils_1 import convert_song, convert_midi, convert_midi_to_text
import tensorflow as tf

detector = CustomObjectDetection()
detector.setModelTypeAsYOLOv3()
detector.setModelPath("detection\\last-detect.h5")
detector.setJsonPath("detection\\best-conf.json")
detector.loadModel()
graph = tf.get_default_graph()

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = set(['png', 'jpg'])

app = Flask(__name__)

Message = namedtuple('Message', 'text')
messages = []
midtxt="hello"
song=[]

def allowed_file(filename):
    return filename[-3:].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        img_notes = request.files['file']
        if img_notes and allowed_file(img_notes.filename):
            print ('**found file', img_notes.filename)
            global messages
            messages = []
            global midtxt
            midtxt = "hello"
            global song
            song = []
            img_notes.save(UPLOAD_FOLDER + '\\' + img_notes.filename)
            while not os.path.exists(UPLOAD_FOLDER + '\\' + img_notes.filename):
                time.sleep(5)

            global graph
            with graph.as_default():

                sliced_image = warp_image(cv2.imread(UPLOAD_FOLDER + '\\' + img_notes.filename), isDebug=False)
                if sliced_image is None:
                    print("Image slice failed, use original image")
                else:
                    print("Image slice succes, override original image")
                    cv2.imwrite(UPLOAD_FOLDER + '\\' + img_notes.filename, sliced_image)

                detections = detector.detectObjectsFromImage(
                    input_image=UPLOAD_FOLDER + '\\' + img_notes.filename,
                    output_image_path=UPLOAD_FOLDER + '\\' + "detected.jpg",
                    minimum_percentage_probability=70,
                    display_object_name=True,
                    display_percentage_probability=True
                )
                song = convert_song(detections, UPLOAD_FOLDER + '\\' + img_notes.filename)
                convert_midi(song, UPLOAD_FOLDER + '\\' + img_notes.filename)
                midtxt = convert_midi_to_text(song)
                messages.append(Message(midtxt))

            with open(UPLOAD_FOLDER + '\\' + img_notes.filename+'.mid', 'rb') as midi_file:
                leader = midi_file.read(4)
                if leader != b'MThd':
                    raise ValueError('Not a MIDI file!')
            print('server_success')
            return send_file(midi_file.name);
    elif request.method == 'GET':
        return render_template('basic.html')
        # return '''
        # <!doctype html>
        # <title>Upload new File</title>
        # <h1>Upload new File</h1>
        # <form action="" method=post enctype=multipart/form-data>
        #   <p><input type=file name=file>
        #      <input type=submit value=Upload>
        # </form>
        # '''

@app.route('/animation', methods=['GET'])
def animation():
    return render_template('animation.html',messages=messages)

def start_ngrok():
    ngrok_address = _run_ngrok()
    #write_api_address(ngrok_address)
    print(f" * Running on {ngrok_address}")
    print(f" * Traffic stats available on http://127.0.0.1:4040")

def new_run():
    thread = Timer(1, start_ngrok)
    thread.setDaemon(True)
    thread.start()
    old_run()

old_run = app.run
app.run = new_run


app.run()
