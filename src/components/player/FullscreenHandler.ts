import Orientation from 'react-native-orientation-locker';
import { StatusBar } from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';

export const enterFullscreen = () => {
    Orientation.lockToLandscape();
    StatusBar.setHidden(true);
    SystemNavigationBar.navigationHide();
};

export const exitFullscreen = () => {
    Orientation.lockToPortrait();
    StatusBar.setHidden(false);
    SystemNavigationBar.navigationShow();
};

export const toggleFullscreen = (isFullscreen: boolean) => {
    if (isFullscreen) {
        exitFullscreen();
    } else {
        enterFullscreen();
    }
};

export const setupOrientationListeners = (onOrientationChange: (orientation: string) => void) => {
    Orientation.addOrientationListener(onOrientationChange);
    return () => {
        Orientation.removeOrientationListener(onOrientationChange);
    };
};
