import axios from 'axios'
import Cookies from 'universal-cookie';

const cookies   = new Cookies();

const baseURL   = import.meta.env.VITE_DEVELOPMENT == "true" ? 
                    `${import.meta.env.VITE_APP_PROTOCOL}://${import.meta.env.VITE_APP_LOCALHOST}:${import.meta.env.VITE_APP_SERVER_PORT}`
                    : `https://endpoint-rho-six.vercel.app/`

const endpoint  = axios.create({ baseURL })

const options   = {
    headers: {
        Authorization: `Bearer ${cookies.get('token')}`,
        ContentType: "application/json",
    },
};

/*
    USER
*/
export const login                              = (formData) => endpoint.post('/user/login', formData)

/*
    GROUPS
*/
export const getGroups                          = (id, type) => endpoint.get(`/account/getGroups/${id}/${type}`, options)
export const newGroups                          = (formData) => endpoint.post('/account/newGroups', formData, options)
export const updateGroups                       = (formData) => endpoint.patch('/account/updateGroups', formData, options)