import React, { useEffect, useState } from "react";
import { dark, light } from '../../style';
import { list, put, del } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

const CustomForm = ({ theme, fields, onSubmit, initialValues = {}, showReset = false}) => {
    const [field, setField] = useState([])
    const [formValues, setFormValues] = useState(initialValues);
    const [errors, setErrors] = useState({});

    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');

    const fileName = (originalFileName) => {
        const uuid = uuidv4();
        const dotIndex = originalFileName.lastIndexOf('.');
        const extension = originalFileName.substring(dotIndex);
        return `${uuid}${extension}`;
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async (event) => {
        event.preventDefault();
        if (!file) {
          setMessage('Please select a file first.');
          return;
        }

        const blob = await put(fileName(file.name), file, {
            access: 'public',
            token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN
        });

        console.log(blob)
    };

    const deleteFile = async () => {
        const result = await del('https://mvukvlejqwgq8zt5.public.blob.vercel-storage.com/a6ef1fcc-10e8-41ed-8ef0-bb911e691e5d-M5TVQymohgR9wBHz4OUQXEyzQ1idL3.jpg', {
            token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN
        })
        console.log(result)
    }

    const listFile = async () => {
        let cursor;
        const listResult = await list({
            cursor,
            limit: 1000,
            token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN
        });

        cursor = listResult.cursor;
        console.log(cursor)
    }

    useEffect(() => {
        setField(fields ?? [])
    }, [fields])

    useEffect(() => {
        setFormValues(initialValues ?? {})
    }, [initialValues])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const validateFields = () => {
        const newErrors = {};
        fields.forEach(({ name, required, validate }) => {
            if (required && !formValues[name]) {
                newErrors[name] = "This field is required";
            }
            if (validate && typeof validate === "function") {
                const validationError = validate(formValues[name]);
                if (validationError) newErrors[name] = validationError;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateFields()) {
            onSubmit(formValues);
        }
    };

    const handleClear = () => {
        setFormValues({});
        setErrors({});
    };

    return (
        <div className="grid grid-cols-2 gap-2">
            <div>
            <form onSubmit={handleUpload}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit" style={{ marginLeft: '10px' }}>
                    Upload
                </button>
            </form>

            <button type="button" onClick={() => listFile()} style={{ marginLeft: '10px' }}>
                List file
            </button>
            <button type="button" onClick={() => deleteFile()} style={{ marginLeft: '10px' }}>
                Delete file
            </button>
            {message && <p>{message}</p>}
            </div>

            <form onSubmit={handleSubmit}>
                {field.map(({ label, name, type, placeholder }) => (
                    <div key={name} className="pb-2">
                        <label htmlFor={name}> {label}: </label>
                        <input
                            id={name}
                            name={name}
                            type={type || "text"}
                            placeholder={placeholder || ""}
                            value={formValues[name] || ""}
                            onChange={handleChange}
                            className={`block w-full rounded-sm mt-2 mb-1 py-2 px-4 ${theme === 'light' ? light.input : dark.input}`} 
                        />
                        {errors[name] && <span className="text-red-600">{errors[name]}</span>}
                    </div>
                ))}

                <div className='flex justify-end mt-2'>
                    {
                        showReset &&
                            <button onClick={handleClear} type="button" className={`${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>
                                Clear
                            </button>
                    }
                    <button type="submit" className={`py-1.5 px-4 ${theme === 'light' ? light.button_secondary : dark.button_secondary} rounded-full ml-2`}>
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomForm;
