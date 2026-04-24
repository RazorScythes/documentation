import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getProfile, updateProfile, clearAlert } from '../../../actions/user';
import { dark, light } from '../../../style';
import { faB, faBirthdayCake, faC, faEdit, faF, faG, faGenderless, faHashtag, faL, faLock, faM, faSearch, faT } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { put, del } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

import CustomForm from '../../Custom/CustomForm';

const Profile = ({ user, theme, setNotification }) => {
    const dispatch = useDispatch()

    const profile = useSelector((state) => state.user.data)
    const alert = useSelector((state) => state.user.alert)
    const isLoading = useSelector((state) => state.user.isLoading)

    const [updateFormValue, setUpdateFormValue] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [initialValues, setInitialValues] = useState({})

    useEffect(() => {
        dispatch(getProfile())
    }, [])

    useEffect(() => {
        setSubmitted(false)
        setInitialValues(profile)
        setUpdateFormValue(true)
    }, [profile])

    useEffect(() => {
        if(Object.keys(alert).length > 0) {
            dispatch(clearAlert())
            setNotification(alert)
        }
    }, [alert])

    const fields = [
        { label: "Avatar", name: "avatar", type: "image" },
        { label: "Email", name: "email", type: "email", readOnly: true },
        { label: "Username", name: "username", type: "text", readOnly: true },
        { label: "First Name", name: "first_name", type: "text", required: true },
        { label: "Middle Name", name: "middle_name", type: "text" },
        { label: "Last Name", name: "last_name", type: "text", required: true },
        { label: "Bio", name: "bio", type: "textarea" },
        { label: "Birthday", name: "birthday", type: "date" },
        { label: "Gender", name: "gender", type: "select", options: [
            { id: 'M', name: 'Male'}, { id: 'F', name: 'Female'}
        ] },
        { label: "Contact Number", name: "contact_number", type: "number",
            validate: (value) =>
                value?.length < 11 ? "Contact number must be at least 11 numbers" : null,
        },
        { label: "Address", name: "address", type: "textarea" }
    ];

    const fileName = (originalFileName) => {
        const uuid = uuidv4();
        const dotIndex = originalFileName.lastIndexOf('.');
        const extension = originalFileName.substring(dotIndex);
        return `${uuid}${extension}`;
    };

    const uploadVercelImage = async (obj) => {
        const newObj = { ...obj };
    
        for (const key in newObj) {
            const value = newObj[key];

            if(value instanceof File) {
                if (value.type.startsWith("image/")) {
                    const blob = await put(fileName(value.name), value, {
                        access: 'public',
                        token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN
                    });

                    newObj[key] = blob.url;
                }
            }
        }

        return newObj;
    };

    const handleSubmit = async (formData) => {
        if(!submitted) {
            setSubmitted(true)

            const data = await uploadVercelImage(formData);

            if(data?.removed?.length) {
                data.removed.map(async (image) => {
                    if(image.includes('vercel-storage')) {
                        await del(image, { token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN });
                    }
                })

                delete data.removed;
            }

            dispatch(updateProfile(data))
        }
    }

    const isLight = theme === 'light'

    if (isLoading && Object.keys(profile).length === 0) {
        return (
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-8">
                    <div className={`w-32 h-7 rounded-lg animate-pulse mb-2 ${isLight ? light.focusbackground : dark.focusbackground}`} />
                    <div className={`w-56 h-4 rounded animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                </div>
                <div className="max-w-2xl space-y-4">
                    <div className={`h-24 rounded-xl animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-14 rounded-xl animate-pulse ${isLight ? light.focusbackground : dark.focusbackground}`} />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            {/* Header Section */}
            <div className='mb-8'>
                <h1 className={`text-3xl font-semibold mb-2 ${isLight ? light.heading : dark.heading}`}>
                    My Profile
                </h1>
                <p className={`text-sm ${isLight ? light.text : dark.text}`}>
                    Update your personal information and profile details
                </p>
            </div>

            {/* Profile Form Card */}
            <div className={`max-w-2xl rounded-xl p-6 md:p-8 border ${
                isLight
                    ? 'bg-white/80 backdrop-blur-sm border-blue-200/60 shadow-md'
                    : 'bg-[#1C1C1C] border-[#2B2B2B] shadow-lg'
            }`}>
                <CustomForm
                    theme={theme}
                    fields={fields}
                    onSubmit={handleSubmit}
                    setUpdate={setUpdateFormValue}
                    update={updateFormValue}
                    initialValues={initialValues}
                    disabled={submitted}
                />
            </div>
        </div>
    )
}

export default Profile