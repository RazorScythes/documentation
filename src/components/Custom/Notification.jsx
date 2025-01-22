import React, { useEffect, useState } from 'react';
import { faCheckCircle, faExclamationCircle, faInfoCircle, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Notification = ({ data, duration = 3000, show = true, setShow }) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (show) {
            setIsAnimating(true);
            const timer = setTimeout(() => {
                setIsAnimating(false);
                setTimeout(() => setShow(false), 300); // Allow slide-out animation to complete
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [show]);

    if (!show && !isAnimating) return null;

    return (
        <div
            onClick={() => setShow(false)}
            className={`fixed left-16 z-50 cursor-pointer max-w-lg transition-transform duration-300 ease-in-out ${
                isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            } z-[110]`}
            style={{ bottom: '2rem' }} 
        >
            {
                data?.variant === 'success' ?
                    <div className="px-6 py-3 bg-green-600 text-white rounded-sm z-[90] shadow-lg">
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> { data?.message }
                    </div>
                : data?.variant === 'info' ?
                    <div className="px-6 py-3 bg-blue-600 text-white rounded-sm z-[90] shadow-lg">
                        <FontAwesomeIcon icon={faInfoCircle} className="mr-1" /> { data?.message }
                    </div>
                : data?.variant === 'warning' ?
                    <div className="px-6 py-3 bg-yellow-500 text-[#1C1C1C] rounded-sm z-[90] shadow-lg">
                        <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" /> { data?.message }
                    </div>
                : data?.variant === 'danger' &&
                    <div className="px-6 py-3 bg-red-600 text-white rounded-sm z-[90] shadow-lg">
                        <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1" /> { data?.message }
                    </div>
            }
        </div>
    );
};

export default Notification;
