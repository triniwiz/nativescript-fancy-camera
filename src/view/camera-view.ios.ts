import * as fs from 'tns-core-modules/file-system';
import { layout } from 'tns-core-modules/ui/core/view';
import '../async-await';
import {
  CameraFlashMode,
  CameraPosition,
  CameraViewBase,
  flashModeProperty,
  Quality,
  saveToGalleryProperty
} from './camera-view.common';
import { fromObject } from 'tns-core-modules/data/observable';

class AVCapturePhotoCaptureDelegateImpl extends NSObject
  implements AVCapturePhotoCaptureDelegate {
  public static ObjCProtocols = [AVCapturePhotoCaptureDelegate];
  private _owner: WeakRef<CameraView>;

  public static initWithOwner(
    owner: WeakRef<CameraView>
  ): AVCapturePhotoCaptureDelegateImpl {
    let delegate = new AVCapturePhotoCaptureDelegateImpl();
    delegate._owner = owner;
    return delegate;
  }

  captureOutputDidFinishProcessingPhotoError(
    output: AVCapturePhotoOutput,
    photo: AVCapturePhoto,
    error: NSError
  ): void {
    const owner = this._owner.get();
    if (error) {
      owner.notify({
        eventName: 'error',
        object: fromObject({
          message: error.localizedDescription
        })
      });
    } else {
      const data = photo.fileDataRepresentation();
      const saved = data.writeToFileAtomically(
        owner._photoFile.absoluteString.replace('file://', ''),
        true
      );
      if (saved) {
        owner.notify({
          eventName: 'finished',
          object: fromObject({
            file: owner._photoFile.absoluteString
          })
        });
      }
    }
  }

  captureOutputDidFinishProcessingPhotoSampleBufferPreviewPhotoSampleBufferResolvedSettingsBracketSettingsError(
    output: AVCapturePhotoOutput,
    photoSampleBuffer: any,
    previewPhotoSampleBuffer: any,
    resolvedSettings: AVCaptureResolvedPhotoSettings,
    bracketSettings: AVCaptureBracketedStillImageSettings,
    error: NSError
  ): void {
    const owner = this._owner.get();
    if (error) {
      owner.notify({
        eventName: 'error',
        object: fromObject({
          message: error.localizedDescription
        })
      });
    } else {
      const data = AVCapturePhotoOutput.JPEGPhotoDataRepresentationForJPEGSampleBufferPreviewPhotoSampleBuffer(
        photoSampleBuffer,
        previewPhotoSampleBuffer
      );
      const saved = data.writeToFileAtomically(
        owner._photoFile.absoluteString.replace('file://', ''),
        true
      );
      if (saved) {
        owner.notify({
          eventName: 'finished',
          object: fromObject({
            file: owner._photoFile.absoluteString
          })
        });
      }
    }
  }
}

class AVCaptureFileOutputRecordingDelegateImpl extends NSObject
  implements AVCaptureFileOutputRecordingDelegate {
  private _owner: WeakRef<CameraView>;

  public static initWithOwner(
    owner: WeakRef<CameraView>
  ): AVCaptureFileOutputRecordingDelegateImpl {
    let delegate = new AVCaptureFileOutputRecordingDelegateImpl();
    delegate._owner = owner;
    return delegate;
  }

  captureOutputDidFinishRecordingToOutputFileAtURLFromConnectionsError(
    captureOutput: AVCaptureFileOutput,
    outputFileURL: NSURL,
    connections: NSArray<any>,
    error: NSError
  ): void {
    const owner = this._owner.get();
    if (!error) {
      owner.notify({
        eventName: 'finished',
        object: fromObject({
          file: outputFileURL.absoluteString
        })
      });
    } else {
      owner.notify({
        eventName: 'error',
        object: fromObject({
          message: error.localizedDescription
        })
      });
    }
  }

  captureOutputDidStartRecordingToOutputFileAtURLFromConnections(
    captureOutput: AVCaptureFileOutput,
    fileURL: NSURL,
    connections: NSArray<any>
  ): void {
    const owner = this._owner.get();
    owner.notify({
      eventName: 'started',
      object: fromObject({})
    });
  }

  public static ObjCProtocols = [AVCaptureFileOutputRecordingDelegate];
}

