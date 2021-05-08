import {Node, NodeType} from "../model";
import {HttpError} from "routing-controllers";

const {spawn} = require("child_process");

class AudioNodesService {

    private activeNodes: Node[] = [];

    public getActiveNodes(): Node[] {
        return this.activeNodes;
    }

    public createNode(port: number): Promise<Node> {
        const audioProcess = spawn('node', ['../audio/build/index.js', port], {
            detached: true
        });
        //console.log(audioProcess.pid);

        return new Promise((resolve, reject) => {
            let created: boolean = false;

            audioProcess.stdout.once("data", (data: any) => {
                console.log(`Audio server: ${data}`);
                audioProcess.unref();
                const newNode = {
                    type: NodeType.AUDIO,
                    url: `http://localhost:${port}`
                }
                this.activeNodes.push(newNode);
                created = true;
                resolve(newNode);
            });

            audioProcess.once("close", (code: any, signal: any) => {
                //npx kill-port 8080
                console.log(`Audio process exited with code ${code}`);
                if (created) {
                    this.activeNodes = this.activeNodes.filter(node => !node.url.endsWith(port.toString()));
                }
                reject(new HttpError(500, `Port already in use`));
            });
        });
    }
}

export const audioNodesService = new AudioNodesService();
