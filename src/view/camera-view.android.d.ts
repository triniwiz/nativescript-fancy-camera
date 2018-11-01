import '../async-await';
import { CameraViewBase } from './camera-view.common';
export declare class CameraView extends CameraViewBase {
    private listener;
    constructor();
    readonly duration: any;
    static requestPermissions(explanation?: string): Promise<any>;
    private durationInterval;
    static isAvailable(): any;
    createNativeView(): any;
    initNativeView(): void;
    onLoaded(): void;
    onUnloaded(): void;
    private setCameraPosition(position);
    private setQuality(quality);
    toggleCamera(): void;
    takePhoto(): void;
    startRecording(cb: any): void;
    stopRecording(): void;
    startPreview(): void;
    stopPreview(): void;
}
