// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { GameConfig, GameState } from "./GameConfig";

const { ccclass, property } = cc._decorator;


@ccclass
export default class GameController extends cc.Component {

    @property(cc.Node) fruitsNode: cc.Node = null;
    @property(cc.Button) playButton: cc.Button = null;
    @property(cc.Button) pauseButton: cc.Button = null;
    @property(cc.Button) directionButton: cc.Button = null;
    @property(cc.SpriteFrame) startButtonSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) stopButtonSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame) playButtonSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) pauseButtonSprite: cc.SpriteFrame = null;

    private startStopButton: cc.Sprite = null;
    private playPauseButton: cc.Sprite = null;
    private currentGameState = GameState.Start;
    private fruitsNodeChilds = null;

    private initialFruitsNodeChildsPosition: cc.Vec3[] = [];
    private currentFruitsNodeChildsPosition: cc.Vec3[] = [];

    private moveDown = true;
    // LIFE-CYCLE CALLBACKS:
    private rollConfig: GameConfig = {
        speed: 25,
        topPosition: 382.405,
        bottomPosition: -256.375
    }

    // onLoad () {}

    start() {
        this.startStopButton = this.playButton.getComponentInChildren(cc.Sprite);
        this.startStopButton.spriteFrame = this.startButtonSprite;
        this.playPauseButton = this.pauseButton.getComponentInChildren(cc.Sprite);
        this.playPauseButton.spriteFrame = this.pauseButtonSprite;
        this.fruitsNodeChilds = this.fruitsNode.children;
        for (let index = 0; index < this.fruitsNodeChilds.length; index++) {
            this.initialFruitsNodeChildsPosition[index] = this.fruitsNodeChilds[index].position;
        }
    }

    onUpButtonClick() {
        this.snapFruitsPosition();
        this.currentGameState = GameState.RollingUp;
        this.changeButtonState();
    }
    onDownButtonClick() {
        this.snapFruitsPosition();
        this.currentGameState = GameState.RollingDown;
        this.changeButtonState();
    }

    private snapPoints: number[] = [-256.375, -128.627, -0.869, 126.889, 254.647, 382.405];

    // Function to find the nearest snap point
    private getNearestSnapPoint(y: number): number {
        return this.snapPoints.reduce((prev, curr) =>
            Math.abs(curr - y) < Math.abs(prev - y) ? curr : prev
        );
    }

    snapFruitsPosition(){
        this.fruitsNodeChilds.forEach((node: cc.Node, index: number) => {
            this.currentFruitsNodeChildsPosition[index] = node.position;
            const nearestSnap = this.getNearestSnapPoint(node.position.y);

            cc.tween(node)
                // .to(0.1, { position: cc.v3(0, nearestSnap, 0) }, { easing: 'cubicOut' }) 
                .to(0.1, { position: cc.v3(0, nearestSnap, 0) }) 
                .start();
        });

        // Log current positions for debugging
        cc.log(this.currentFruitsNodeChildsPosition);
    }

    onPlayPauseButtonClick() {
        if (this.currentGameState === GameState.RollingDown || this.currentGameState === GameState.RollingUp) {
            this.snapFruitsPosition();
            // Update state
            this.currentGameState = GameState.Pause;
            this.changeButtonState();
        }
    }


    onStartStopClick() {
        if (this.currentGameState === GameState.RollingDown) {
            this.currentGameState = GameState.End;
            return;
        }
        if (this.currentGameState === GameState.Start || this.currentGameState === GameState.End) {
            this.currentGameState = GameState.RollingDown;
            this.changeButtonState();
        }

        // cc.tween(this.fruitsNode)
        //     .by(4, {position: cc.v3(0,-500,0) })
        //     .start();
    }

    changeButtonState() {
        if (this.currentGameState === GameState.Start || this.currentGameState === GameState.End) {
            this.startStopButton.spriteFrame = this.startButtonSprite;
            this.playPauseButton.spriteFrame = this.pauseButtonSprite;
        } else {
            this.startStopButton.spriteFrame = this.stopButtonSprite;
            this.playPauseButton.spriteFrame = this.pauseButtonSprite;
        }
        if (this.currentGameState === GameState.Pause) {
            this.playPauseButton.spriteFrame = this.playButtonSprite;
        }
    }

    startRollingDown(dt) {
        this.fruitsNodeChilds.forEach((value: cc.Node) => {
            value.position = value.position.add(cc.v3(0, -this.rollConfig.speed, 0));
            if (value.position.y <= this.rollConfig.bottomPosition) {
                value.position = cc.v3(0, this.rollConfig.topPosition, 0);
            }
        });
    }
    startRollingUp(dt) {
        this.fruitsNodeChilds.forEach((value: cc.Node) => {
            value.position = value.position.add(cc.v3(0, this.rollConfig.speed, 0));
            if (value.position.y >= this.rollConfig.topPosition) {
                value.position = cc.v3(0, this.rollConfig.bottomPosition, 0);
            }
        });
    }

    update(dt) {
        if (this.currentGameState === GameState.RollingDown) {
            this.startRollingDown(dt);
        }
        if (this.currentGameState === GameState.RollingUp) {
            this.startRollingUp(dt);
        }
        if (this.currentGameState === GameState.End) {
            this.currentGameState = GameState.Start;
            this.changeButtonState();
        }
    }
}
