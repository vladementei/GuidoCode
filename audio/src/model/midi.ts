import {IsDefined} from "class-validator";

export class Song {
    @IsDefined()
    length?: string;
}
