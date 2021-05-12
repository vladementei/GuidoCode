import {Controller, HttpError, Post, Req, Res, UseBefore} from "routing-controllers"
import "reflect-metadata";
import axios from "axios";
import {removeCors} from "../middleware";
import {AppRoutes} from "../constants";
import {Request, Response} from "express";
import {UploadedFile} from "express-fileupload";
import {recognitionNodesService} from "../services";
import {LoadedNode} from "../model";
import {tokenVerificationGuard} from "../middleware/token-verification";
import {Role} from "../model/role";
import * as fs from "fs";

const FormData = require('form-data');


class RecognitionRoutes {
    public static readonly MIDI = "midi";
}

class RecognitionServerError extends HttpError {
    constructor(error: HttpError) {
        super(error?.httpCode || 500, `Error from recognition server: ${error?.message || "Something went wrong"}`);
    }
}

@Controller()
@UseBefore(removeCors, tokenVerificationGuard([Role.ADMIN, Role.USER]))
export class RecognitionController {

    @Post(`${AppRoutes.RECOGNITION}/${RecognitionRoutes.MIDI}`)
    midiFromPhoto(@Req() request: Request, @Res() response: Response) {
        const photo: UploadedFile = request.files?.file as UploadedFile;
        if (!photo) {
            throw new HttpError(400, "Request must contain file with key 'file'");
        }

        const uploadPath: string = `${process.env.FILE_DB_PATH}photo/${photo.name}`;
        return new Promise((resolve, reject) => {
            photo.mv(uploadPath, err => {
                if (err) {
                    console.error(err.message);
                    reject(new HttpError(400, `Can't save file ${photo.name}; ${err.message}`));
                    return;
                }
                const bodyFormData = new FormData();
                bodyFormData.append('file', fs.createReadStream(uploadPath));
                const node: LoadedNode = recognitionNodesService.getActiveNode();
                recognitionNodesService.increaseLoading(node);
                resolve(axios.post(`${node.url}/`, bodyFormData, {
                    headers: {
                        ...bodyFormData.getHeaders(),
                        responseType: 'arraybuffer'
                    }
                })
                    .finally(() => recognitionNodesService.decreaseLoading(node))
                    .then(response => {
                        const outputFilename = `${process.env.FILE_DB_PATH}audio/file.MID`;
                        fs.writeFileSync(outputFilename, response.data);
                        return fs.readFileSync(outputFilename);//
                    })
                    .catch((response) => {
                        throw new RecognitionServerError(response.data.error);
                    }));
            })

        });
    }
}
