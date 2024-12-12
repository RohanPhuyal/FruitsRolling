// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { GameState } from "./GameConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameStateManager extends cc.Component {

    public static currentGameState: GameState = GameState.Start;
    public static moveDown: boolean = null;
    public static isPauseStarted: boolean = false;
    public static shuffledValues: String[] = [];

    public static textureName = ["Cherry","Apple","Pineapple","Cherry","Apple","Pineapple"];

}
