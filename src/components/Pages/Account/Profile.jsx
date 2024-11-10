import React, { useState, useEffect } from 'react'
import { dark, light } from '../../../style';
import { faB, faBirthdayCake, faC, faEdit, faF, faG, faGenderless, faHashtag, faL, faLock, faM, faSearch, faT } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Profile = ({ user, theme }) => {

    const [edit, setEdit] = useState(false)
    const [form, setForm] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        birthday: '',
        gender: '',
        age: 0,
        contact_number: '',
        address: ''
    })  

    const handleSubmit = (e) => {
        e.preventDefault()

        console.log(form)
    }

    return (
        <div>
            <div className='mb-8'>
                <h1 className="text-xl font-medium mb-1">Your Information 
                    {
                        !edit &&
                            <button title="edit" onClick={() => setEdit(!edit)}><FontAwesomeIcon icon={faEdit} className={`${theme === 'light' ? light.icon : dark.icon} ml-1 cursor-pointer`}/></button>
                    }
                </h1>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className={`grid md:grid-cols-2 md:gap-4 gap-2 mb-8`}>
                    <div className="relative mt-2">
                        <span className={`absolute inset-y-0 left-0 flex items-center p-4 ${theme === 'light' ? light.active_list_button : dark.active_list_button}`}> <FontAwesomeIcon icon={faLock} /> </span>
                        <input 
                            value={'jamezarviemaderas@gmail.com'} 
                            className={`block w-full rounded-sm py-2 px-8 pl-14 ${theme === 'light' ? light.input : dark.input}`} 
                            type="email" 
                            placeholder={`Email Address`} 
                            readOnly
                            title="cannot be edited"
                        />
                    </div>

                    <div className="relative mt-2">
                        <span className={`absolute inset-y-0 left-0 flex items-center p-4 ${theme === 'light' ? light.active_list_button : dark.active_list_button}`}> <FontAwesomeIcon icon={faLock} /> </span>
                        <input 
                            value={'RazorScythe'} 
                            className={`block w-full rounded-sm py-2 px-8 pl-14 ${theme === 'light' ? light.input : dark.input}`} 
                            type="text" 
                            placeholder={`Username`} 
                            readOnly
                            title="cannot be edited"
                        />
                    </div>
                </div>

                <h1 className="text-base font-medium mb-6">Basic Information</h1>

                <div className={`grid md:grid-cols-3 md:gap-4 gap-2 mb-4`}>
                    <div>
                        <label className='mb-4'>First Name:</label>

                        <div className="relative mt-2">
                            <span className={`absolute inset-y-0 left-0 flex items-center p-4 ${theme === 'light' ? light.active_list_button : dark.active_list_button}`}> <FontAwesomeIcon icon={faF} /> </span>
                            <input 
                                value={form.first_name} 
                                onChange={(e) => setForm({...form, first_name: e.target.value})} 
                                className={`block w-full rounded-sm py-2 px-8 pl-14 ${theme === 'light' ? light.input : dark.input}`} 
                                type="text" 
                                placeholder={`First Name`} 
                                readOnly={!edit}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className='mb-4'>Middle Name:</label>

                        <div className="relative mt-2">
                            <span className={`absolute inset-y-0 left-0 flex items-center p-4 ${theme === 'light' ? light.active_list_button : dark.active_list_button}`}> <FontAwesomeIcon icon={faM} /> </span>
                            <input 
                                value={form.middle_name} 
                                onChange={(e) => setForm({...form, middle_name: e.target.value})} 
                                className={`block w-full rounded-sm py-2 px-8 pl-14 ${theme === 'light' ? light.input : dark.input}`} 
                                type="text" 
                                placeholder={`Middle Name`} 
                            />
                        </div>
                    </div>
                    <div>
                        <label className='mb-4'>Last Name:</label>

                        <div className="relative mt-2">
                            <span className={`absolute inset-y-0 left-0 flex items-center p-4 ${theme === 'light' ? light.active_list_button : dark.active_list_button}`}> <FontAwesomeIcon icon={faL} /> </span>
                            <input 
                                value={form.last_name} 
                                onChange={(e) => setForm({...form, last_name: e.target.value})} 
                                className={`block w-full rounded-sm py-2 px-8 pl-14 ${theme === 'light' ? light.input : dark.input}`} 
                                type="text" 
                                placeholder={`Last Name`} 
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className={`grid md:grid-cols-3 md:gap-4 gap-2 mb-4`}>
                    <div>
                        <label className='mb-4'>Birthday:</label>

                        <div className="relative mt-2">
                            <span className={`absolute inset-y-0 left-0 flex items-center p-4 ${theme === 'light' ? light.active_list_button : dark.active_list_button}`}> <FontAwesomeIcon icon={faBirthdayCake} /> </span>
                            <input 
                                value={form.birthday} 
                                onChange={(e) => setForm({...form, birthday: e.target.value})} 
                                className={`block w-full rounded-sm py-2 px-8 pl-14 ${theme === 'light' ? light.input : dark.input}`} 
                                type="date" 
                            />
                        </div>
                    </div>

                    <div>
                        <label className='mb-4'>Gender:</label>

                        <div className="relative mt-2">
                            <span className={`absolute inset-y-0 left-0 flex items-center p-4 ${theme === 'light' ? light.active_list_button : dark.active_list_button}`}> <FontAwesomeIcon icon={faGenderless} /> </span>
                            <select 
                                value={form.gender} 
                                onChange={(e) => setForm({...form, gender: e.target.value})} 
                                className={`block w-full rounded-sm py-2 px-8 pl-14 ${theme === 'light' ? light.input : dark.input}`} 
                            >   
                                <option value="Male"> Male </option>
                                <option value="Female"> Female </option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className='mb-4'>Contact Number:</label>

                        <div className="relative mt-2">
                            <span className={`absolute inset-y-0 left-0 flex items-center p-4 ${theme === 'light' ? light.active_list_button : dark.active_list_button}`}> <FontAwesomeIcon icon={faHashtag} /> </span>
                            <input 
                                value={form.contact_number} 
                                onChange={(e) => setForm({...form, contact_number: e.target.value})} 
                                className={`block w-full rounded-sm py-2 px-8 pl-14 ${theme === 'light' ? light.input : dark.input}`} 
                                type="text" 
                                placeholder={`Contact Number`} 
                            />
                        </div>
                    </div>
                </div>

                <div className={`grid grid-cols-1 md:gap-4 gap-2`}>
                    <div>
                        <label className='mb-4'>Full Address:</label>

                        <div className="relative mt-2">
                            <textarea
                                name="message"
                                id="message"
                                cols="30"
                                rows="6"
                                placeholder="Full Address"
                                value={form.address} 
                                onChange={(e) => setForm({...form, address: e.target.value})} 
                                className={`block w-full px-4 py-2 ${theme === 'light' ? light.input : dark.input}`}
                            >
                            </textarea>
                        </div>
                    </div>
                </div>
                
                {
                    edit ?
                        <div className='flex justify-end mt-4'>
                            <button type="submit" className={`${theme === 'light' ? light.button : dark.button} rounded-full ml-2`}>
                                Save Changes
                            </button>
                        </div>  
                    : null
                }
            </form>
        </div>
    )
}

export default Profile