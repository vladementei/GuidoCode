export enum NodeType {
    AUDIO = "audio",
    RECOGNITION = "recognition"
}
export interface Node {
    type: NodeType;
    url: string;
}
