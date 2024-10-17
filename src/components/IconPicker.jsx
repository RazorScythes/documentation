import React, { useState, useEffect } from 'react';
import { library, findIconDefinition  } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

library.add(fas, far, fab);

const IconPicker = ({ setIcon }) => {
    const [selectedIcon, setSelectedIcon] = useState('a');
    const [iconList, setIconList] = useState([])

    const handleChange = (event) => {
        setIcon(event.target.value)
        setSelectedIcon(event.target.value);
    };

    useEffect(() => {
        setIcon(selectedIcon)
    }, [])

    const iconExists = (iconName) => {
        return findIconDefinition({ prefix: 'fas', iconName: iconName.slice(3) }) !== undefined;
    }

    const fasIconList = Object.keys(fas).sort().map((icon, i) => {
        let icon_value = (icon.charAt(0).toUpperCase() + icon.slice(1).replace(/-/g, ' ')).split(/(?=[A-Z])/).join('-').toLowerCase()

        return (
            <>
                {
                    iconExists(icon_value) &&
                        <option key={i} value={icon_value} className="capitalize">
                            {icon_value.slice(3).split("-").join(" ")}
                        </option>
                }
            </>
        )
    });

    return (
        <div className='grid grid-cols-1  gap-5 place-content-start mb-4'>
            <div className='flex flex-row'>
                <select
                    className="sm:w-full w-2/3 capitalize appearance-none bg-gray-100 border border-gray-300 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    value={selectedIcon}
                    onChange={handleChange}
                >
                    {fasIconList}
                </select>
                <FontAwesomeIcon icon={['fas', selectedIcon]} className="ml-3 px-4 py-3 bg-blue-600 text-white rounded-md" />
            </div>
        </div>
    );
};

export default IconPicker;
