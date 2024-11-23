const fields = [
    {
        label: "Thumbnail",
        name: "thumbnail",
        type: "image",
    },
    {
        label: "Save File",
        name: "save",
        type: "file",
    },
    {
        label: "Textarea",
        name: "text",
        type: "textarea",
        required: true
    },
    {
        label: "Settings",
        type: "labelOnly",
    },
    {
        label: "List",
        name: "list",
        type: "list"
    },
    {
        label: "Select Field",
        name: "select",
        type: "select",
        required: true,
        options: [
            { id: 1, name: 'RPG'},
            { id: 2, name: 'Puzzel'},
            { id: 3, name: 'MMORPG'},
        ]
    },
    {
        label: "Downloadable",
        name: "checkbox",
        type: "checkbox",
    },
    {
        label: "Tags",
        name: "tags",
        type: "multi_select",
        options: [{
            id: 1,
            name: 'Profile',
            count: 10,
            value: 1
        },{
            id: 2,
            name: 'Adventure',
            count: 20,
            value: 2
        }]
    },
    { label: "Video Title", name: "title", placeholder: "Enter video title", required: true },
    { label: "Video Url", name: "link", placeholder: "Enter video url", type: "text", required: true },
    {
        label: "Password",
        name: "password",
        type: "password",
        validate: (value) =>
            value?.length < 6 ? "Password must be at least 6 characters" : null,
    },
    { label: "Age", name: "age", type: "number", placeholder: "Enter age" },
];

const initalValues = { 
    save: { filename: "filename.pdf" },
    thumbnail: { preview: "http://localhost:5173/src/assets/avatar.webp" },
    name: "James Arvie Maderas", 
    email: "jamezarviemaderas@gmail.com", 
    age: 24, 
    text: "SAMPLE",
    select: 1,
    checkbox: true,
    list: {
        lists: ['Sample1', 'Sample2']
    },
    tags: { 
        tags: [
            {
                "id": 1,
                "name": "Adventure",
                "count": 20,
                "value": 1
            },
            {
                "id": 2,
                "name": "Profile",
                "count": 20,
                "value": 2
            }
        ]
    }
}