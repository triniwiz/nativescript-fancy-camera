import { fromObject } from 'tns-core-modules/data/observable';
import * as fs from 'tns-core-modules/file-system';
import { isIOS } from 'tns-core-modules/platform';
import { topmost } from 'tns-core-modules/ui/frame';
import { AnimationCurve } from 'tns-core-modules/ui/enums';
import { Animation } from 'tns-core-modules/ui/animation';

let page;
let vm;
let cameraView;
let interval;
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
        currentTime: 0,
        isRecording: false,
        videoRecorded: false,
        deleteIcon: imagePath() + '/delete.png',
        switchIcon: imagePath() + '/switch-camera.png',
        okIcon: imagePath() + '/ok.png',
        retryIcon: imagePath() + '/redo.png'

    });
    page = args.object;
    page.bindingContext = vm;
}

export function cameraLoaded(args) {
    cameraView = args.object;
    cameraView.on('started', event => {
        interval = setInterval(() => {
            vm.set('currentTime', cameraView.duration);
        }, 1000);
    });
    cameraView.on('error', event => {
        clearInterval(interval);
    });
    cameraView.on('finished', event => {
        console.log('finished');
        const object = event.object;
        vm.set('src', object.get('file'));
        vm.set('videoRecorded', true);
        clearInterval(interval);
        // cameraView.stopPreview();
    });
}

export function cancel(args) {
    args.object.closeModal();
}

export function record(args) {
    cameraView.startRecording();
    vm.set('isRecording', true);
    const startBtn = page.getViewById('start');
    const stopBtn = page.getViewById('stop');
    if (animation) {
        animation.cancel();
    }
    stopBtn.cssClasses.add('btn-scale');
    animation = new Animation([
        {
            target: startBtn,
            opacity: 0,
            scale: {x: 0, y: 0},
            duration: 250,
            curve: AnimationCurve.easeIn
        },
        {
            target: stopBtn,
            opacity: 1,
            scale: {x: 1, y: 1},
            duration: 250,
            curve: AnimationCurve.easeOut
        }
    ], false);
    animation.play().then(() => {
        animation = null;
        stopBtn.cssClasses.delete('btn-scale');
    });
}

export function stopRecord() {
    cameraView.stopRecording();
    vm.set('isRecording', false);
    const startBtn = page.getViewById('start');
    const stopBtn = page.getViewById('stop');
    if (animation) {
        animation.cancel();
    }
    animation = new Animation([
        {
            target: stopBtn,
            opacity: 0,
            scale: {x: 0, y: 0},
            duration: 250,
            curve: AnimationCurve.easeOut
        },
        {
            target: startBtn,
            opacity: 1,
            scale: {x: 1, y: 1},
            duration: 250,
            curve: AnimationCurve.easeIn
        }
    ], false);
    animation.play().then(() => {
        animation = null;
        startBtn.cssClasses.delete('btn-scale');
    });
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
    vm.set('src', '');
    vm.set('currentTime', 0);
}

export function done(args) {
    args.object.closeModal({
        file: vm.get('src'),
        type: 'video'
    });
}
