import Orientation from 'react-native-orientation-locker';
import { StatusBar } from 'react-native';

export const enterFullscreen = () => {
    Orientation.lockToLandscape();
    StatusBar.setHidden(true);
};

export const exitFullscreen = () => {
    Orientation.lockToPortrait();
    StatusBar.setHidden(false);
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
