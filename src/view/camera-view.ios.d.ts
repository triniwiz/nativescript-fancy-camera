import { CameraViewBase } from './camera-view.common';
export declare class CameraView extends CameraViewBase {
    nativeView: UIView;
    _output: AVCaptureMovieFileOutput;
    _photoOutput: AVCapturePhotoOutput;
    _file: NSURL;
    _photoFile: NSURL;
    _enableFlash: boolean;
    _videoInput: AVCaptureDeviceInput;
    _audioInput: AVCaptureDeviceInput;
    private session;
    private requestStoragePermission();
    static isAvailable(): boolean;
    createNativeView(): UIView;
    initNativeView(): void;
    onLoaded(): void;
    onUnloaded(): void;
    readonly duration: number;
    private setVideoInput();
    private openCamera();
    toggleFlash(): void;
    hasFlash(): boolean;
    enableFlash(enabled: boolean): void;
    takePhoto(): void;
    startRecording(): void;
    stopRecording(): void;
    stopPreview(): void;
    toggleCamera(): void;
    startPreview(): void;
    onLayout(left: number, top: number, right: number, bottom: number): void;
    onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void;
}
