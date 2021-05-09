import {LoadedNode, Node, NodeType} from "../model";
import {HttpError} from "routing-controllers";

const {spawn} = require("child_process");
const kill = require('kill-port')

class AudioNodesService {

    private activeNodes: LoadedNode[] = [
        {
            type: NodeType.AUDIO,
            url: "http://localhost:8090",
            loaded: 0
        }
    ];

    public getActiveNodes(): Node[] {
        return this.activeNodes.map(node => {
            return {
                type: node.type,
                url: node.url
            }
        });
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
                this.connectNode({
                    type: NodeType.AUDIO,
                    url: `http://localhost:${port}`,
                });
                resolve(this.getActiveNodes());
            });

            audioProcess.once("close", (code: any, signal: any) => {
                //npx kill-port 8080
                console.log(`Audio process exited with code ${code}`);
                reject(new HttpError(500, `Port already in use`));
            });
        });
    }

    public connectNode(node: Node): void {
        this.activeNodes.push({
            ...node,
            loaded: 0
        });
    }

    public killNodeByPort(port: number): Promise<Node[]> {
        return new Promise((resolve, reject) => {
            kill(port, "tcp")
                .then((res: any) => {
                    this.activeNodes = this.activeNodes.filter(node => !node.url.endsWith(port.toString()));
                    if (!res.code) {
                        resolve(this.getActiveNodes());
                    } else {
                        reject(new HttpError(500, `No nodes on port ${port}`));
                    }
                })
        });
    }

    public getActiveNode(): LoadedNode {
        return this.activeNodes[0];
    }

    public increaseLoading(node: LoadedNode): void {
        node.loaded++;
        console.log(node)
    }

    public decreaseLoading(node: LoadedNode): void {
        node.loaded--;
        console.log(node);
    }
}

export const audioNodesService = new AudioNodesService();
