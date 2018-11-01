import * as observable from 'tns-core-modules/data/observable';
import * as pages from 'tns-core-modules/ui/page';
import { HelloWorldModel } from './main-view-model';
import { FancyCamera } from 'nativescript-fancy-camera';

let page;
let vm = new HelloWorldModel();
vm.set('isRecording', false);
let fc = new FancyCamera();


// Event handler for Page 'loaded' event attached in main-page.xml
export function pageLoaded(args: observable.EventData) {
    // Get the event sender
    page = <pages.Page>args.object;
    page.bindingContext = vm;
}

export function takePhoto() {
    const cameraView = page.getViewById('cameraView');
    cameraView.on('finished', args => {
        const object = args.object;
        const file = object.get('file');
        vm.set('hasVideo', true);
        vm.set('hasImage', true);
        vm.set('src', file);
    });
    cameraView.takePhoto();
}

export function toggleCamera() {
    const cameraView = page.getViewById('cameraView');
    cameraView.toggleCamera();
}

export function recordVideo() {
    const cameraView = page.getViewById('cameraView');
    cameraView.on('finished', args => {
        const object = args.object;
        const file = object.get('file');
        vm.set('hasImage', false);
        vm.set('hasVideo', true);
        vm.set('src', file);
    });
    cameraView.startRecording();
}

export function stopRecord() {
    const cameraView = page.getViewById('cameraView');
    cameraView.stopRecording();
}

export function showBasicPhoto() {
    fc.takePhoto().then(data => {
        if (data && data.file) {
            vm.set('hasVideo', false);
            vm.set('hasImage', true);
            vm.set('src', data.file);
        }
    });
}

export function showBasicRecorder() {
    fc.record().then(data => {
        if (data && data.file) {
            vm.set('hasImage', false);
            vm.set('hasVideo', true);
            vm.set('src', data.file);
        }
    });
}

export function showCamera() {
    fc.show().then(data => {
        if (data && data.file && data.type) {
            if (data.type === 'video') {
                vm.set('hasImage', false);
                vm.set('hasVideo', true);
            }

            if (data.type === 'photo') {
                vm.set('hasImage', true);
                vm.set('hasVideo', false);
            }


            vm.set('src', data.file);
        }
    });
}
