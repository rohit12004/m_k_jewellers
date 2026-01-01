import { createContext, useContext, useState } from "react";
import CustomAlert from "../components/ui/CustomAlert";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
    const [alertState, setAlertState] = useState({
        visible: false,
        title: "",
        message: "",
        type: "info",
        onClose: () => { },
    });

    const showAlert = (title, message, type = "info", onClose) => {
        setAlertState({
            visible: true,
            title,
            message,
            type,
            onClose: () => {
                setAlertState((prev) => ({ ...prev, visible: false }));
                if (onClose) onClose();
            },
        });
    };

    const closeAlert = () => {
        setAlertState((prev) => ({ ...prev, visible: false }));
    };

    return (
        <AlertContext.Provider value={{ showAlert, closeAlert }}>
            {children}
            <CustomAlert
                visible={alertState.visible}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
                onClose={alertState.onClose}
            />
        </AlertContext.Provider>
    );
};

export const useAlert = () => useContext(AlertContext);
