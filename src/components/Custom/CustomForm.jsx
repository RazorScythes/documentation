import React, { useEffect, useState } from "react";
import { dark, light } from "../../style";

const CustomForm = ({
    theme,
    fields,
    onSubmit,
    initialValues = {},
    showReset = false,
}) => {
    const [field, setField] = useState([]);
    const [formValues, setFormValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [loadingImages, setLoadingImages] = useState({}); // Tracks loading state for each image

    useEffect(() => {
        setField(fields ?? []);
    }, [fields]);

    useEffect(() => {
        setFormValues(initialValues ?? {});
    }, [initialValues]);

    const handleChange = (e) => {
        const { name, type, files } = e.target;
        if (type === "file") {
            const file = files[0];
            if (file) {
                setLoadingImages((prev) => ({ ...prev, [name]: true })); 
                setTimeout(() => {
                    setFormValues({ ...formValues, [name]: file });
                    setLoadingImages((prev) => ({ ...prev, [name]: false })); 
                }, 2000); 
            }
        } else {
            setFormValues({ ...formValues, [name]: e.target.value });
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;

        const file = files[0];

        if (file) {
            setFormValues({ ...formValues, [name]: file });
        }
    }

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

    const handleFileClick = (inputId) => {
        document.getElementById(inputId)?.click();
    };

    return (
        <div className="grid md:grid-cols-2 gap-2">
            <form onSubmit={handleSubmit}>
                {field.map(({ label, name, type, placeholder, required }) => (
                    
                    <div key={name} className="pb-2.5">
                        <label htmlFor={name}>{label}:</label>
                        {type === "image" ? (
                            <div>
                                {(formValues[name] || loadingImages[name] === true) ? (
                                    loadingImages[name] === true ? ( // Show loading animation while loading
                                        <div className={`p-8 py-16 mt-2.5 w-full border-2 border-dashed ${theme === "light" ? light.border : dark.semiborder} rounded-md flex justify-center items-center`}>
                                            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400`}></div>
                                        </div>
                                    ) : (
                                        <div
                                            className={`mt-2.5 w-full border border-solid ${theme === "light" ? light.semiborder : dark.semiborder} rounded-md`}
                                            onClick={() => handleFileClick(name)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <img
                                                src={URL.createObjectURL(formValues[name])}
                                                alt="Uploaded Thumbnail"
                                                className="w-full h-full object-cover rounded-md"
                                            />
                                        </div>
                                    )
                                ) :  (
                                    <div
                                        className={`p-8 py-16 mt-2.5 w-full border-2 border-dashed rounded-md ${
                                            theme === "light"
                                                ? light.border
                                                : dark.semiborder
                                        }`}
                                        onClick={() => handleFileClick(name)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <p
                                            className={`cursor-default text-center ${
                                                theme === "light" ? light.text : dark.text
                                            }`}
                                        >
                                            Click to upload an image
                                        </p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id={name}
                                    name={name}
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="hidden"
                                />
                            </div>
                        ) : type === "file" ? (
                                <input
                                    type="file"
                                    id={name}
                                    name={name}
                                    onChange={handleFileChange}
                                    className={`block w-full rounded-sm mt-2 mb-1 py-2 px-4 ${theme === "light" ? light.input : dark.input}`}
                                />
                        ) : (
                            <input
                                id={name}
                                name={name}
                                type={type || "text"}
                                placeholder={placeholder || ""}
                                value={formValues[name] || ""}
                                onChange={handleChange}
                                className={`block w-full rounded-sm mt-2 mb-1 py-2 px-4 ${theme === "light" ? light.input : dark.input}`}
                            />
                        )}
                        {errors[name] && <span className="text-red-600">{errors[name]}</span>}
                    </div>
                ))}

                <div className="flex justify-end mt-2">
                    {showReset && (
                        <button
                            onClick={handleClear}
                            type="button"
                            className={`${
                                theme === "light" ? light.button : dark.button
                            } rounded-full ml-2`}
                        >
                            Clear
                        </button>
                    )}
                    <button
                        type="submit"
                        className={`py-1.5 px-4 ${
                            theme === "light"
                                ? light.button_secondary
                                : dark.button_secondary
                        } rounded-full ml-2`}
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomForm;
