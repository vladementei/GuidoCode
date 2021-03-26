import * as jsonNotes from '../configs/note-dictionary.json';

export function notestoMidi(notesstr: any): any {

    var MidiWriter = require('midi-writer-js');
    var tracks = [];
    var track = new MidiWriter.Track();
    var track2 = new MidiWriter.Track();

    track.addInstrumentName("Electric Piano");
    track.addTrackName("Main Track");
    tracks.push(track);

    track2.addInstrumentName("Electric Piano");
    track2.addTrackName("Second Track");

    var notes = notesstr.split("\n").join('').split("|").join('').split("4").join('!4').split("2").join('!2').split(" ");
    var events=[];
    console.log(notesstr.split("\n").join('').split("|").join('').split("4").join('!4').split("2").join('!2').split(" "));

    for(let i=0; i<notes.length-1;i++){
        let temp=notes[i].split("!");
        if(temp.length==1){ // @ts-ignore
            events.push(new MidiWriter.NoteEvent({pitch: [jsonNotes[temp[0]]], duration: '8'}));
        }
        else { // @ts-ignore
            events.push(new MidiWriter.NoteEvent({pitch: [jsonNotes[temp[0]]], duration: jsonNotes[temp[1]]}));
        }
    }

    track2.addEvent(events);
    tracks.push(track2);
    var writer = new MidiWriter.Writer(tracks);

    writer.saveMIDI("testMID2");
    const file = writer.buildFile();
    return file;
}