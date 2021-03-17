from imageai.Detection.Custom import CustomObjectDetection
from PIL import Image, ImageDraw
from flask_ngrok import run_with_ngrok
import os
from flask import Flask, request, redirect, url_for, send_from_directory, send_file
from midiutil.MidiFile import MIDIFile
import tensorflow as tf

detector = CustomObjectDetection()
detector.setModelTypeAsYOLOv3()
detector.setModelPath("/content/drive/My Drive/Colab Notebooks/last-detect.h5")
detector.setJsonPath("/content/drive/My Drive/Colab Notebooks/best-conf.json")
detector.loadModel()
graph = tf.get_default_graph()

# Tanya: midi library + key to convert index to midi number
key = { 8: 64,7: 65,6:67,5:69,4:71,3:72,2:74,1:76,0:77}
song=[] # Tanya: notes of hole song

# Tanya: function for midi
def convert_midi(list, filename):
    mf = MIDIFile(1)
    track = 0
    time = 0
    mf.addTrackName(track, time, "Christmas tree")
    mf.addTempo(track, time, 60)
    channel = 0
    volume = 120

    for elem in list:
        if elem.dlit == "note-half":
            duration = 0.5
        else:
            duration = 0.25

        pitch = key[elem.name]
        mf.addNote(track, channel, pitch, time, duration, volume)
        time = time + duration


    with open(filename +'.mid', 'wb') as outf:
        mf.writeFile(outf)
        global song
        song = []

#-----------------

class note:
    name=""
    dlit=""

    def __init__(self,name,dlit):
        self.name=name
        self.dlit=dlit

class Stan:
    notes=[]
    upperBoard=0
    lowerBoard=0
    lines=[]


    def __init__(self,upperBoar,lowerBoard):
        self.upperBoard=upperBoar
        self.lowerBoard=lowerBoard

