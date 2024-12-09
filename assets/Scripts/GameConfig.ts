export enum GameState {
    Start=0,
    RollingDown=1,
    RollingUp=2,
    SetStop=3,
    Pause=4,
    End=5
}
export type GameConfig = {
    speed: number,
    topPosition: number,
    bottomPosition: number
}
