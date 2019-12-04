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
import { ShowModalOptions } from 'tns-core-modules/ui/core/view';
import { addSeconds, format, startOfDay } from 'date-fns';

getResources().toTime = seconds => {
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
      const modalOptions: ShowModalOptions = {
        context: this.videoOptions,
        closeCallback: data => {
          resolve(data);
        },
        fullscreen: true
      };
      topmost().currentPage.showModal(
        'tns_modules/nativescript-fancy-camera/modals/photo/photo-root',
        modalOptions
      );
    });
  }

  public record(options: VideoOptions = {}): Promise<Result> {
    return new Promise((resolve, reject) => {
      const modalOptions: ShowModalOptions = {
        context: this.videoOptions,
        closeCallback: data => {
          resolve(data);
        },
        fullscreen: true
      };
      topmost().currentPage.showModal(
        'tns_modules/nativescript-fancy-camera/modals/video/video-root',
        modalOptions
      );
    });
  }

  public show(
    videoOptions: VideoOptions = {},
    photoOptions: PhotoOptions = {}
  ): Promise<Result> {
    const options = Object.assign({}, videoOptions, photoOptions);
    return new Promise((resolve, reject) => {
      const modalOptions: ShowModalOptions = {
        context: options,
        closeCallback: data => {
          resolve(data);
        },
        fullscreen: true
      };
      topmost().currentPage.showModal(
        'tns_modules/nativescript-fancy-cameras/modals/camera/camera-root',
        modalOptions
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
