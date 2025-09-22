import { Flip, toast } from "react-toastify"

export const showToast = (type, message) => {
    let options = {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Flip,
    }

    switch (type) {
        case 'info':
            toast.info(message, options)
            break;
        case 'success':
            toast.success(message, options)
            break;
        case 'error':
            toast.error(message, options)
            break;
        case 'warning':
            toast.warning(message, options)
            break;
        default:
            toast(message, options)
            break;
    }
    // toast('🦄 Wow so easy!', {
        
    // });
}