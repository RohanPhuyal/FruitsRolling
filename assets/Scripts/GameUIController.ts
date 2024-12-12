// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { GameState } from "./GameConfig";
import GameController from "./GameController";
import GameStateManager from "./GameStateManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameUIController extends cc.Component {

    public static instance: GameUIController = null;
    //UI Variables

    @property(cc.Button) pauseButton: cc.Button = null;
    @property(cc.SpriteFrame) playButtonSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) pauseButtonSprite: cc.SpriteFrame = null;

    private playPauseButton: cc.Sprite = null;

    @property(cc.SpriteFrame) fruitSprites: cc.SpriteFrame[] = [];


    //function to shuffle the fruit sprites
    private ranodmizeFruits() {
        // Fisher-Yates Sorting Algorithm
        const shuffle = (array: String[]) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        GameStateManager.shuffledValues = shuffle(GameStateManager.textureName);
        this.assignTexture(GameStateManager.shuffledValues);
        
        // const shuffledValues = shuffle(this.fruitSprites);

        // GameController.fruitsNodeChilds[1].children[0].getComponent(cc.Sprite).spriteFrame = shuffledValues[0];
        // GameController.fruitsNodeChilds[2].children[0].getComponent(cc.Sprite).spriteFrame = shuffledValues[1];
        // GameController.fruitsNodeChilds[3].children[0].getComponent(cc.Sprite).spriteFrame = shuffledValues[2];
        // GameController.fruitsNodeChilds[4].children[0].getComponent(cc.Sprite).spriteFrame = shuffledValues[0];
        // GameController.fruitsNodeChilds[5].children[0].getComponent(cc.Sprite).spriteFrame = shuffledValues[1];
        // GameController.fruitsNodeChilds[0].children[0].getComponent(cc.Sprite).spriteFrame = shuffledValues[2];
    }
    assignTexture(shuffledValues){
        GameController.fruitsNodeChilds.forEach((node: cc.Node, index: number) => {
            cc.resources.load(`Texture/${shuffledValues[index]}`, cc.Texture2D, (err, texture: cc.Texture2D) => {
                if (!err) {
                    const sprite = node.children[0].getComponent(cc.Sprite);
                    const newSpriteFrame = new cc.SpriteFrame(texture); // Create new SpriteFrame with the loaded texture
                    sprite.spriteFrame = newSpriteFrame; // Assign the new SpriteFrame to the sprite
                } else {
                    cc.log('Error loading texture:', err);
                }
            });
        });
         
    }

    onLoad() {
        if (!GameUIController.instance) {
            GameUIController.instance = this;
        }

        this.ranodmizeFruits();
    }
    start() {
        this.playPauseButton = this.pauseButton.getComponentInChildren(cc.Sprite);
        this.playPauseButton.spriteFrame = this.pauseButtonSprite;

    }


    //start roll up event
    onUpButtonClick() {
        GameController.instance.resetPosition();
        GameStateManager.currentGameState = GameState.Pause;
        this.changeButtonState();
        GameStateManager.moveDown = false;
        GameStateManager.currentGameState = GameState.RollingUp;
        this.changeButtonState();
    }

    //start roll down event
    onDownButtonClick() {
        GameController.instance.resetPosition();
        GameStateManager.currentGameState = GameState.Pause;
        this.changeButtonState();
        GameStateManager.moveDown = true;
        GameStateManager.currentGameState = GameState.RollingDown;
        this.changeButtonState();
    }


    //function to pause or contunute the roll 
    onPlayPauseButtonClick() {
        if (GameStateManager.currentGameState === GameState.Pause) {
            if (GameStateManager.moveDown) {
                GameController.instance.resetPosition();
                GameStateManager.currentGameState = GameState.RollingDown;
                this.changeButtonState();
            }
            if (!GameStateManager.moveDown) {
                GameController.instance.resetPosition();
                GameStateManager.currentGameState = GameState.RollingUp;
                this.changeButtonState();
            }
            return;
        }
        if (GameStateManager.currentGameState === GameState.RollingDown || GameStateManager.currentGameState === GameState.RollingUp) {

            // Update state
            GameStateManager.currentGameState = GameState.Pause;
            this.changeButtonState();
            GameStateManager.isPauseStarted = true;
            GameController.instance.onGamePause();
        }
    }

    //change button state during different gamestate
    changeButtonState() {
        if (GameStateManager.currentGameState === GameState.Start || GameStateManager.currentGameState === GameState.End) {
            this.playPauseButton.spriteFrame = this.pauseButtonSprite;
        } else {
            this.playPauseButton.spriteFrame = this.pauseButtonSprite;
        }
        if (GameStateManager.currentGameState === GameState.Pause) {
            this.playPauseButton.spriteFrame = this.playButtonSprite;
        }
    }
}
