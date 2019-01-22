import { Property, View } from 'tns-core-modules/ui/core/view';
export declare enum CameraPosition {
    BACK = "back",
    FRONT = "front",
}
export declare enum Quality {
    MAX_480P = "480p",
    MAX_720P = "720p",
    MAX_1080P = "1080p",
    MAX_2160P = "2160p",
    HIGHEST = "highest",
    LOWEST = "lowest",
    QVGA = "qvga",
    PHOTO = "photo",
}
export declare type CameraPositionType = 'back' | 'front';
export declare enum CameraFlashMode {
    ON = "on",
    OFF = "off",
}
export declare class CameraViewBase extends View {
    cameraPosition: CameraPositionType;
    saveToGallery: boolean;
    quality: Quality;
    flash: CameraFlashMode;
    static isAvailable(): boolean;
    static requestPermissions(explanation?: string): Promise<any>;
}
export declare const flashModeProperty: Property<CameraViewBase, CameraFlashMode>;
export declare const qualityProperty: Property<CameraViewBase, any>;
export declare const cameraPositionProperty: Property<CameraViewBase, CameraPositionType>;
export declare const saveToGalleryProperty: Property<CameraViewBase, boolean>;