export class CameraView extends CameraViewBase {
  nativeView: UIView;
  _output: AVCaptureMovieFileOutput;
  _photoOutput: AVCapturePhotoOutput;
  _file: NSURL;
  _photoFile: NSURL;
  _enableFlash: boolean;
  _videoInput: AVCaptureDeviceInput;
  _audioInput: AVCaptureDeviceInput;
  private session: AVCaptureSession;

  private requestStoragePermission(): Promise<any> {
    return new Promise((resolve, reject) => {
      let authStatus = PHPhotoLibrary.authorizationStatus();
      if (authStatus === PHAuthorizationStatus.NotDetermined) {
        PHPhotoLibrary.requestAuthorization(auth => {
          if (auth === PHAuthorizationStatus.Authorized) {
            resolve();
          }
        });
      } else if (authStatus !== PHAuthorizationStatus.Authorized) {
        reject();
      }
    });
  }

  public static isAvailable() {
    return UIImagePickerController.isSourceTypeAvailable(
      UIImagePickerControllerSourceType.Camera
    );
  }

  public createNativeView() {
    return UIView.new();
  }

  public initNativeView() {}

  onLoaded() {
    super.onLoaded();
    this.startPreview();
  }

  onUnloaded() {
    this.stopPreview();
    super.onUnloaded();
  }

  get duration(): number {
    if (this._output && this._output.recordedDuration) {
      return Math.floor(
        Math.round(CMTimeGetSeconds(this._output.recordedDuration))
      );
    } else {
      return 0;
    }
  }

  [saveToGalleryProperty.getDefault]() {
    return false;
  }

  [saveToGalleryProperty.setNative](save: boolean) {
    return save;
  }

  [flashModeProperty.setNative](mode: CameraFlashMode) {}

  private setVideoInput() {
    let devices = AVCaptureDevice.devicesWithMediaType(AVMediaTypeVideo);
    let device: AVCaptureDevice;
    let pos =
      this.cameraPosition === 'front'
        ? AVCaptureDevicePosition.Front
        : AVCaptureDevicePosition.Back;
    for (let i = 0; i < devices.count; i++) {
      if (devices[i].position === pos) {
        device = devices[i];
        break;
      }
    }

    this._videoInput = (<any>AVCaptureDeviceInput).deviceInputWithDeviceError(
      device,
      null
    );
  }

  private openCamera(): void {
    try {
      this.session = new AVCaptureSession();
      this.setVideoInput();
      let audioDevice = AVCaptureDevice.defaultDeviceWithMediaType(
        AVMediaTypeAudio
      );
      this._audioInput = (<any>AVCaptureDeviceInput).deviceInputWithDeviceError(
        audioDevice,
        null
      );

      this._output = new AVCaptureMovieFileOutput();
      let format = '.mp4'; // options && options.format === 'default' ? '.mov' : '.' + options.format;
      let fileName = `VID_${+new Date()}${format}`;
      let path = fs.path.join(fs.knownFolders.temp().path, fileName);
      let photoFormat = '.jpg';
      const photoFileName = `PIC_${+new Date()}${photoFormat}`;
      const photoPath = fs.path.join(
        fs.knownFolders.temp().path,
        photoFileName
      );
      this._photoFile = NSURL.fileURLWithPath(photoPath);
      this._file = NSURL.fileURLWithPath(path);
      this._photoOutput = new AVCapturePhotoOutput();
      if (!this._videoInput) {
        this.notify({
          eventName: 'error',
          object: fromObject({
            message: 'Error trying to open camera.'
          })
        });
      }

      if (!this._audioInput) {
        this.notify({
          eventName: 'error',
          object: fromObject({
            message: 'Error trying to open mic.'
          })
        });
      }

      // this._output.maxRecordedDuration =
      //   types.isNumber(options.duration) && options.duration > 0
      //     ? CMTimeMakeWithSeconds(options.duration, 1)
      //     : kCMTimePositiveInfinity;

      // if (options.size > 0) {
      //   this._output.maxRecordedFileSize = options.size * 1024 * 1024;
      // }

      this.session.beginConfiguration();

      switch (this.quality) {
        case Quality.MAX_720P:
          this.session.sessionPreset = AVCaptureSessionPreset1280x720;
          break;
        case Quality.MAX_1080P:
          this.session.sessionPreset = AVCaptureSessionPreset1920x1080;
          break;
        case Quality.MAX_2160P:
          this.session.sessionPreset = AVCaptureSessionPreset3840x2160;
          break;
        case Quality.HIGHEST:
          this.session.sessionPreset = AVCaptureSessionPresetHigh;
          break;
        case Quality.LOWEST:
          this.session.sessionPreset = AVCaptureSessionPresetLow;
          break;
        case Quality.QVGA:
          this.session.sessionPreset = AVCaptureSessionPreset352x288;
          break;
        case Quality.PHOTO:
          this.session.sessionPreset = AVCaptureSessionPresetPhoto;
          break;
        default:
          this.session.sessionPreset = AVCaptureSessionPreset640x480;
          break;
      }

      this.session.addInput(this._videoInput);

      this.session.addInput(this._audioInput);

      this.session.addOutput(this._output);

      this.session.addOutput(this._photoOutput);

      this.session.commitConfiguration();

      let preview = AVCaptureVideoPreviewLayer.alloc().initWithSession(
        this.session
      );
      dispatch_async(dispatch_get_current_queue(), () => {
        preview.videoGravity = AVLayerVideoGravityResize;
      });
      if (!this.session.running) {
        this.session.startRunning();
      }

      dispatch_async(dispatch_get_current_queue(), () => {
        preview.frame = this.nativeView.bounds;
        this.nativeView.layer.addSublayer(preview);
      });
    } catch (ex) {
      this.notify({
        eventName: 'error',
        object: fromObject({
          message: ex.getMessage()
        })
      });
    }
  }

