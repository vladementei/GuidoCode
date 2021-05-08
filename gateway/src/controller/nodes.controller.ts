import {Body, Controller, Get, Param, Post, Put, UseBefore} from "routing-controllers"
import "reflect-metadata";
import {removeCors} from "../middleware";
import {AppRoutes} from "../constants";
import {Node, NodeType} from "../model";
import {audioNodesService} from "../services";

class NodesRoutes {
    public static readonly NODE_TYPE = "type";
}

@Controller()
@UseBefore(removeCors)
export class NodesController {
    @Get(`${AppRoutes.NODES}/:${NodesRoutes.NODE_TYPE}`)
    getActiveNodes(@Param(NodesRoutes.NODE_TYPE) id: NodeType): Node[] {
        return audioNodesService.getActiveNodes();
    }

    @Post(`${AppRoutes.NODES}/:${NodesRoutes.NODE_TYPE}`)
    createNode(@Param(NodesRoutes.NODE_TYPE) id: NodeType, @Body() body: { port: number }): Promise<Node> {
        return audioNodesService.createNode(body.port)
    }

    @Put(`${AppRoutes.NODES}/:${NodesRoutes.NODE_TYPE}`)
    connectNode(@Param(NodesRoutes.NODE_TYPE) id: NodeType, @Body() body: { url: string }): Node[] {
        audioNodesService.connectNode({
            type: id,
            url: body.url
        });
        return audioNodesService.getActiveNodes();
    }
}
