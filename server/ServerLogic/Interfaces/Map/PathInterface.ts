import NodeInterface from "./NodeInterface";

export default interface PathInterface {
    path: NodeInterface[];

    isValid(): boolean;
}