  public toggleFlash() {
    this._enableFlash = !this._enableFlash;
  }

  public hasFlash(): boolean {
    if (this._videoInput) {
      return this._videoInput.device.flashAvailable;
    }
    return false;
  }

  public enableFlash(enabled: boolean) {
    this._enableFlash = enabled;
  }

  public takePhoto(): void {
    const delegate = AVCapturePhotoCaptureDelegateImpl.initWithOwner(
      new WeakRef(this)
    );
    const settings = AVCapturePhotoSettings.alloc().init();
    switch (this.flash) {
      case CameraFlashMode.ON:
        settings.flashMode = AVCaptureFlashMode.On;
        break;
      case CameraFlashMode.OFF:
        settings.flashMode = AVCaptureFlashMode.Off;
        break;
    }
    this._photoOutput.capturePhotoWithSettingsDelegate(settings, delegate);
  }

  public startRecording(): void {
    let delegate = AVCaptureFileOutputRecordingDelegateImpl.initWithOwner(
      new WeakRef(this)
    );
    this._output.startRecordingToOutputFileURLRecordingDelegate(
      this._file,
      delegate
    );
  }

  public stopRecording(): void {
    this.session.stopRunning();
    setTimeout(() => {
      this.startPreview();
    }, 30);
  }

  public stopPreview(): void {
    if (this.session.running) {
      this.session.stopRunning();
    }
  }

  public toggleCamera(): void {
    if (this.cameraPosition === CameraPosition.BACK.toString()) {
      this.cameraPosition = 'front';
    } else {
      this.cameraPosition = 'back';
    }
    this.stopPreview();
    this.session.beginConfiguration();
    this.session.removeInput(this._videoInput);
    this.setVideoInput();

    if (!this._videoInput) {
      this.notify({
        eventName: 'error',
        object: fromObject({
          message: 'Error trying to open camera.'
        })
      });
    }

    this.session.addInput(this._videoInput);
    this.session.commitConfiguration();
    this.startPreview();
  }

  public startPreview(): void {
    if (!this.session) {
      this.openCamera();
    } else {
      this.session.startRunning();
    }
  }

  public onLayout(left: number, top: number, right: number, bottom: number) {
    super.onLayout(left, top, right, bottom);
    if (
      this.nativeView.layer &&
      this.nativeView.layer.sublayers &&
      this.nativeView.layer.sublayers[0]
    ) {
      dispatch_async(dispatch_get_current_queue(), () => {
        this.nativeView.layer.sublayers[0].frame = this.nativeView.bounds;
      });
    }
  }

  public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number) {
    const width = layout.getMeasureSpecSize(widthMeasureSpec);
    const height = layout.getMeasureSpecSize(heightMeasureSpec);
    this.setMeasuredDimension(width, height);
  }
}
