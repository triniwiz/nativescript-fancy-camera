import { Property, View } from 'tns-core-modules/ui/core/view';

export enum CameraPosition {
  BACK = 'back',
  FRONT = 'front'
}

export enum Quality {
  MAX_480P = '480p',
  MAX_720P = '720p',
  MAX_1080P = '1080p',
  MAX_2160P = '2160p',
  HIGHEST = 'highest',
  LOWEST = 'lowest',
  QVGA = 'qvga',
  PHOTO = 'photo'
}

export type CameraPositionType = 'back' | 'front';

export enum CameraFlashMode {
  ON = 'on',
  OFF = 'off'
}

export class CameraViewBase extends View {
  cameraPosition: CameraPositionType;
  saveToGallery: boolean;
  quality: Quality;
  flash: CameraFlashMode;
  public static isAvailable(): boolean {
    return false;
  }

  public static requestPermissions(explanation?: string): Promise<any> {
    return Promise.resolve();
  }
}
export const flashModeProperty = new Property<CameraViewBase, CameraFlashMode>({
  name: 'flash',
  defaultValue: CameraFlashMode.OFF
});

export const qualityProperty = new Property<CameraViewBase, any>({
  name: 'quality',
  defaultValue: Quality.MAX_480P
});
export const cameraPositionProperty = new Property<
  CameraViewBase,
  CameraPositionType
>({
  name: 'cameraPosition',
  defaultValue: 'back'
});

export const saveToGalleryProperty = new Property<CameraViewBase, boolean>({
  name: 'saveToGallery',
  defaultValue: false
});

qualityProperty.register(CameraViewBase);
cameraPositionProperty.register(CameraViewBase);
saveToGalleryProperty.register(CameraViewBase);
flashModeProperty.register(CameraViewBase);
