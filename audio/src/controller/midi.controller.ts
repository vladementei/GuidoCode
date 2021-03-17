import {Body, Controller, Get, HttpError, Param, Post, UseBefore} from "routing-controllers"
import "reflect-metadata";
import {removeCors} from "../middleware";
import {AppRoutes} from "../constants";
// @ts-ignore
import * as midiParser from "midi-parser-js";
import * as MidiWriter from "midi-writer-js";
import {midiToNotes} from "../services/midi-to-notes.function";

const fs = require("fs");

class MIDIRoutes {
    public static readonly NOTES = "notes";
    public static readonly MIDI = "midi";
    public static readonly FILE_NAME = "fileName";
}

@Controller()
@UseBefore(removeCors)
export class MidiController {
    @Get(`${AppRoutes.MIDI}/${MIDIRoutes.NOTES}/:${MIDIRoutes.FILE_NAME}`)
    getNotesFromMidi(@Param(MIDIRoutes.FILE_NAME) fileName: string) {
        return new Promise((resolve, reject) => {
            fs.readFile(`${process.env.FILE_DB_PATH}audio/${fileName}`, 'base64', (err: NodeJS.ErrnoException, data: string) => {
                if (err) {
                    reject(new HttpError(400, err.message));
                    return;
                }
                try {
                    const midiArray = midiParser.parse(data);
                    const newMusic: string = midiToNotes(midiArray);
                    resolve(newMusic);
                } catch (e) {
                    console.error(e);
                    reject(new HttpError(500, e.toString()));
                }
            });
        });
    }

    @Post(`${AppRoutes.MIDI}/${MIDIRoutes.MIDI}`)
    getMidiFromNotes(@Body() notes: string) {
        return new Promise((resolve, reject) => {
            //TODO process of conversion notes to midi file
            const track = new MidiWriter.Track();
            track.addTrackName("Music");
            track.setTempo(60);
            track.addEvent(new MidiWriter.NoteEvent({pitch: ['C4'], duration: '4', channel: 0, velocity: 80, startTick: 0}));
            const write = new MidiWriter.Writer(track);
            const file = write.buildFile();
            resolve(file);
        });
    }
}
