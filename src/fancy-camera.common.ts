export interface VideoOptions {
    size?: number;
    hd?: boolean;
    saveToGallery?: boolean;
    duration?: number;
    explanation?: string;
    format?: VideoFormatType;
    position?: CameraPositionType;
}

export interface PhotoOptions {
    hd?: boolean;
    saveToGallery?: boolean;
    duration?: number;
    explanation?: string;
    format?: PhotoFormatType;
    position?: CameraPositionType;
}

export interface Result {
    file: string;
    type: 'photo' | 'video';
}

import { getResources } from 'tns-core-modules/application';
import { topmost } from 'tns-core-modules/ui/frame';
import { addSeconds, format, startOfDay } from 'date-fns';

getResources().toTime = (seconds) => {
    const start = startOfDay(new Date());
    const currentTime = addSeconds(start, seconds);
    return format(currentTime, 'HH:mm:ss');
};

export type CameraPositionType = 'front' | 'back' | 'none';
export type VideoFormatType = 'default' | 'mp4';
export type PhotoFormatType = 'default' | 'png';

export enum CameraPosition {
    FRONT = 'front',
    BACK = 'back',
    NONE = 'none'
}

export enum VideoFormat {
    DEFAULT = 'default',
    MP4 = 'mp4'
}

export class FancyCameraBase {
    videoOptions: VideoOptions;
    photoOptions: PhotoOptions;

    constructor(
        videoOptions: VideoOptions = {},
        photoOptions: PhotoOptions = {}
    ) {
        this.videoOptions = Object.assign(
            Object.assign(
                {
                    format: VideoFormat.DEFAULT,
                    position: CameraPosition.NONE,
                    size: 0,
                    duration: 0,
                    explanation: null
                },
                videoOptions || {}
            ),
            {
                saveToGallery: !!videoOptions.saveToGallery,
                hd: !!videoOptions.hd
            }
        );
    }

    public takePhoto(options: PhotoOptions = {}): Promise<Result> {
        return new Promise((resolve, reject) => {
            topmost().currentPage.showModal(
                'tns_modules/nativescript-fancy-camera/modals/photo/photo-root',
                this.videoOptions,
                function (data) {
                    resolve(data);
                },
                true,
                true
            );
        });
    }

    public record(options: VideoOptions = {}): Promise<Result> {
        return new Promise((resolve, reject) => {
            topmost().currentPage.showModal(
                'tns_modules/nativescript-fancy-camera/modals/video/video-root',
                this.videoOptions,
                function (data) {
                    resolve(data);
                },
                true,
                true
            );
        });
    }

    public show(
        videoOptions: VideoOptions = {},
        photoOptions: PhotoOptions = {}
    ): Promise<Result> {
        const options = Object.assign({}, videoOptions, photoOptions);
        return new Promise((resolve, reject) => {
            topmost().currentPage.showModal(
                'tns_modules/nativescript-fancy-camera/modals/camera/camera-root',
                options,
                function () {
                },
                true,
                true
            );
        });
    }

    public requestPermissions(): Promise<any> {
        return Promise.resolve();
    }

    public static isAvailable(): boolean {
        return false;
    }
}
