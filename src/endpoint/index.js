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
export const getProfile                         = () => endpoint.get(`/user/getProfile`, options)
export const updateProfile                      = (formData) => endpoint.post(`/user/updateProfile`, formData, options)

/*
    GROUPS
*/
export const getGroups                          = (type) => endpoint.get(`/groups/getGroups/${type}`, options)
export const newGroups                          = (formData) => endpoint.post('/groups/newGroups', formData, options)
export const updateGroups                       = (formData) => endpoint.patch('/groups/updateGroups', formData, options)
export const deleteGroups                       = (id, type) => endpoint.delete(`/groups/deleteGroups/${id}/${type}`, options)
export const deleteMultipleGroups               = (formData) => endpoint.patch('/groups/deleteMultipleGroups', formData, options)

/*
    TAGS
*/
export const getTags                            = (type, option) => endpoint.get(`/tags/getTags/${type}${option ? '/1' : ''}`, options)
export const newTags                            = (formData) => endpoint.post('/tags/newTags', formData, options)
export const updateTags                         = (formData) => endpoint.patch('/tags/updateTags', formData, options)
export const updateTagsSettings                 = (formData) => endpoint.patch('/tags/updateTagsSettings', formData, options) 
export const deleteTags                         = (id, type) => endpoint.delete(`/tags/deleteTags/${id}/${type}`, options)
export const deleteMultipleTags                 = (formData) => endpoint.patch('/tags/deleteMultipleTags', formData, options)

/*
    CATEGORY
*/
export const getCategory                        = (type, option) => endpoint.get(`/category/getCategory/${type}${option ? '/1' : ''}`, options)
export const newCategory                        = (formData) => endpoint.post('/category/newCategory', formData, options)
export const updateCategory                     = (formData) => endpoint.patch('/category/updateCategory', formData, options)
export const updateCategorySettings             = (formData) => endpoint.patch('/category/updateCategorySettings', formData, options) 
export const deleteCategory                     = (id, type) => endpoint.delete(`/category/deleteCategory/${id}/${type}`, options)
export const deleteMultipleCategory             = (formData) => endpoint.patch('/category/deleteMultipleCategory', formData, options)

/*
    AUTHOR
*/
export const getAuthor                          = (type, option) => endpoint.get(`/author/getAuthor/${type}${option ? '/1' : ''}`, options)
export const newAuthor                          = (formData) => endpoint.post('/author/newAuthor', formData, options)
export const updateAuthor                       = (formData) => endpoint.patch('/author/updateAuthor', formData, options)
export const deleteAuthor                       = (id, type) => endpoint.delete(`/author/deleteAuthor/${id}/${type}`, options)
export const deleteMultipleAuthor               = (formData) => endpoint.patch('/author/deleteMultipleAuthor', formData, options)

/*
    VIDEOS
*/
export const getUserVideos                      = () => endpoint.get('/videos/getUserVideos', options)
export const newVideo                           = (formData) => endpoint.post('/videos/newVideo', formData, options) 
export const updateVideo                        = (formData) => endpoint.patch('/videos/updateVideo', formData, options) 
export const updateVideoSettings                = (formData) => endpoint.patch('/videos/updateVideoSettings', formData, options) 
export const deleteVideo                        = (id) => endpoint.delete(`/videos/deleteVideo/${id}`, options) 
export const deleteMultipleVideos               = (formData) => endpoint.patch(`/videos/deleteMultipleVideos`, formData, options) 