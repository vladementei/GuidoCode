import cv2
import numpy
from midiutil.MidiFile import MIDIFile
from image_modifier import draw_countours, black_white

key = {8: 64, 7: 65, 6: 67, 5: 69, 4: 71, 3: 72, 2: 74, 1: 76, 0: 77}
keytxt = {8: "E", 7: "F", 6: "G", 5: "A", 4: "B", 3: "c", 2: "d", 1: "e", 0: "f", 404: "|\n"}
countour_color = (0, 0, 0);

class note:
    name=""
    dlit=""

    def __init__(self,name,dlit):
        self.name=name
        self.dlit=dlit

###
def convert_midi_to_text(song):
    text="";

    for elem in song:
        text =text+ keytxt[elem.name]

        if elem.dlit != "tact":
            if elem.dlit == "note-half":
                text = text + "4"
            else:
                text = text + "2"

        text = text + " "
    print('text_midi',text)
    return text



def convert_midi(song, file_name):
    mf = MIDIFile(1)
    track = 0
    time = 0
    mf.addTrackName(track, time, "Music")
    mf.addTempo(track, time, 60)
    channel = 0
    volume = 120

    for elem in song:
        if elem.dlit!="tact":
            if elem.dlit == "note-half":
                duration = 0.5
            else:
                duration = 0.25

            pitch = key[elem.name]
            mf.addNote(track, channel, pitch, time, duration, volume)
            time = time + duration

    with open(file_name + '.mid', 'wb') as outf:
        mf.writeFile(outf)




def find_lines(stave_up_pix, stave_low_pix, left_pos, right_pos, file):
    width = int(file.shape[1])
    # color = countour_color;
    hor_cursor = int(right_pos) + 1
    step = -(hor_cursor - int(left_pos) + 1) #to skeep all horiz positions inside note
    #num_iter = 0
    black_lines = []
    while len(black_lines) != 5: #goal is to find 5 lines
        #num_iter += 1
        black_lines = []
        vert_cursor = stave_up_pix
        while vert_cursor <= stave_low_pix: #vertical position changes down till low position of clef
            gray_color = file[vert_cursor][hor_cursor] #get current pixel
            if (gray_color != 0):  # white, skip
                vert_cursor += 1
            else:
                line_pos = []
                line_pos.append(vert_cursor)# add upper bound of line
                while (gray_color == 0): #skip all black pixels
                    vert_cursor += 1
                    gray_color = file[vert_cursor][hor_cursor]
                line_pos.append(vert_cursor - 1) #add lower bound of line
                black_lines.append(line_pos)

        hor_cursor += step
        step = -step #step always change direction (left, right)
        step += numpy.sign(step)
        if (hor_cursor >= width or hor_cursor <= 0): #prevent out of bounds
            hor_cursor += step
            step = -step
            step += numpy.sign(step)

        for i in range(0, len(black_lines) - 2):  # check distance between lines
            if ((((black_lines[i + 2][0] - black_lines[i + 1][0]) / (
                    black_lines[i + 1][0] - black_lines[i][0])) >= 1.2) or
                    (((black_lines[i + 1][0] - black_lines[i][0]) / (black_lines[i + 2][0] - black_lines[i + 1][
                        0])) >= 1.2)):  # distance between lines isn't ~equal
                black_lines = []
                break

    #print("Num iterations:", num_iter)
    #print("Horizontal pos: ", hor_cursor + step)
    answer = []
    for i in range(0, len(black_lines) - 1):
        answer.append((black_lines[i][0] + black_lines[i][1]) / 2)  # add black line
        answer.append((black_lines[i][1] + black_lines[i + 1][0]) / 2)  # add line between two black
    answer.append((black_lines[len(black_lines) - 1][0] + black_lines[len(black_lines) - 1][1]) / 2)
    return answer


def convert_song(detection, file_name):
    song = []  # notes of hole song
    # countoured_file = draw_countours(cv2.imread(file_name), countour_color)
    thresh_file = black_white(cv2.imread(file_name))
    clefs = [x for x in detection if x['name'] == 'treble clef']  # find all clefs
    # filter clefs because decetor could find two exactly same clefs
    filteredClefs = [clefs[0]]
    for i in range(1, len(clefs)):
        if clefs[i]['box_points'][1] > clefs[i - 1]['box_points'][3]:  # next clef can't cross previous
            filteredClefs.append(clefs[i])
    for clef in filteredClefs:
        stanNotes = []
        stanNotes = [y for y in detection if
                     y['box_points'][1] > clef['box_points'][1] and y['box_points'][3] < clef['box_points'][3] and y[
                         'name'] != 'treble clef']  # find notes belonging to current clef
        stanNotes.sort(key=lambda y: y['box_points'][0], reverse=False)  # sort notes of stan by x coordinate
        # filter stanNotes because detector could find two exactly same notes
        filteredStanNotes = [stanNotes[0]]
        for i in range(1, len(stanNotes)):
            if stanNotes[i]['box_points'][0] > stanNotes[i - 1]['box_points'][2]:  # notes doesn't croos
                filteredStanNotes.append(stanNotes[i])
            elif stanNotes[i]['percentage_probability'] > stanNotes[i - 1][
                'percentage_probability']:  # if cross choose with better probability
                filteredStanNotes = filteredStanNotes[:-1]  # delete previous, because it's probability worse
                filteredStanNotes.append(stanNotes[i])

        print(filteredStanNotes)

        index = []  # array of stanNotes vertical position
        for singleNote in filteredStanNotes:
            lines = find_lines(clef['box_points'][1], clef['box_points'][3], singleNote['box_points'][0],
                               singleNote['box_points'][2],
                               thresh_file)  # find lines vertical positions of current note
            middle = (singleNote['box_points'][1] + singleNote['box_points'][3]) / 2  # vertical center of note
            min = clef['box_points'][3]  # lower bound of clef
            best_index = -1
            for currLine in range(0, len(lines)):
                if abs(lines[currLine] - middle) < min:  # find nearest line
                    min = abs(lines[currLine] - middle)
                    best_index = currLine
            index.append(best_index)
            print(best_index)

        print("----\n")

        curr = 0
        for element in filteredStanNotes:  # adding notes and there vertical postion to global song array
            song.append(note(index[curr], element['name']))
            curr = curr + 1

        song.append(note(404, "tact"))

    return song