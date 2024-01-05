import { useState, useEffect } from 'react';

const useOnlineStatusCheck = () => {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // detect internet connection
        const handleChange = (newStatus) => {
            setIsOnline(newStatus);
            window?.electronApi?.send('online-status-changed', newStatus);
        }
    
        window.addEventListener('online', () => handleChange(true));
        window.addEventListener('offline', () => handleChange(false));
    
        return () => {
          window.removeEventListener('online', () => handleChange(true));
          window.removeEventListener('offline', () => handleChange(false));
        }
      }, [])

    return isOnline;
}

export default useOnlineStatusCheck;