import React, { useEffect, useState } from "react";
import { dark, light } from '../../style';

const CustomForm = ({ theme, fields, onSubmit, initialValues = {}, showReset = false}) => {
    const [field, setField] = useState([])
    const [formValues, setFormValues] = useState(initialValues);
    const [errors, setErrors] = useState({});

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
