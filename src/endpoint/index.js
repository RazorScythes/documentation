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
export const getGroups                          = (type) => endpoint.get(`/groups/getGroups/${type}`, options)
export const newGroups                          = (formData) => endpoint.post('/groups/newGroups', formData, options)
export const updateGroups                       = (formData) => endpoint.patch('/groups/updateGroups', formData, options)
export const deleteGroups                       = (id, type) => endpoint.delete(`/groups/deleteGroups/${id}/${type}`, options)
export const deleteMultipleGroups               = (formData) => endpoint.patch('/groups/deleteMultipleGroups', formData, options)

/*
    VIDEOS
*/
export const getUserVideos                      = () => endpoint.get('/videos/getUserVideos', options)
export const newVideo                           = (formData) => endpoint.post('/videos/newVideo', formData, options) 
export const updateVideo                        = (formData) => endpoint.patch('/videos/updateVideo', formData, options) 
export const updateVideoSettings                = (formData) => endpoint.patch('/videos/updateVideoSettings', formData, options) 
export const deleteVideo                        = (id) => endpoint.delete(`/videos/deleteVideo/${id}`, options) 
export const deleteMultipleVideos               = (formData) => endpoint.patch(`/videos/deleteMultipleVideos`, formData, options) 