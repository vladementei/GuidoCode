import {Controller, Get, Param, Post, UseBefore} from "routing-controllers"
import "reflect-metadata";
import {removeCors} from "../middleware";
import {AppRoutes} from "../constants";
import {Node, NodeType} from "../model";

class NodesRoutes {
    public static readonly NODE_TYPE = "type";
}

@Controller()
@UseBefore(removeCors)
export class NodesController {
    @Get(`${AppRoutes.NODES}/:${NodesRoutes.NODE_TYPE}`)
    getActiveNodes(@Param(NodesRoutes.NODE_TYPE) id: NodeType): Node[] {
        return [{type: id, url: "http://localhost:8080"}];
    }

    @Post(`${AppRoutes.NODES}/:${NodesRoutes.NODE_TYPE}`)
    createNode(@Param(NodesRoutes.NODE_TYPE) id: NodeType): Node {
        return {
            type: id,
            url: "http://localhost:8080"
        };
    }
}
