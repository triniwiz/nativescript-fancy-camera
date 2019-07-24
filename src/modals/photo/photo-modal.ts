import { fromObject } from 'tns-core-modules/data/observable';
import * as fs from 'tns-core-modules/file-system';
import { isIOS } from 'tns-core-modules/platform';
import { topmost } from 'tns-core-modules/ui/frame';

let page;
let vm;
let cameraView;

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
    photoTaken: false,
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
  cameraView.on('finished', event => {
    console.log('finished');
    const object = event.object;
    vm.set('src', object.get('file'));
    vm.set('photoTaken', true);
    console.log(vm.get('src'));
    console.log(vm.get('photoTaken'));
    // cameraView.stopPreview();
  });
}

export function cancel(args) {
  args.object.closeModal();
}

export function takePhoto(args) {
  cameraView.takePhoto();
}

export function toggleFlash() {
  cameraView.toggleFlash();
}

export function toggleCamera() {
  cameraView.toggleCamera();
}

export function retry(args) {
  cameraView.startPreview();
  vm.set('photoTaken', false);
  vm.set('src', '');
}

export function done(args) {
  args.object.closeModal({
    file: vm.get('src'),
    type: 'photo'
  });
}
