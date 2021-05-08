import {Node, NodeType} from "../model";
import {HttpError} from "routing-controllers";

const {spawn} = require("child_process");
const kill = require('kill-port')

class AudioNodesService {

    private activeNodes: Node[] = [];

    public getActiveNodes(): Node[] {
        return this.activeNodes;
    }

    public createNode(port: number): Promise<Node[]> {
        const audioProcess = spawn('node', ['../audio/build/index.js', port], {
            detached: true
        });
        //console.log(audioProcess.pid);

        return new Promise((resolve, reject) => {

            audioProcess.stdout.once("data", (data: any) => {
                console.log(`Audio server: ${data}`);
                audioProcess.unref();
                const newNode = {
                    type: NodeType.AUDIO,
                    url: `http://localhost:${port}`
                }
                this.connectNode(newNode);
                resolve(this.activeNodes);
            });

            audioProcess.once("close", (code: any, signal: any) => {
                //npx kill-port 8080
                console.log(`Audio process exited with code ${code}`);
                reject(new HttpError(500, `Port already in use`));
            });
        });
    }

    public connectNode(node: Node): void {
        this.activeNodes.push(node);
    }

    public killNodeByPort(port: number): Promise<Node[]> {
        return new Promise((resolve, reject) => {
            kill(port, "tcp")
                .then((res: any) => {
                    this.activeNodes = this.activeNodes.filter(node => !node.url.endsWith(port.toString()));
                    if (!res.code) {
                        resolve(this.activeNodes);
                    } else {
                        reject(new HttpError(500, `No nodes on port ${port}`));
                    }
                })
        });
    }
}

export const audioNodesService = new AudioNodesService();
