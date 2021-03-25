import {Body, Controller, Get, HttpError, Param, Post, Req, Res, UseBefore} from "routing-controllers"
import "reflect-metadata";
import axios from "axios";
import {removeCors} from "../middleware";
import {AppRoutes} from "../constants";
import {converter} from "../mocks";
import {Request, Response} from "express";
import {UploadedFile} from "express-fileupload";

class ConverterRoutes {
    public static readonly ID = "id";
    public static readonly NOTES = "notes";
    public static readonly MIDI = "midi";
}

class AudioServerError extends HttpError {
    constructor(error: HttpError) {
        super(error.httpCode, `Error from audio server: ${error.message}`);
    }
}

@Controller()
@UseBefore(removeCors)
// @UseInterceptor((action: Action, content: any) => {
//     return httpContext.get('project');
// })
export class ConverterController {
    @Get(`${AppRoutes.CONVERTER}/:${ConverterRoutes.ID}`)
    getOne(@Param(ConverterRoutes.ID) id: number) {
        return converter;
    }

    // @Post(`${AppRoutes.CONVERTER}/:${ConverterRoutes.ID}`)
    // @OnUndefined(204)
    // postOne(@Param(ConverterRoutes.ID) id: number, @Body() song: Song) {
    //     console.log(JSON.stringify(song));
    //     return undefined;
    // }
    //@OnUndefined(400)
    @Post(`${AppRoutes.CONVERTER}/${ConverterRoutes.NOTES}`)
    notesFromMidi(@Req() request: Request, @Res() response: Response) {
        const midiFile: UploadedFile = request.files?.file as UploadedFile;
        if (!midiFile) {
            throw new HttpError(400, "Request must contain file with key 'file'");
        }

        const uploadPath: string = `${process.env.FILE_DB_PATH}audio/${midiFile.name}`;
        return new Promise((resolve, reject) => {
            midiFile.mv(uploadPath, err => {
                if (err) {
                    console.error(err.message);
                    reject(new HttpError(400, `Can't save file ${midiFile.name}; ${err.message}`));
                    return;
                }
                resolve(axios.get(`http://localhost:8081/midi/notes/${midiFile.name}`)
                    .then(response => response.data)
                    .catch(({response}) => {
                        throw new AudioServerError(response.data.error);
                    }));
            })
        });
    }

    @Post(`${AppRoutes.CONVERTER}/${ConverterRoutes.MIDI}`)
    midiFromNotes(@Body() notes: string) {
        return new Promise((resolve, reject) => {
            resolve(axios.post(`http://localhost:8081/midi/midi`, notes, {headers: {"Content-Type": "text/plain"}})
                .then(response => response.data)
                .catch(({response}) => {
                    throw new AudioServerError(response.data.error);
                }));
        })
    };
}