def find_lines(stave_up_pix, stave_low_pix,filename):
    image = Image.open(filename)
    width = image.size[0]
    height = image.size[1]
    pix = image.load()
    factor = 1# change this param depends on image
    step = width // 100
    cur_pos = width // 2
    num_iter = 0
    arr = []
    while len(arr) != 5:
        num_iter+=1
        arr = []
        i = stave_up_pix
        while i <= stave_low_pix:
            a = pix[cur_pos, i][0]
            b = pix[cur_pos, i][1]
            c = pix[cur_pos, i][2]
            S = a + b + c

            if (S > (((255 + factor) // 2) * 3)):
                # white
                i+=1
            else:
                # black
                line_pos = []
                line_pos.append(i)
                while (S <= (((255 + factor) // 2) * 3)):
                    i+=1
                    a = pix[cur_pos, i][0]
                    b = pix[cur_pos, i][1]
                    c = pix[cur_pos, i][2]
                    S = a + b + c
                line_pos.append(i-1)
                arr.append(line_pos)

        cur_pos += step
        if(cur_pos >= width):
            step = -width // 100
            cur_pos = width // 2
        if(cur_pos <= 0):
            cur_pos = width // 2
            step = 1


        for j in range(0, len(arr)-2):
            if (((arr[j+2][0] - arr[j+1][0]) / (arr[j+1][0] - arr[j][0]) >= 1.2) | ((arr[j+1][0] - arr[j][0]) / (arr[j+2][0] - arr[j+1][0]) >= 1.2)):
                arr = []
                break

    # print(num_iter)
    # print(cur_pos - step)
    answer=[]
    for i in range (0,len(arr)-1):
        answer.append((arr[i][0]+arr[i][1])/2)
        answer.append(((arr[i][0]+arr[i][1])/2+(arr[i+1][0]+arr[i+1][1])/2)/2)
    answer.append((arr[len(arr)-1][0]+arr[len(arr)-1][1])/2)
    return answer

def f(detection, file_name):
    notes=[x for x in detection if x['name']=='treble clef']
    filtered =[notes[0]]
    for i in range (1,len(notes)):
        if notes[i]['box_points'][1]>notes[i-1]['box_points'][3]:
            filtered.append(notes[i])
    stan=[]
    for x in filtered:
        stanNotes=[]
        stan.append(Stan(x['box_points'][1],x['box_points'][3]))
        stanNotes=[y for y in detection if y['box_points'][1]>x['box_points'][1] and y['box_points'][3]<x['box_points'][3] and y['name']!='treble clef']
        stanNotes.sort(key=lambda y: y['box_points'][0],reverse=False)
        filteredStanNotes=[stanNotes[0]]
        for i in range(1, len(stanNotes)):
            if stanNotes[i]['box_points'][0] > stanNotes[i - 1]['box_points'][2]:
                filteredStanNotes.append(stanNotes[i])
            elif stanNotes[i]['percentage_probability']>stanNotes[i-1]['percentage_probability']:
                filteredStanNotes=filteredStanNotes[:-1]
                filteredStanNotes.append(stanNotes[i])
        print(filteredStanNotes)
        lines=find_lines(x['box_points'][1],x['box_points'][3],file_name)
        print(lines)
        index=[] # Tanya:
        for singleNote in filteredStanNotes:
            middle=(singleNote['box_points'][1]+singleNote['box_points'][3])/2
            min =x['box_points'][3]
            best_index=-1
            for currLine in range (0,len(lines)):
                if abs(lines[currLine]-middle)<min:
                    min =abs(lines[currLine]-middle)
                    best_index=currLine
            index.append(best_index) # Tanya:
            print(best_index) # доделать
        print("----\n")

# Tanya: add note to the song
        curr=0
        for element in filteredStanNotes:
            song.append(note(index[curr],element['name']))
            curr=curr+1
#------------------------------------
    return notes


UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

app = Flask(__name__)
# with app.app_context():
#     detector = CustomObjectDetection()
#     detector.setModelTypeAsYOLOv3()
#     detector.setModelPath("detection_model-ex-010--loss-0018.884.h5")
#     detector.setJsonPath("detection_config.json")
#     detector.loadModel()
#
#     # Tanya: midi library + key to convert index to midi number
#     key = {8: 64, 7: 65, 6: 67, 5: 69, 4: 71, 3: 72, 2: 74, 1: 76, 0: 77}


def allowed_file(filename):
    return filename[-3:].lower() in ALLOWED_EXTENSIONS


@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        img_notes = request.files['file']
        if img_notes and allowed_file(img_notes.filename):
            print ('**found file', img_notes.filename)
            img_notes.save(img_notes.filename)
            while not os.path.exists(img_notes.filename):
                time.sleep(1)

            # detector = CustomObjectDetection()
            # detector.setModelTypeAsYOLOv3()
            # detector.setModelPath("detection_model-ex-010--loss-0018.884.h5")
            # detector.setJsonPath("detection_config.json")
            # detector.loadModel()
            global graph
            with graph.as_default():

                detections = detector.detectObjectsFromImage(
                    input_image=img_notes.filename,
                    #input_image=img_notes.filename,
                    output_image_path="detected.jpg",
                    minimum_percentage_probability=70,
                    display_object_name=True,
                    display_percentage_probability=True
                )
                # print(detections)
                f(detections, img_notes.filename)

                # Tanya: convert midi
                convert_midi(song, img_notes.filename)

                # for elem in song:
                #     print(elem.dlit)
                #     print(elem.name)
                # ---------------


            #img_notes.save(img_notes.filename)
            with open(img_notes.filename+'.mid', 'rb') as midi_file:
                leader = midi_file.read(4)
                if leader != b'MThd':
                    raise ValueError('Not a MIDI file!')
            #midi_file = open('avicii.mid', 'rb', encoding="ANSI")
            #midi_file.write('Some music!!!')
            #midi_file.close()
            #midi_file = open('E:\\Python\\MusicServer\\venv\\uploaded\\img.png','rb')
            print('server_success')
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
app.run()