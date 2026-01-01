import Toast from 'react-native-toast-message';

/**
 * Show a toast notification
 * @param {string} type - 'success', 'error', 'info'
 * @param {string} message - The message to display
 * @param {string} description - Optional description
 */
export const showToast = (type, message, description = '') => {
    Toast.show({
        type: type,
        text1: message,
        text2: description,
        position: 'top',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
        text1Style: {
            fontSize: 16,
            fontWeight: '600',
        },
        text2Style: {
            fontSize: 14,
            fontWeight: '400',
        },
    });
};
