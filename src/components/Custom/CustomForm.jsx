import React, { useEffect, useState } from "react";
import { dark, light } from "../../style";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faFile, faPlus } from "@fortawesome/free-solid-svg-icons";

const CustomForm = ({
    theme,
    fields,
    onSubmit,
    initialValues = {},
    showReset = false,
    update,
    setUpdate,
    disabled,
    setUpdateFormValue,
    updateFormValue,
    fullWidth
}) => {
    const [field, setField] = useState([]);
    const [formValues, setFormValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [loadingImages, setLoadingImages] = useState({}); 
    const [dropdownData, setDropdownData] = useState({});
    const [dropdownVisible, setDropdownVisible] = useState({});
    const [inputFocus, setInputFocus] = useState({})

    useEffect(() => {
        setField(fields ?? []);
    }, [fields]);

    useEffect(() => {
        if(update) {
            console.log(initialValues)
            setFormValues(initialValues ?? {});
            setUpdate(false)
        }
    }, [update]);

    const handleChange = (e) => {
        const { name, type, files } = e.target;
        if (type === "file") {
            const file = files[0];
            if (file) {
                setLoadingImages((prev) => ({ ...prev, [name]: true })); 
                setTimeout(() => {
                    setFormValues({ ...formValues, [name]: file });
                    setLoadingImages((prev) => ({ ...prev, [name]: false })); 
                }, 1000); 
            }
        } else {
            setFormValues({ ...formValues, [name]: e.target.value });
        }
    };

    const handleCheckboxChange = (e) => {
        const { name } = e.target;
        setFormValues({ ...formValues, [name]: !formValues[name] });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;

        const file = files[0];

        if (file) {
            setFormValues({ ...formValues, [name]: file });
        }
    }

    const handleTagInputChange = (e, name) => {
        const { value } = e.target;

        setFormValues((prev) => ({
            ...prev,
            [name]: {
                ...prev[name],
                input: value,
            },
        }));
        setInputFocus((prev) => ({ ...prev, [name]: true }));

        const field = fields.find((f) => f.name === name);
        if (field && field.options) {
            const filteredOptions = field.options.filter((option) =>
                option.name.toLowerCase().includes(value.toLowerCase())
            );
            setDropdownData((prev) => ({ ...prev, [name]: filteredOptions }));
            setDropdownVisible((prev) => ({ ...prev, [name]: value.length >= 0 || value.length === 0 }));
        }
    };

    const inputOnFocus = (name) => {
        setInputFocus((prev) => ({ ...prev, [name]: true }));
    } 

    const inputOnBlur = (name) => {
        setTimeout(() => {
            setInputFocus((prev) => ({ ...prev, [name]: false }));
        }, 300); 
    }

    const handleTagSelect = (name, tag) => {
        const currentTags = formValues[name]?.tags || [];
        if (!currentTags.some((t) => t.value === tag.value)) {
            setFormValues((prev) => ({
                ...prev,
                [name]: {
                    input: "",
                    tags: [...currentTags, tag],
                },
            }));
        }

        setDropdownVisible((prev) => ({ ...prev, [name]: false }));
    };

    const handleTagRemove = (name, tagValue) => {
        const currentTags = formValues[name]?.tags || [];
        const updatedTags = currentTags.filter((tag) => tag.value !== tagValue);
        setFormValues((prev) => ({
            ...prev,
            [name]: {
                ...prev[name],
                tags: updatedTags,
            },
        }));
    };

    const handleListChange = (e, name) => {
        const { value } = e.target;

        setFormValues((prev) => ({
            ...prev,
            [name]: {
                ...prev[name],
                input: value,
            },
        }));
    };

    const addList = (name) => {
        const currentLists = formValues[name]?.lists || [];
        const value = formValues[name]?.input || "";
        if (!currentLists.some((l) => l === value)) {
            setFormValues((prev) => ({
                ...prev,
                [name]: {
                    input: "",
                    lists: [...currentLists, value],
                },
            }));
        }
    };

    const removeList = (name, listValue) => {
        const currentLists = formValues[name]?.lists || [];
        const updatedLists = currentLists.filter((list) => list !== listValue);
        setFormValues((prev) => ({
            ...prev,
            [name]: {
                ...prev[name],
                lists: updatedLists,
            },
        }));
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

    const handleClear = () => {
        setFormValues({});
        setErrors({});
    };

    const handleFileClick = (inputId) => {
        document.getElementById(inputId)?.click();
    };

    const handleInputFocus = (inputId) => {
        document.getElementById(inputId)?.focus();
    };

    const removeUndefined = (obj) => {
        return Object.fromEntries(
            Object.entries(obj).filter(([key, value]) => value !== undefined)
        );
    };

    function isStringArrayOnly(arr) {
        return Array.isArray(arr) && arr.every(item => typeof item === 'string');
    }

    const transformObject = (obj) => {
        const newObj = { ...obj };
    
        for (const key in newObj) {
            const value = newObj[key];

            if (value.hasOwnProperty('save')) {
                newObj[key] = value.save;
            }
            else if(value instanceof File || isStringArrayOnly(value)) {
                newObj[key] = value;
            }
            else if (
                value &&
                typeof value === 'object' &&
                value.hasOwnProperty('input') && 
                Object.keys(value).some((k) => Array.isArray(value[k]))
            ) {
                const arrayKey = Object.keys(value).find((k) => Array.isArray(value[k]));
                newObj[key] = value[arrayKey];
            }
            else if(value && typeof value === 'object' && value.hasOwnProperty('input')) {
                newObj[key] = []
            }
            else if(value && typeof value === 'object' && !value.hasOwnProperty('input')) {
                const arrayKey = Object.keys(value).find((k) => Array.isArray(value[k]));
                newObj[key] = value[arrayKey];
            }
        }
    
        return removeUndefined(newObj);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateFields()) {
            onSubmit(transformObject(formValues));
        }
    };
    
    return (
        <div className={`${!fullWidth && 'grid md:grid-cols-2 gap-2'}`}>
            <form onSubmit={handleSubmit}>
                {field.map(({ label, name, type, placeholder, options, required }) => (
                    
                    <div key={name} className="pb-2.5">
                        { type !== "checkbox" && <label htmlFor={name}>{label}:</label> }
                        {
                            type === "labelOnly" ? <></>
                            : type === "list" ? (
                                <>
                                    <div className='flex flex-row mt-2 mb-1'>
                                        <input
                                            id={name}
                                            name={name}
                                            type="text"
                                            placeholder={placeholder || ""}
                                            value={formValues[name]?.input || ""}
                                            onChange={(e) => handleListChange(e, name)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    addList(name)
                                                }
                                            }}
                                            className={`block w-full rounded-sm py-2 px-4 ${theme === "light" ? light.input : dark.input}`}
                                            autoSave="false"
                                        />
                                        <button
                                            type="button"
                                            className={`py-2 px-4 ${
                                                theme === "light"
                                                    ? light.button_secondary
                                                    : dark.button_secondary
                                            }`}
                                            onClick={() => addList(name)}
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                    </div>

                                    <ul className="mt-2">
                                        {formValues[name]?.lists?.map((list, k) => (
                                            <li key={k} className={`flex justify-between items-center px-4 py-2 ${theme === 'light' ? light.active_list_button : dark.active_list_button} transition-all cursor-pointer ${theme === 'light' ? light.list_button : dark.list_button} border-b border-solid ${theme === 'light' ? light.border : dark.semiborder}`}>
                                                {list} <FontAwesomeIcon onClick={() => removeList(name, list)} icon={faClose} className='mr-1'/>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) 
                            : type === "checkbox" ? (
                                <div className="flex items-center">
                                <input
                                    id={name}
                                    name={name}
                                    type={"checkbox"}
                                    placeholder={placeholder || ""}
                                    checked={formValues[name] || false}
                                    onChange={handleCheckboxChange}
                                    className={`w-4 h-4 mr-2 outline-none`}
                                />
                                <label htmlFor={name} className="">{label}</label>
                                </div>
                            )
                            : type === "select" ? (
                                <select
                                    id={name}
                                    name={name}
                                    type={type || "text"}
                                    placeholder={placeholder || ""}
                                    value={formValues[name] || ""}
                                    onChange={handleChange}
                                    className={`block custom-scroll w-full rounded-sm mt-2 mb-1 py-2 px-4 ${theme === "light" ? light.input : dark.input}`}
                                >
                                    <option value="">Select option</option>
                                    {
                                        options?.length > 0 &&
                                        options.map((item, i) => {
                                            return (
                                                <option key={i} value={item.id}> {item.name} </option>
                                            )
                                        })
                                    }
                                </select>
                            )
                            : type === "textarea" ? (
                                <textarea
                                    id={name}
                                    name={name}
                                    type={type || "text"}
                                    placeholder={placeholder || ""}
                                    value={formValues[name] || ""}
                                    onChange={handleChange}
                                    className={`block custom-scroll w-full rounded-sm mt-2 mb-1 py-3 px-4 ${theme === "light" ? light.input : dark.input}`}
                                    rows={8}
                                    autoSave="false"
                                />
                            )
                            : type === "multi_select" ? (
                                <div className="relative">
                                    <div
                                        onClick={() => handleInputFocus(name)}
                                        className={`relative flex flex-wrap items-center gap-3 w-full rounded-sm mt-2 mb-1 py-1 px-4 ${
                                            theme === "light" ? light.input : dark.input
                                        }`}
                                    >
                                        {formValues[name]?.tags?.map((tag, k) => (
                                            <p
                                                key={k}
                                                className={`cursor-pointer px-3 py-1 rounded-full text-white ${
                                                    theme === "light"
                                                        ? light.button_secondary
                                                        : dark.button_secondary
                                                }`}
                                                onClick={() => handleTagRemove(name, tag.value)}
                                            >
                                                {tag.name}
                                            </p>
                                        ))}
                                        <input
                                            id={name}
                                            name={name}
                                            type="text"
                                            placeholder={placeholder}
                                            value={formValues[name]?.input || ""}
                                            onChange={(e) => handleTagInputChange(e, name)}
                                            className={`flex-grow min-w-[10px] w-8 py-2 px-4 border rounded-sm ${
                                                theme === "light" ? light.input : dark.input
                                            }`}
                                            onFocus={() => inputOnFocus(name)}
                                            onBlur={() => inputOnBlur(name)}
                                            autoSave="false"
                                        />
                                    </div>
                                    {(dropdownVisible[name] && inputFocus[name]) && (
                                        <div
                                            className={`absolute z-70 top-[105%] left-0 w-full border border-solid ${
                                                theme === "light"
                                                    ? light.border
                                                    : dark.semiborder
                                            } shadow-md`}
                                        >
                                            <ul className="max-h-64 overflow-y-auto custom-scroll">
                                                {dropdownData[name]?.map((option, k) => (
                                                    <li
                                                        key={k}
                                                        className={`w-full px-6 py-2.5 transition-all cursor-pointer ${
                                                            theme === "light"
                                                                ? light.list_button
                                                                : dark.list_button
                                                        }`}
                                                        onClick={() => handleTagSelect(name, option)}
                                                    >
                                                        {option.name} {option?.count ? `(${option.count})` : ''}
                                                    </li>
                                                ))}
                                                {dropdownData[name]?.length === 0 && (
                                                    <li className={`px-6 py-2.5 transition-all cursor-pointer ${
                                                        theme === "light"
                                                            ? light.list_button
                                                            : dark.list_button
                                                    }`}>
                                                        No results found
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )
                            : type === "image" ? (
                            <div>
                                {
                                    formValues[name]?.preview ? (
                                        loadingImages[name] === true ? ( 
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
                                                    src={formValues[name]?.preview}
                                                    alt="Uploaded Thumbnail"
                                                    className="w-full h-full object-fit rounded-md"
                                                />
                                            </div>
                                        )
                                    )
                                    : (formValues[name] || loadingImages[name] === true) ? (
                                        loadingImages[name] === true ? ( 
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
                                                    className="w-full h-full object-fit rounded-md"
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
                                    )
                                }
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
                            <>
                                <input
                                    type="file"
                                    id={name}
                                    name={name}
                                    onChange={handleFileChange}
                                    className={`block w-full rounded-sm mt-2 mb-1 py-2 px-4 ${theme === "light" ? light.input : dark.input}`}
                                />
                                {
                                    formValues[name]?.filename ?
                                        <p className="flex gap-2 items-center"><FontAwesomeIcon icon={faFile} /> {formValues[name].filename} </p>
                                    : null
                                }
                            </>
                        ) : (
                            <input
                                id={name}
                                name={name}
                                type={type || "text"}
                                placeholder={placeholder || ""}
                                value={formValues[name] || ""}
                                onChange={handleChange}
                                className={`block w-full rounded-sm mt-2 mb-1 py-2 px-4 ${theme === "light" ? light.input : dark.input}`}
                                autoSave="false"
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
                        className={`disabled:cursor-not-allowed py-1.5 px-4 ${
                            theme === "light"
                                ? light.button_secondary
                                : dark.button_secondary
                        } rounded-full ml-2`}
                        disabled={disabled}
                    >
                        { disabled ? 'Submitting' : 'Submit' }
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomForm;
