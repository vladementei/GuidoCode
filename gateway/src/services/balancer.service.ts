import {LoadedNode} from "../model";

export abstract class Balancer {

    protected constructor(protected nodes: LoadedNode[]) {
    }

    abstract pick(): LoadedNode;

    setNodes(nodes: LoadedNode[]): void {
        this.nodes = nodes;
    }
}

export class RoundRobinBalancer extends Balancer {
    private currentIndex: number = -1;

    constructor(protected nodes: LoadedNode[]) {
        super(nodes);
    }

    pick(): LoadedNode {
        this.currentIndex = (this.currentIndex + 1) % this.nodes.length;
        console.log(this.currentIndex);
        return this.nodes[this.currentIndex];
    }
}

export class LeastConnectionsBalancer extends Balancer {

    constructor(protected nodes: LoadedNode[]) {
        super(nodes);
    }

    pick(): LoadedNode {
        let winner = this.nodes[0];
        for (let node of this.nodes) {
            if (node.loaded < winner.loaded) {
                winner = node;
            }
            if (!winner.loaded) {
                return winner;
            }
        }
        return winner;
    }
}

export class PowerOf2ChoicesBalancer extends Balancer {

    constructor(protected nodes: LoadedNode[]) {
        super(nodes);
    }

    pick(): LoadedNode {
        const first = this.nodes[Math.trunc(Math.random() * this.nodes.length)];
        const second = this.nodes[Math.trunc(Math.random() * this.nodes.length)];
        return first.loaded <= second.loaded ? first : second;
    }
}
