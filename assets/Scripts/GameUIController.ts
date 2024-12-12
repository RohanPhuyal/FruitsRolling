// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import GameAudio from "./GameAudio";
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


    @property(cc.Button) backgroundAudioMuteButton: cc.Button = null;
    @property(cc.SpriteFrame) backgroundAudioMuteSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame) backgroundAudioUnmuteSprite: cc.SpriteFrame = null;
    private backgroundAudioMuteUnmute: cc.Sprite = null;

    @property(cc.Button) otherAudioMuteButton: cc.Button = null;
    private otherAudioMuteUnmute: cc.Sprite = null;

    @property(cc.Button) settingsButton: cc.Button = null;
    @property(cc.Node) settingsPanel: cc.Node = null;
    @property(cc.Node) blockInputLayer: cc.Node = null;


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
    assignTexture(shuffledValues) {
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
        // Add a touch event listener to blockInputLayer
        this.blockInputLayer.on(cc.Node.EventType.TOUCH_START, this.onBlockInputClick, this);

        // Initially hide the blocking layer
        this.blockInputLayer.active = false;
    }
    start() {
        this.playPauseButton = this.pauseButton.getComponentInChildren(cc.Sprite);
        this.playPauseButton.spriteFrame = this.pauseButtonSprite;

        this.backgroundAudioMuteUnmute = this.backgroundAudioMuteButton.getComponentInChildren(cc.Sprite);
        this.backgroundAudioMuteUnmute.spriteFrame = this.backgroundAudioUnmuteSprite;

        this.otherAudioMuteUnmute = this.otherAudioMuteButton.getComponentInChildren(cc.Sprite);
        this.otherAudioMuteUnmute.spriteFrame = this.backgroundAudioUnmuteSprite;

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

    onBackgroundMuteButtonClick() {
        if (!GameAudio.isBackgroundSoundMuted) {
            GameAudio.isBackgroundSoundMuted = true;
            GameAudio.instance.muteBackgroundAudio();
        }
        else{
            GameAudio.isBackgroundSoundMuted = false;
            GameAudio.instance.muteBackgroundAudio();
        }
       
    }
    onOtherAudioMuteButtonClick() {
        if (!GameAudio.isOtherSoundMuted) {
            GameAudio.isOtherSoundMuted = true;
            GameAudio.instance.muteOtherAudio();
        }
        else{
            GameAudio.isOtherSoundMuted = false;
            GameAudio.instance.muteOtherAudio();
        }
       
    }

    changeBackgroundAudioIcon() {
        if (GameAudio.isBackgroundSoundMuted) {
            this.backgroundAudioMuteUnmute.spriteFrame = this.backgroundAudioMuteSprite;
        }
        if (!GameAudio.isBackgroundSoundMuted) {
            this.backgroundAudioMuteUnmute.spriteFrame = this.backgroundAudioUnmuteSprite;
        }
        
    }
    changeOtherAudioIcon(){
        if (GameAudio.isOtherSoundMuted) {
            this.otherAudioMuteUnmute.spriteFrame = this.backgroundAudioMuteSprite;
        }
        if (!GameAudio.isOtherSoundMuted) {
            this.otherAudioMuteUnmute.spriteFrame = this.backgroundAudioUnmuteSprite;
        }
    }

    onSettingsIconClick(){
        if(this.settingsPanel.active){
            this.settingsPanel.active=false;
            this.blockInputLayer.active=false;
        }else{
            this.settingsPanel.active=true;
            this.blockInputLayer.active=true;
        }
    }
    onBlockInputClick(event: cc.Event) {
        this.settingsPanel.active = false;
        this.blockInputLayer.active = false;
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
