import React, { useEffect, useState } from 'react'
import { main, dark, light } from '../../../style';

import Table from '../../Custom/Table'
import ConfirmModal from '../../Custom/ConfirmModal'
import CustomForm from '../../Custom/CustomForm';

const Videos = ({ user, theme }) => {

    const [selectedData, setSelectedData] = useState(null)
    const [openModal, setOpenModal] = useState(false)
    const [deleteId, setDeleteId] = useState('')
    const [confirm, setConfirm] = useState(false)

    const fields = [
        { label: "Title", name: "title", placeholder: "Enter video title", required: true },
        { label: "Email", name: "email", type: "email", required: true },
        {
            label: "Password",
            name: "password",
            type: "password",
            required: true,
            validate: (value) =>
                value?.length < 6 ? "Password must be at least 6 characters" : null,
        },
        { label: "Age", name: "age", type: "number", placeholder: "Enter age" },
    ];
    
    const handleSubmit = (formData) => {
        console.log("Form Submitted:", formData);
    };

    useEffect(() => {
        if(selectedData?.length > 0) {
            //dispatch function
            console.log(selectedData)
        }
    }, [selectedData])

    useEffect(() => {
        if(confirm) {
            //dispatch function 
            console.log(deleteId)
            setConfirm(false)
        }
    }, [confirm])

    return (
        <div>   
            <ConfirmModal 
                theme={theme}
                title="Confirm Video Deletion"
                description={`Are you sure you want to delete this video?`}
                openModal={openModal}
                setOpenModal={setOpenModal}
                setConfirm={setConfirm}
            />

            <div className='mb-8 mt-4'>
                <h1 className="text-xl font-medium mb-1">Your Videos</h1>
            </div>

            <CustomForm
                theme={theme}
                fields={fields}
                onSubmit={handleSubmit}
                initialValues={{ name: "James Arvie Maderas", email: "jamezarviemaderas@gmail.com", age: 24 }}
            />

            {/* <Table 
                theme={theme}
                title=""
                header={[
                    { key: 'user', label: 'User', type: 'user', render: (user) => <strong>{user.username}</strong> },
                    { key: 'type', label: 'Type' },
                    { key: 'message', label: 'Message' },
                    { key: 'createdAt', label: 'Timestamp' },
                    { key: 'actions', label: 'Action' },
                ]}
                actions={[
                    { label: 'Edit', color: `${theme === 'light' ? light.edit_button : dark.edit_button}`, onClick: (item) => console.log('Edit', item) },
                    { label: 'Delete', color: `${theme === 'light' ? light.delete_button : dark.delete_button}`, onClick: (item) => { setDeleteId(item._id); setOpenModal(true)} },
                ]}
                limit={1}
                multipleSelect={true}
                data={[{
                    "_id": "671f4afa4f08c1947ed4e077a",
                    "user": {
                        "_id": "641730c1637f7ac77c72fb91",
                        "username": "Zantei25",
                        "role": "Admin",
                        "avatar": "https://drive.google.com/uc?export=view&id=1qf5mzvpZ6xspnY-rv6GM199JJwWfwZ7V"
                    },
                    "type": "blog1",
                    "method": "PATCH",
                    "message": "Updated blog",
                    "id": "649860071075e8ba6fadc7ef",
                    "createdAt": "2024-10-28T08:27:38.965Z",
                    "updatedAt": "2024-10-28T08:27:38.965Z",
                    "__v": 0
                }]}
                setSelectedData={setSelectedData}
            /> */}
        </div>
    )
}

export default Videos