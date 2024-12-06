// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

enum GameState {
    Start, RollingDown, RollingUp, End
}

@ccclass
export default class GameController extends cc.Component {

    @property(cc.Node) fruitsNode: cc.Node = null;
    @property(cc.Button) playButton: cc.Button = null;
    @property(cc.Button) directionButton: cc.Button = null;
    @property(cc.SpriteFrame) startButtonSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) stopButtonSprite: cc.SpriteFrame = null;

    @property(cc.SpriteFrame) upArrowSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) downArrowSprite: cc.SpriteFrame = null;

    private startStopButton: cc.Sprite = null;
    private directionButtonSprite: cc.Sprite = null;
    private currentGameState = GameState.Start;
    private fruitsNodeChilds = null;

    private moveDown=true;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

        this.startStopButton = this.playButton.getComponentInChildren(cc.Sprite);
        this.startStopButton.spriteFrame = this.startButtonSprite;
        this.directionButtonSprite = this.directionButton.getComponentInChildren(cc.Sprite);
        this.directionButtonSprite.spriteFrame = this.downArrowSprite;
        this.fruitsNodeChilds = this.fruitsNode.children;
    }

    onDirectionButtonClick(){
        cc.log(this.moveDown);
        if(this.moveDown){
            this.moveDown=false;
            this.directionButtonSprite.spriteFrame = this.downArrowSprite;
        }else{
            this.moveDown=true;
            this.directionButtonSprite.spriteFrame = this.upArrowSprite; 
        }
    }

    onStartStopClick() {
        if(this.currentGameState===GameState.RollingDown){
            this.currentGameState=GameState.End;
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
        } else {
            this.startStopButton.spriteFrame = this.stopButtonSprite;
        }
    }

    test = 0;
    startRolling(dt) {
        // this.fruitsNode.position = this.fruitsNode.position.add(cc.v3(0, -7, 0));
        // if(this.fruitsNode.position.y%119==0){

        //     this.fruitsNodeChilds[this.test].position = cc.v3(0,514,0);
        //     this.test++;
        // }
        this.fruitsNodeChilds.forEach((value: cc.Node) => {
            value.position = value.position.add(cc.v3(0, -20, 0));
            if (value.position.y <= -238) {
                value.position = cc.v3(0, 514, 0);
            }
        });


        // for (let index = 0; index < this.fruitsNodeChilds.length; index++) {
        //     if(this.fruitsNodeChilds[index].position.y<=-249){
        //         cc.log("HERE");
        //         this.fruitsNodeChilds[index].position = cc.v3(0,514,0);
        //     }
        // }
    }

    update(dt) {
        if (this.currentGameState === GameState.RollingDown) {
            this.startRolling(dt);
        }
        if(this.currentGameState===GameState.End){
            this.currentGameState=GameState.Start;
            this.changeButtonState();
        }
    }
}
