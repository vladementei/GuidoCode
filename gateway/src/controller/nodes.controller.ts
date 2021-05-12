import {Body, Controller, Delete, Get, Param, Post, Put, UseBefore} from "routing-controllers"
import "reflect-metadata";
import {removeCors} from "../middleware";
import {AppRoutes} from "../constants";
import {Node, NodeType} from "../model";
import {audioNodesService, recognitionNodesService} from "../services";
import {tokenVerificationGuard} from "../middleware/token-verification";
import {Role} from "../model/role";

class NodesRoutes {
    public static readonly NODE_TYPE = "type";
}

@Controller()
@UseBefore(removeCors, tokenVerificationGuard([Role.ADMIN]))
export class NodesController {
    @Get(`${AppRoutes.NODES}/:${NodesRoutes.NODE_TYPE}`)
    getActiveNodes(@Param(NodesRoutes.NODE_TYPE) id: NodeType): Node[] {
        return (id === NodeType.AUDIO ? audioNodesService : recognitionNodesService).getActiveNodes();
    }

    @Post(`${AppRoutes.NODES}/:${NodesRoutes.NODE_TYPE}`)
    createNode(@Param(NodesRoutes.NODE_TYPE) id: NodeType, @Body() body: { port: number }): Promise<Node[]> {
        return (id === NodeType.AUDIO ? audioNodesService : recognitionNodesService).createNode(body.port);
    }

    @Put(`${AppRoutes.NODES}/:${NodesRoutes.NODE_TYPE}`)
    connectNode(@Param(NodesRoutes.NODE_TYPE) id: NodeType, @Body() body: { url: string }): Node[] {
        (id === NodeType.AUDIO ? audioNodesService : recognitionNodesService).connectNode({
            type: id,
            url: body.url
        });
        return (id === NodeType.AUDIO ? audioNodesService : recognitionNodesService).getActiveNodes();
    }

    @Delete(`${AppRoutes.NODES}/:${NodesRoutes.NODE_TYPE}`)
    killNode(@Param(NodesRoutes.NODE_TYPE) id: NodeType, @Body() body: { port: number }): Promise<Node[]> {
        return (id === NodeType.AUDIO ? audioNodesService : recognitionNodesService).killNodeByPort(body.port);
    }
}
