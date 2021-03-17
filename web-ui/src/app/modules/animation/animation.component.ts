import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {RxUnsubscribe} from '../../core/services/rx-unsubscribe';
import abcjs from 'abcjs';
import * as soundFont from 'soundfont-player';//all instuments here https://raw.githubusercontent.com/danigb/soundfont-player/master/names/fluidR3.json
import {Store} from '@ngxs/store';
import {FormControl, Validators} from '@angular/forms';
import * as soundKeys from '../../../assets/data/note-to-sound.json';
import {RestService} from "../../core/services/rest-service.service";
import {take} from "rxjs/operators";


export enum Instruments {
  PIANO = 'bright_acoustic_piano',
  VIOLIN = 'violin',
  GUITAR = 'acoustic_guitar_steel',
}


@Component({
  selector: 'animation',
  templateUrl: './animation.component.html',
  styleUrls: ['./animation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationComponent extends RxUnsubscribe implements OnInit {

  @ViewChild('musicSheet') musicSheet;
  @ViewChild('musicInput') musicInput;
  musicSheetWidth = 700;
  musicEditor;
  timingCallbacks;
  isAnimationWorks: boolean = undefined;
  isEditing: boolean = false;
  newNoteValueControl = new FormControl('', [Validators.required, Validators.pattern(/[a-gA-G][0-9]/), Validators.maxLength(2)]);
  music: string;
  selectedNote;
  selectedNoteView;
  selectedInstrument: Instruments = Instruments.PIANO;
  instruments = Instruments;
  cursorScroller: number;
  isMobileView: boolean = false;
  private selectedMidiFile: File;


  constructor(private cdr: ChangeDetectorRef,
              private restService: RestService,
              private store: Store) {
    super();
  }

  ngOnInit(): void {
    // this.init('G4 c4 d2 d2 d2 B2 A4 A4 A4 d4 |\n' +
    //   ' d2 e2 e2 c2 B4 G4 B4 e4 e2 f2 e2 e2 |\n' +
    //   ' B4 G2 G2 d2 B4 c4 |\n' +
    //   ' c4 c2 d2 c2 B2 A4 A4 A4 d4 |\n' +
    //   ' d2 e2 d2 c2 B2 G2 B2 e4 e2 f2 e2 d2 |\n' +
    //   ' d4 A4 G2 G2 A4 d2 B4 c4 |');
  }

  init(newMusic: string): void {
    console.log('init');

    this.isAnimationWorks = undefined;
    this.isEditing = false;
    this.newNoteValueControl.setValue('');
    this.music = null;
    this.selectedNote = null;
    this.selectedNoteView = null;

    this.stopCursorScroller();
    if (this.timingCallbacks) {
      this.timingCallbacks.stop();
    }
    this.isMobileView = this.store.selectSnapshot(state => state.root.isEmbedded);
    this.music = this.updateMusicSheetToView(newMusic);
    this.cdr.detectChanges();

    const abcjsParams: any = {
      add_classes: true,
      dragging: true,
      clickListener: (abcelem, tuneNumber, classes, analysis, drag, mouseEvent) => {
        console.log(abcelem, tuneNumber, classes, analysis, drag, mouseEvent);
        if (this.selectedNoteView === document.getElementsByClassName(classes)[0]) {
          document.getElementsByClassName(classes)[0].setAttribute('fill', '#000000');
          this.selectedNoteView = null;
          this.selectedNote = null;
          this.cancelEditor();
        } else {
          this.selectedNoteView = document.getElementsByClassName(classes)[0];
          this.selectedNote = abcelem;
        }
        this.newNoteValueControl.setValue(this.music.slice(abcelem.startChar, abcelem?.endChar)?.trim() || '');
        this.cdr.detectChanges();
      }
    };
    if (this.isMobileView) {
      abcjsParams.staffwidth = 80000;
    }
    this.musicEditor = new abcjs.Editor(
      'musicInput', {
        paper_id: 'musicSheet',
        warnings_id: 'warnings',
        abcjsParams: abcjsParams
      }
    );

    if (this.isMobileView) {
      this.updateMusicSheetWidth();
    }

    this.cdr.detectChanges();
  }

  uploadMidi(file: File): void {
    if (file) {
      this.restService.convertMidiToNotes(file)
        .pipe(take(1))
        .subscribe((response) => {
          console.log('new notes', response);
          this.init(response);
        });
    }
    this.selectedMidiFile = file;
  }

  downloadMidi(): void {
    const midiString = 'hello I am midi file';//TODO real midi file
    const blob = new Blob([midiString], {type: 'audio/mid'});
    const link = document.createElement('a');
    link.download = 'music';
    link.href = window.URL.createObjectURL(blob);
    link.click();
    console.log('download midi');
  }

  animate(): void {
    this.stopCursorScroller();
    if (this.timingCallbacks) {
      this.timingCallbacks.stop();
    }
    const params = {showCursor: true};
    const sheet = this.musicSheet.nativeElement;
    const audioContext = new AudioContext();
    this.timingCallbacks = new abcjs.TimingCallbacks(this.musicEditor.tunes[0], {
      eventCallback: (midiEvent) => {
        if (midiEvent) {
          const note = this.music.slice(midiEvent.startChar, midiEvent?.endChar)?.trim();
          if (note) {
            // @ts-ignore
            const soundNote: string = soundKeys.default[note];
            console.log(note, soundNote);
            soundFont.instrument(audioContext, this.selectedInstrument).then((player) => {
              player.play(soundNote);
            });
          }
        } else {
          console.log('end');
          this.isAnimationWorks = undefined;
          this.stopCursorScroller();
          this.cdr.detectChanges();
        }
      }
    });
    abcjs.startAnimation(sheet, this.musicEditor.tunes[0], params);
    this.timingCallbacks.start();
    this.isAnimationWorks = true;

    if (this.isMobileView) {
      const cursor = document.getElementsByClassName('abcjs-cursor cursor')[0];
      this.cursorScroller = window.setInterval(() => cursor.scrollIntoView({behavior: 'smooth', inline: 'center'}), 500);
    }
  }

  pause(): void {
    this.stopCursorScroller();
    abcjs.pauseAnimation(this.isAnimationWorks);
    this.isAnimationWorks ? this.timingCallbacks.pause() : this.timingCallbacks.start();
    this.isAnimationWorks = !this.isAnimationWorks;
  }

  stopCursorScroller(): void {
    if (this.cursorScroller) {
      clearInterval(this.cursorScroller);
      this.cursorScroller = null;
    }
  }

  updateMusicSheetWidth(): void {
    const width: number = Math.floor((this.musicSheet?.nativeElement?.firstChild?.lastChild?.x?.baseVal?.value || this.musicSheetWidth) + 40);
    if (this.musicSheet?.nativeElement?.firstChild?.width?.baseVal?.value && width) {
      this.musicSheet.nativeElement.firstChild.width.baseVal.value = width;
      this.musicSheetWidth = width;
    }
  }

  updateMusicSheetToView(music: string): string {
    return this.isMobileView ? music.replace(/[\|\n]/g, '') : music;
  }

  onMusicChange() {
    this.cdr.detectChanges();
    setTimeout(() => {
      this.updateMusicSheetWidth();
      this.cdr.detectChanges();
    }, 400);
  }

  cancelEditor(): void {
    this.isEditing = false;
  }

  saveChanges(): void {
    this.cancelEditor();
    this.music = this.music.slice(0, this.selectedNote.startChar).trim() + ' ' + this.newNoteValueControl.value + ' ' + this.music.slice(this.selectedNote.endChar).trim();
    this.musicInput.nativeElement.value = this.music;
    this.musicInput.nativeElement.__zone_symbol__ON_PROPERTYmouseup();
    this.selectedNoteView = null;
    if (this.isMobileView) {
      this.onMusicChange();
    }
  }
}
