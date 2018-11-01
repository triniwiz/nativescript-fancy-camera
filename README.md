# NativeScript Fancy Camera

## Installation

`tns plugin add nativescript-fancy-camera`

## Usage 

### Basic Camera

#### takePhoto

```ts
import { FancyCamera } from 'nativescript-fancy-camera';
const fc = new FancyCamera();
fc.takePhoto().then(data => {
        if (data && data.file) {
            vm.set('src', data.file);
        }
    });
```

#### recordVideo

```ts
import { FancyCamera } from 'nativescript-fancy-camera';
const fc = new FancyCamera();

fc.record().then(data => {
        if (data && data.file) {
            vm.set('src', data.file);
        }
    });

```

#### showCamera 
Allows taking photos (tap) or recording videos (using longPress)


```ts
import { FancyCamera } from 'nativescript-fancy-camera';
const fc = new FancyCamera();

fc.show().then(data => {
        if (data && data.file && data.type) {
            if (data.type === 'video') {
            }

            if (data.type === 'photo') {
            }

            vm.set('src', data.file);
        }
    });
```


### Camera View

```xml
<Page xmlns="http://schemas.nativescript.org/tns.xsd"
 xmlns:ui="nativescript-fancy-camera/view">
<ui:CameraView quality="highest" cameraPosition="front" id="camera"/>
```
```ts
const cameraView = page.getViewById("camera");
cameraView.startRecording();
```
## API

| Method                  | Default  | Type    | Description                                           |
| ----------------------- | -------- | ------- | ----------------------------------------------------- |
| start                |          | void    | Starts the camera preview                             |
| stop                 |          | void    | Stop the camera preview                               |
| startRecording        |          | void    | Start recording camera preview.                       |
| stopRecording        |          | void    | Stop recording camera preview.                        |
| toggleCamera          |          | void    | Toggles between front or the back camera.             |
| duration                |          | int     | Get the current recording video duration.             |
| cameraPosition          | BACK     | void    | Gets or Sets camera position                          |
| quality                 | MAX_480P | void    | Gets or sets Video Quality                            |
| toggleFlash                 | off | void    | Toggle the device flash mode                           |
| takePhoto                 |  | void    | Capture photo                           |
    
## License

Apache License Version 2.0, January 2004



## ScreenShots
Android | IOS
--------|---------
Coming Soon | [Photo](https://i.imgur.com/TnYUC83.jpg)
Coming Soon | [Before](https://i.imgur.com/VGl0zF3.jpg)
Coming Soon | [Recording](https://i.imgur.com/IlVn65w.jpg)
Coming Soon | [Preview](https://i.imgur.com/SCD59Vl.jpg)