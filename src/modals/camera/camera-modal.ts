import { fromObject } from 'tns-core-modules/data/observable';
import * as fs from 'tns-core-modules/file-system';
import { isIOS } from 'tns-core-modules/platform';
import { topmost } from 'tns-core-modules/ui/frame';
import { GestureEventData } from 'tns-core-modules/ui/gestures';
import { getResources } from 'tns-core-modules/application';
import { Animation } from 'tns-core-modules/ui/animation';
import { AnimationCurve } from 'tns-core-modules/ui/enums';

let page;
let vm;
let cameraView;
let interval;
let sourceType: 'photo' | 'video';
let animation;

function imagePath() {
    const path = fs.path.join(
        'tns_modules/nativescript-fancy-camera/images',
        isIOS ? 'ios' : 'android'
    );
    return '~/' + path;
}

export function loaded(args) {
    if (isIOS) {
        const navigationBar = topmost().ios.controller.navigationBar;
        navigationBar.barStyle = UIStatusBarStyle.LightContent;
    }
    vm = fromObject({
        src: '',
        isRecording: false,
        photoTaken: false,
        videoRecorded: false,
        deleteIcon: imagePath() + '/delete.png',
        switchIcon: imagePath() + '/switch-camera.png',
        okIcon: imagePath() + '/ok.png',
        retryIcon: imagePath() + '/redo.png'

    });
    page = args.object;
    page.bindingContext = vm;
    const actionBtn = page.getViewById('actionBtn');
    actionBtn.on('longPress,tap', (event: GestureEventData) => {
        if (event.eventName === 'tap') {
            takePhoto(event);
        }

        if (event.eventName === 'longPress') {
            if (event.ios.state === UIGestureRecognizerState.Began) {
                record();
            }

            if (event.ios.state === UIGestureRecognizerState.Ended) {
                stopRecord();
            }
        }

    });
}

export function cameraLoaded(args) {
    cameraView = args.object;
    cameraView.on('started', event => {
        const startBtn = page.getViewById('start');
        interval = setInterval(() => {
            page.actionBar.title = getResources().toTime(cameraView.duration);
            animation = new Animation([
                {
                    target: startBtn,
                    duration: 450,
                    curve: AnimationCurve.easeIn,
                    scale: {x: 1.5, y: 1.5}
                },
                {
                    target: startBtn,
                    duration: 450,
                    curve: AnimationCurve.easeOut,
                    scale: {x: 1, y: 1}
                }
            ], true);
            animation.play().then(() => {
                animation = null;
            });
        }, 1000);
    });
    cameraView.on('error', event => {
        if (interval) {
            clearInterval(interval);
        }
        if (animation) {
            animation.cancel();
            animation = null;
        }
    });
    cameraView.on('finished', event => {
        const object = event.object;
        vm.set('src', object.get('file'));
        if (sourceType === 'video') {
            vm.set('photoTaken', false);
            vm.set('videoRecorded', true);
        }

        if (sourceType === 'photo') {
            vm.set('videoRecorded', false);
            vm.set('photoTaken', true);
        }
        if (interval) {
            clearInterval(interval);
        }
        if (animation) {
            animation.cancel();
            animation = null;
        }
    });
}

export function cancel(args) {
    args.object.closeModal();
}

export function takePhoto(args) {
    sourceType = 'photo';
    cameraView.takePhoto();
}


export function record() {
    sourceType = 'video';
    cameraView.startRecording();
    vm.set('isRecording', true);
    page.actionBar.title = getResources().toTime(0);
    const startBtn = page.getViewById('start');
    startBtn.cssClasses.add('btn-scale');
    animation = new Animation([
        {
            target: startBtn,
            duration: 450,
            curve: AnimationCurve.easeIn,
            scale: {x: 1.5, y: 1.5}
        },
        {
            target: startBtn,
            duration: 450,
            curve: AnimationCurve.easeOut,
            scale: {x: 1, y: 1}
        }
    ], true);
    animation.play().then(() => {
        animation = null;
    });
}

export function stopRecord() {
    cameraView.stopRecording();
    vm.set('isRecording', false);
    page.actionBar.title = '';
    const startBtn = page.getViewById('start');
    startBtn.cssClasses.delete('btn-scale');
}

export function toggleFlash() {
    cameraView.toggleFlash();
}

export function toggleCamera() {
    cameraView.toggleCamera();
}

export function retry(args) {
    cameraView.startPreview();
    vm.set('videoRecorded', false);
    vm.set('photoTaken', false);
    vm.set('src', '');
}

export function done(args) {
    args.object.closeModal({
        file: vm.get('src'),
        type: sourceType
    });
}
