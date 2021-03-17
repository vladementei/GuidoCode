from flask_ngrok import run_with_ngrok
import os
from flask import Flask, request, redirect, url_for, send_from_directory, send_file
#from werkzeug import secure_filename

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

app = Flask(__name__)
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return filename[-3:].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        img_notes = request.files['file']
        if img_notes and allowed_file(img_notes.filename):
            print ('**found file', img_notes.filename)
            #save_file = open(img_notes.filename, 'wb')
            #save_file.write(img_notes)
            #save_file.close()
            img_notes.save(img_notes.filename)
            while not os.path.exists(img_notes.filename):
                time.sleep(1)
            with open('avicii.mid', 'rb') as midi_file:
                leader = midi_file.read(4)
                if leader != b'MThd':
                    raise ValueError('Not a MIDI file!')
            #midi_file = open('avicii.mid', 'rb', encoding="ANSI")
            #midi_file.write('Some music!!!')
            #midi_file.close()
            #midi_file = open('E:\\Python\\MusicServer\\venv\\uploaded\\img.png','rb')
            return send_file(midi_file.name);
            #return send_file('midi.txt');
    elif request.method == 'GET':
        #midi_file = open('file.txt','w')
        #midi_file.write('welcome to hell')
        #midi_file.close()
        return '''
        <!doctype html>
        <title>Upload new File</title>
        <h1>Upload new File</h1>
        <form action="" method=post enctype=multipart/form-data>
          <p><input type=file name=file>
             <input type=submit value=Upload>
        </form>
        '''

# @app.route('/uploads/<filename>')
# def uploaded_file(filename):
#     return send_from_directory('E:\\Python\\MusicServer\\venv\\uploaded', filename)
run_with_ngrok(app)   #starts ngrok when the app is run
if __name__ == "__main__":
    app.run()