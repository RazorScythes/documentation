import axios from 'axios'
import Cookies from 'universal-cookie';

const cookies   = new Cookies();

const baseURL   = import.meta.env.VITE_DEVELOPMENT == "true" ? 
                    `${import.meta.env.VITE_APP_PROTOCOL}://${import.meta.env.VITE_APP_LOCALHOST}:${import.meta.env.VITE_APP_SERVER_PORT}`
                    : import.meta.env.VITE_APP_BASE_URL

const endpoint  = axios.create({ baseURL })

endpoint.interceptors.request.use((config) => {
    const token = cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
export const register                           = (formData) => endpoint.post('/user/register', formData)
export const googleLogin                        = (formData) => endpoint.post('/user/googleLogin', formData)
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

/*
    PUBLIC
*/
export const getVideosByType                   = (type, params) => endpoint.get(`/watch/getVideosByType/${type}`, { ...options, params })
export const getVideoById                      = (id, access_key) => endpoint.get(`/watch/getVideoById/${id}${access_key ? `/${access_key}` : ''}`, options)
export const getVideoList                      = (id) => endpoint.get(`/watch/getVideoList/${id}`, options)
export const getVideoComment                   = (id) => endpoint.get(`/watch/getVideoComment/${id}`, options)
export const addVideoComment                   = (formData) => endpoint.post('/watch/addVideoComment', formData, options)
export const viewVideo                         = (formData) => endpoint.patch('/watch/viewVideo', formData, options)
export const likeVideo                         = (formData) => endpoint.patch('/watch/likeVideo', formData, options)
export const dislikeVideo                      = (formData) => endpoint.patch('/watch/dislikeVideo', formData, options)
export const toggleSubscribe                   = (formData) => endpoint.patch('/watch/toggleSubscribe', formData, options)
export const updateVideoComment                = (formData) => endpoint.patch('/watch/updateVideoComment', formData, options)
export const deleteVideoComment                = (id, video_id) => endpoint.delete(`/watch/deleteVideoComment/${id}/${video_id}`, options)


/*
    PLAYLIST
*/
export const getPlaylists                      = () => endpoint.get(`/playlist/getPlaylists`, options)
export const getPlaylistById                   = (id) => endpoint.get(`/playlist/getPlaylistById/${id}`, options)
export const createPlaylist                    = (formData) => endpoint.post('/playlist/createPlaylist', formData, options)
export const updatePlaylist                    = (formData) => endpoint.patch('/playlist/updatePlaylist', formData, options)
export const toggleVideoInPlaylist             = (formData) => endpoint.patch('/playlist/toggleVideo', formData, options)
export const removeVideoFromPlaylist           = (formData) => endpoint.patch('/playlist/removeVideo', formData, options)
export const deletePlaylist                    = (id) => endpoint.delete(`/playlist/deletePlaylist/${id}`, options)

/*
    ACCOUNT / LOGS
*/
export const getLogs                           = (params) => endpoint.get(`/account/getLogs`, { ...options, params })
export const clearLogs                         = () => endpoint.delete(`/account/clearLogs`, options)

/*
    ACCOUNT / REPORTS
*/
export const createReport                     = (formData) => endpoint.post('/account/createReport', formData, options)
export const getReports                       = (params) => endpoint.get('/account/getReports', { ...options, params })
export const updateReportStatus               = (formData) => endpoint.patch('/account/updateReportStatus', formData, options)
export const deleteReport                     = (id) => endpoint.delete(`/account/deleteReport/${id}`, options)

/*
    DOCUMENTATION
*/ 
export const getDocs                           = () => endpoint.get(`/documentation/getDocs`)
export const getDocsById                       = (doc_name) => endpoint.get(`/documentation/getDocsById/${doc_name}`)
export const newDocs                           = (formData) => endpoint.post(`/documentation/newDocs`, formData)
export const updateDocsSettings                = (formData) => endpoint.patch('/documentation/updateDocsSettings', formData) 
export const updateDocs                        = (formData) => endpoint.patch('/documentation/updateDocs', formData)
export const deleteDocs                        = (id) => endpoint.delete(`/documentation/deleteDocs/${id}`)
export const deleteMultipleDocs                = (formData) => endpoint.patch('/documentation/deleteMultipleDocs', formData)
export const newDocCategory                    = (formData) => endpoint.post(`/documentation/newDocCategory`, formData)
export const deleteDocCategory                 = (id, category) => endpoint.delete(`/documentation/deleteDocCategory/${id}/${category}`) 
export const updateDocCategory                 = (formData) => endpoint.patch('/documentation/updateDocCategory', formData)

/*
    CHAT
*/
export const getConversations                  = () => endpoint.get('/chat/conversations', options)
export const getOrCreateConversation           = (formData) => endpoint.post('/chat/conversation', formData, options)
export const getMessages                       = (conversationId, params) => endpoint.get(`/chat/messages/${conversationId}`, { ...options, params })
export const sendMessage                       = (formData) => endpoint.post('/chat/message', formData, options)
export const chatSearchUsers                   = (q) => endpoint.get('/chat/searchUsers', { ...options, params: { q } })
export const getUnreadCount                    = () => endpoint.get('/chat/unreadCount', options)
export const deleteMessageForMe                = (messageId) => endpoint.delete(`/chat/message/${messageId}`, options)
export const deleteMessageForAll               = (messageId) => endpoint.delete(`/chat/message/${messageId}/all`, options)
export const deleteConversationForMe           = (conversationId) => endpoint.delete(`/chat/conversation/${conversationId}/me`, options)
export const deleteConversationForAll          = (conversationId) => endpoint.delete(`/chat/conversation/${conversationId}/all`, options)
export const blockUser                         = (formData) => endpoint.post('/chat/block', formData, options)
export const unblockUser                       = (targetUserId) => endpoint.delete(`/chat/block/${targetUserId}`, options)
export const getBlockedUsers                   = () => endpoint.get('/chat/blocked', options)
export const checkBlocked                      = (targetUserId) => endpoint.get(`/chat/blocked/${targetUserId}`, options)