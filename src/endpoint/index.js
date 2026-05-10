import axios from 'axios'
import Cookies from 'universal-cookie';

const cookies   = new Cookies();

const baseURL   = import.meta.env.VITE_DEVELOPMENT == "true" ? 
                    `${import.meta.env.VITE_APP_PROTOCOL}://${import.meta.env.VITE_APP_LOCALHOST}:${import.meta.env.VITE_APP_SERVER_PORT}`
                    : import.meta.env.VITE_APP_BASE_URL

const endpoint  = axios.create({ baseURL })

endpoint.interceptors.request.use((config) => {
    const token = cookies.get('token', { doNotParse: true });
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

endpoint.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403 && error.response?.data?.alert?.type === 'banned') {
            cookies.remove('token');
            localStorage.removeItem('profile');
            localStorage.removeItem('avatar');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const getOptions = () => ({
    headers: {
        'Content-Type': 'application/json',
    },
});

/*
    USER
*/
export const login                              = (formData) => endpoint.post('/user/login', formData)
export const register                           = (formData) => endpoint.post('/user/register', formData)
export const googleLogin                        = (formData) => endpoint.post('/user/googleLogin', formData)
export const getProfile                         = () => endpoint.get(`/user/getProfile`, getOptions())
export const updateProfile                      = (formData) => endpoint.post(`/user/updateProfile`, formData, getOptions())
export const getAllUsers                         = () => endpoint.get('/user/getAllUsers', getOptions())
export const updateUserRole                     = (formData) => endpoint.patch('/user/updateRole', formData, getOptions())
export const deleteUser                         = (id) => endpoint.delete(`/user/deleteUser/${id}`, getOptions())
export const banUser                            = (formData) => endpoint.post('/user/banUser', formData, getOptions())
export const unbanUser                          = (id) => endpoint.delete(`/user/unbanUser/${id}`, getOptions())
export const getSettings                        = () => endpoint.get('/user/getSettings', getOptions())
export const updateSettings                     = (formData) => endpoint.post('/user/updateSettings', formData, getOptions())
export const deleteAccount                      = (formData) => endpoint.delete('/user/deleteAccount', { ...getOptions(), data: formData })
export const changePassword                     = (formData) => endpoint.post('/user/changePassword', formData, getOptions())
export const sendVerificationEmail              = () => endpoint.post('/user/sendVerificationEmail', {}, getOptions())
export const verifyEmailToken                   = (formData) => endpoint.post('/user/verifyEmail', formData)
export const getPublicProfile                   = (username) => endpoint.get(`/user/profile/${username}`)

/*
    GROUPS
*/
export const getGroups                          = (type) => endpoint.get(`/groups/getGroups/${type}`, getOptions())
export const newGroups                          = (formData) => endpoint.post('/groups/newGroups', formData, getOptions())
export const updateGroups                       = (formData) => endpoint.patch('/groups/updateGroups', formData, getOptions())
export const deleteGroups                       = (id, type) => endpoint.delete(`/groups/deleteGroups/${id}/${type}`, getOptions())
export const deleteMultipleGroups               = (formData) => endpoint.patch('/groups/deleteMultipleGroups', formData, getOptions())

/*
    TAGS
*/
export const getTags                            = (type, option) => endpoint.get(`/tags/getTags/${type}${option ? '/1' : ''}`, getOptions())
export const newTags                            = (formData) => endpoint.post('/tags/newTags', formData, getOptions())
export const updateTags                         = (formData) => endpoint.patch('/tags/updateTags', formData, getOptions())
export const updateTagsSettings                 = (formData) => endpoint.patch('/tags/updateTagsSettings', formData, getOptions()) 
export const deleteTags                         = (id, type) => endpoint.delete(`/tags/deleteTags/${id}/${type}`, getOptions())
export const deleteMultipleTags                 = (formData) => endpoint.patch('/tags/deleteMultipleTags', formData, getOptions())

/*
    CATEGORY
*/
export const getCategory                        = (type, option) => endpoint.get(`/category/getCategory/${type}${option ? '/1' : ''}`, getOptions())
export const newCategory                        = (formData) => endpoint.post('/category/newCategory', formData, getOptions())
export const updateCategory                     = (formData) => endpoint.patch('/category/updateCategory', formData, getOptions())
export const updateCategorySettings             = (formData) => endpoint.patch('/category/updateCategorySettings', formData, getOptions()) 
export const deleteCategory                     = (id, type) => endpoint.delete(`/category/deleteCategory/${id}/${type}`, getOptions())
export const deleteMultipleCategory             = (formData) => endpoint.patch('/category/deleteMultipleCategory', formData, getOptions())

/*
    AUTHOR
*/
export const getAuthor                          = (type, option) => endpoint.get(`/author/getAuthor/${type}${option ? '/1' : ''}`, getOptions())
export const newAuthor                          = (formData) => endpoint.post('/author/newAuthor', formData, getOptions())
export const updateAuthor                       = (formData) => endpoint.patch('/author/updateAuthor', formData, getOptions())
export const deleteAuthor                       = (id, type) => endpoint.delete(`/author/deleteAuthor/${id}/${type}`, getOptions())
export const deleteMultipleAuthor               = (formData) => endpoint.patch('/author/deleteMultipleAuthor', formData, getOptions())

/*
    VIDEOS
*/
export const getUserVideos                      = () => endpoint.get('/videos/getUserVideos', getOptions())
export const newVideo                           = (formData) => endpoint.post('/videos/newVideo', formData, getOptions()) 
export const updateVideo                        = (formData) => endpoint.patch('/videos/updateVideo', formData, getOptions()) 
export const updateVideoSettings                = (formData) => endpoint.patch('/videos/updateVideoSettings', formData, getOptions()) 
export const deleteVideo                        = (id) => endpoint.delete(`/videos/deleteVideo/${id}`, getOptions()) 
export const deleteMultipleVideos               = (formData) => endpoint.patch(`/videos/deleteMultipleVideos`, formData, getOptions()) 

/*
    HOME
*/
export const getHomeData                       = () => endpoint.get('/home/getHomeData')

/*
    PUBLIC
*/
export const getVideosByType                   = (type, params) => endpoint.get(`/watch/getVideosByType/${type}`, { ...getOptions(), params })
export const getVideoById                      = (id, access_key) => endpoint.get(`/watch/getVideoById/${id}${access_key ? `/${access_key}` : ''}`, getOptions())
export const getVideoList                      = (id) => endpoint.get(`/watch/getVideoList/${id}`, getOptions())
export const getRelatedVideos                  = (id, params) => endpoint.get(`/watch/getRelatedVideos/${id}`, { ...getOptions(), params })
export const getVideoComment                   = (id) => endpoint.get(`/watch/getVideoComment/${id}`, getOptions())
export const addVideoComment                   = (formData) => endpoint.post('/watch/addVideoComment', formData, getOptions())
export const viewVideo                         = (formData) => endpoint.patch('/watch/viewVideo', formData, getOptions())
export const likeVideo                         = (formData) => endpoint.patch('/watch/likeVideo', formData, getOptions())
export const dislikeVideo                      = (formData) => endpoint.patch('/watch/dislikeVideo', formData, getOptions())
export const toggleSubscribe                   = (formData) => endpoint.patch('/watch/toggleSubscribe', formData, getOptions())
export const updateVideoComment                = (formData) => endpoint.patch('/watch/updateVideoComment', formData, getOptions())
export const deleteVideoComment                = (id, video_id) => endpoint.delete(`/watch/deleteVideoComment/${id}/${video_id}`, getOptions())

/*
    GAME COMMENTS
*/
export const getGameComment                    = (gameId) => endpoint.post('/game/getGameComments', { gameId }, getOptions())
export const addGameComment                    = (formData) => endpoint.post('/game/uploadGameComment', formData, getOptions())
export const updateGameComment                 = (formData) => endpoint.patch('/game/updateGameComment', formData, getOptions())
export const deleteGameComment                 = (id, game_id) => endpoint.delete(`/game/removeGameComment/${id}/${game_id}`, getOptions())


/*
    PLAYLIST
*/
export const getPlaylists                      = () => endpoint.get(`/playlist/getPlaylists`, getOptions())
export const getPlaylistById                   = (id) => endpoint.get(`/playlist/getPlaylistById/${id}`, getOptions())
export const createPlaylist                    = (formData) => endpoint.post('/playlist/createPlaylist', formData, getOptions())
export const updatePlaylist                    = (formData) => endpoint.patch('/playlist/updatePlaylist', formData, getOptions())
export const toggleVideoInPlaylist             = (formData) => endpoint.patch('/playlist/toggleVideo', formData, getOptions())
export const removeVideoFromPlaylist           = (formData) => endpoint.patch('/playlist/removeVideo', formData, getOptions())
export const deletePlaylist                    = (id) => endpoint.delete(`/playlist/deletePlaylist/${id}`, getOptions())

/*
    ACCOUNT / LOGS
*/
export const getLogs                           = (params) => endpoint.get(`/account/getLogs`, { ...getOptions(), params })
export const clearLogs                         = () => endpoint.delete(`/account/clearLogs`, getOptions())

/*
    ACCOUNT / REPORTS
*/
export const createReport                     = (formData) => endpoint.post('/account/createReport', formData, getOptions())
export const getReports                       = (params) => endpoint.get('/account/getReports', { ...getOptions(), params })
export const updateReportStatus               = (formData) => endpoint.patch('/account/updateReportStatus', formData, getOptions())
export const deleteReport                     = (id) => endpoint.delete(`/account/deleteReport/${id}`, getOptions())

/*
    ACCOUNT / 2FA
*/
export const get2FAStatus                     = () => endpoint.get('/account/get2FAStatus', getOptions())
export const toggle2FA                        = () => endpoint.post('/account/toggle2FA', {}, getOptions())

/*
    ACCOUNT / SESSIONS
*/
export const getSessions                      = () => endpoint.get('/account/getSessions', getOptions())
export const revokeSession                    = (sessionId) => endpoint.delete(`/account/revokeSession/${sessionId}`, getOptions())
export const revokeAllSessions                = () => endpoint.delete('/account/revokeAllSessions', getOptions())

/*
    ACCOUNT / EXPORT
*/
export const exportAccountData                = () => endpoint.get('/account/exportData', getOptions())

/*
    ACCOUNT / NOTIFICATIONS
*/
export const getNotificationPrefs             = () => endpoint.get('/account/getNotificationPrefs', getOptions())
export const updateNotificationPrefs          = (formData) => endpoint.post('/account/updateNotificationPrefs', formData, getOptions())

/*
    NOTIFICATIONS (INBOX)
*/
export const getNotifications                 = (params) => endpoint.get('/notification/getNotifications', { ...getOptions(), params })
export const getUnreadNotificationCount       = () => endpoint.get('/notification/getUnreadCount', getOptions())
export const markNotificationAsRead           = (id) => endpoint.patch(`/notification/markAsRead/${id}`, {}, getOptions())
export const markAllNotificationsAsRead       = () => endpoint.patch('/notification/markAllAsRead', {}, getOptions())
export const deleteNotification               = (id) => endpoint.delete(`/notification/delete/${id}`, getOptions())
export const clearAllNotifications            = () => endpoint.delete('/notification/clearAll', getOptions())

/*
    ACCOUNT / SOCIAL
*/
export const getSocialLinks                   = () => endpoint.get('/account/getSocialLinks', getOptions())
export const updateSocialLinks                = (formData) => endpoint.post('/account/updateSocialLinks', formData, getOptions())

/*
    ACCOUNT / SECURITY
*/
export const getSecurityLog                   = (params) => endpoint.get('/account/getSecurityLog', { ...getOptions(), params })
export const getProfileCompleteness           = () => endpoint.get('/account/getProfileCompleteness', getOptions())

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
export const renameDocCategory                 = (formData) => endpoint.patch('/documentation/renameDocCategory', formData)
export const renameDocSubCategory              = (formData) => endpoint.patch('/documentation/renameDocSubCategory', formData)
export const deleteEntireDocCategory           = (categoryId, category) => endpoint.delete(`/documentation/deleteEntireDocCategory/${categoryId}/${category}`)
export const addDocSubCategory                 = (formData) => endpoint.post('/documentation/addDocSubCategory', formData)

/*
    CHAT
*/
export const getConversations                  = () => endpoint.get('/chat/conversations', getOptions())
export const getOrCreateConversation           = (formData) => endpoint.post('/chat/conversation', formData, getOptions())
export const getMessages                       = (conversationId, params) => endpoint.get(`/chat/messages/${conversationId}`, { ...getOptions(), params })
export const sendMessage                       = (formData) => endpoint.post('/chat/message', formData, getOptions())
export const chatSearchUsers                   = (q) => endpoint.get('/chat/searchUsers', { ...getOptions(), params: { q } })
export const getUnreadCount                    = () => endpoint.get('/chat/unreadCount', getOptions())
export const deleteMessageForMe                = (messageId) => endpoint.delete(`/chat/message/${messageId}`, getOptions())
export const deleteMessageForAll               = (messageId) => endpoint.delete(`/chat/message/${messageId}/all`, getOptions())
export const deleteConversationForMe           = (conversationId) => endpoint.delete(`/chat/conversation/${conversationId}/me`, getOptions())
export const deleteConversationForAll          = (conversationId) => endpoint.delete(`/chat/conversation/${conversationId}/all`, getOptions())
export const blockUser                         = (formData) => endpoint.post('/chat/block', formData, getOptions())
export const unblockUser                       = (targetUserId) => endpoint.delete(`/chat/block/${targetUserId}`, getOptions())
export const getBlockedUsers                   = () => endpoint.get('/chat/blocked', getOptions())
export const checkBlocked                      = (targetUserId) => endpoint.get(`/chat/blocked/${targetUserId}`, getOptions())

/*
    BUDGET
*/
export const getBudgetDashboard                = (params) => endpoint.get('/budget/dashboard', { params })
export const getBudgetCategories               = () => endpoint.get('/budget/categories')
export const createBudgetCategory              = (formData) => endpoint.post('/budget/category', formData)
export const updateBudgetCategory              = (formData) => endpoint.patch('/budget/category', formData)
export const deleteBudgetCategory              = (id) => endpoint.delete(`/budget/category/${id}`)
export const shareBudgetCategory               = (formData) => endpoint.post('/budget/category/share', formData)
export const unshareBudgetCategory             = (formData) => endpoint.post('/budget/category/unshare', formData)
export const importBudgetCSV                   = (formData) => endpoint.post('/budget/import-csv', formData)
export const searchBudgetExpenses              = (params) => endpoint.get('/budget/search', { params })
export const processRecurring                  = () => endpoint.post('/budget/recurring/process')
export const getBudgetExpenses                 = (params) => endpoint.get('/budget/expenses', { params })
export const createBudgetExpense               = (formData) => endpoint.post('/budget/expense', formData)
export const updateBudgetExpense               = (formData) => endpoint.patch('/budget/expense', formData)
export const deleteBudgetExpense               = (id, params) => endpoint.delete(`/budget/expense/${id}`, { params })
export const bulkDeleteBudgetExpenses          = (formData) => endpoint.post('/budget/expenses/bulkDelete', formData)
export const bulkUpdateBudgetCategory          = (formData) => endpoint.patch('/budget/expenses/bulkCategory', formData)
export const bulkUpdateBudgetCurrency          = (formData) => endpoint.patch('/budget/expenses/bulkCurrency', formData)
export const deleteReceipt                     = (formData) => endpoint.post('/budget/receipt/delete', formData)
export const getExchangeRates                  = () => endpoint.get('/budget/exchange-rates')
export const saveExchangeRates                 = (formData) => endpoint.post('/budget/exchange-rates', formData)
export const resetExchangeRates                = () => endpoint.post('/budget/exchange-rates/reset')
export const saveBudgetSettings                = (formData) => endpoint.post('/budget/settings', formData)
export const getSavings                        = () => endpoint.get('/budget/savings')
export const saveSavings                       = (formData) => endpoint.post('/budget/savings', formData)
export const getSavingsHistory                 = () => endpoint.get('/budget/savings/history')
export const deleteSavingsHistory              = (id) => endpoint.delete(`/budget/savings/history/${id}`)
export const getDebts                          = () => endpoint.get('/budget/debts')
export const createDebt                        = (formData) => endpoint.post('/budget/debt', formData)
export const updateDebt                        = (formData) => endpoint.patch('/budget/debt', formData)
export const deleteDebt                        = (id) => endpoint.delete(`/budget/debt/${id}`)
export const addDebtPayment                    = (id, formData) => endpoint.post(`/budget/debt/${id}/payment`, formData)
export const removeDebtPayment                 = (id, paymentId) => endpoint.delete(`/budget/debt/${id}/payment/${paymentId}`)
export const toggleDebtStatus                  = (id) => endpoint.patch(`/budget/debt/${id}/toggle`)
export const getBudgetLists                    = () => endpoint.get('/budget/lists')
export const createBudgetList                  = (formData) => endpoint.post('/budget/list', formData)
export const updateBudgetList                  = (formData) => endpoint.patch('/budget/list', formData)
export const deleteBudgetList                  = (id) => endpoint.delete(`/budget/list/${id}`)
export const getFinancialGoals                 = () => endpoint.get('/budget/goals')
export const createFinancialGoal               = (formData) => endpoint.post('/budget/goal', formData)
export const updateFinancialGoal               = (formData) => endpoint.patch('/budget/goal', formData)
export const deleteFinancialGoal               = (id) => endpoint.delete(`/budget/goal/${id}`)
export const addGoalContribution               = (id, formData) => endpoint.post(`/budget/goal/${id}/contribution`, formData)

/*
    PORTFOLIO
*/
export const getPortfolio                      = (formData) => endpoint.post('/portfolio/getPortfolio', formData)
export const getPortfolioByUsername             = (formData) => endpoint.post('/portfolio/getPortfolioByUsername', formData)
export const getProject                        = (formData) => endpoint.post('/portfolio/getProject', formData)
export const uploadPortfolioHero               = (formData) => endpoint.post('/portfolio/hero', formData)
export const uploadPortfolioSkills             = (formData) => endpoint.post('/portfolio/skills', formData)
export const uploadPortfolioServices           = (formData) => endpoint.post('/portfolio/services', formData)
export const addPortfolioExperience            = (formData) => endpoint.post('/portfolio/addExperience', formData)
export const updatePortfolioExperience         = (formData) => endpoint.post('/portfolio/updateExperience', formData)
export const addPortfolioProject               = (formData) => endpoint.post('/portfolio/addProject', formData)
export const updatePortfolioProject            = (formData) => endpoint.post('/portfolio/updateProject', formData)
export const deletePortfolioProject            = (formData) => endpoint.post('/portfolio/deleteProject', formData)
export const uploadPortfolioContacts           = (formData) => endpoint.post('/portfolio/uploadContacts', formData)
export const sendTestEmail                     = (formData) => endpoint.post('/portfolio/testEmail', formData)
export const sendEmail                         = (formData) => endpoint.post('/portfolio/sendEmail', formData)
export const sendContactUs                     = (formData) => endpoint.post('/portfolio/sendContactUs', formData)
export const uploadPortfolioEducation          = (formData) => endpoint.post('/portfolio/education', formData)
export const uploadPortfolioLanguages          = (formData) => endpoint.post('/portfolio/languages', formData)
export const uploadPortfolioCertifications     = (formData) => endpoint.post('/portfolio/certifications', formData)
export const updatePortfolioLayout             = (formData) => endpoint.post('/portfolio/updateLayout', formData)
export const publishPortfolio                  = (formData) => endpoint.post('/portfolio/publishPortfolio', formData)
export const unpublishPortfolio                = (formData) => endpoint.post('/portfolio/unpublishPortfolio', formData)

/*
    GAME
*/
export const getMyGames                       = () => endpoint.get('/game')
export const getGameById                      = (id) => endpoint.get(`/game/${id}`)
export const createGame                       = (formData) => endpoint.post('/game', formData)
export const updateGame                       = (id, formData) => endpoint.patch(`/game/${id}`, formData)
export const deleteGame                       = (id) => endpoint.delete(`/game/${id}`)
export const bulkDeleteGames                  = (formData) => endpoint.post('/game/bulkDelete', formData)
export const bulkUpdateGames                 = (formData) => endpoint.post('/game/bulkUpdate', formData)
export const toggleGamePrivacy                = (id) => endpoint.patch(`/game/${id}/privacy`)
export const toggleGameStrict                 = (id) => endpoint.patch(`/game/${id}/strict`)
export const getGameTrash                    = () => endpoint.get('/game/trash/list')
export const restoreGame                     = (id) => endpoint.patch(`/game/trash/restore/${id}`)
export const permanentDeleteGame             = (id) => endpoint.delete(`/game/trash/permanent/${id}`)
export const emptyGameTrash                  = () => endpoint.delete('/game/trash/empty')
export const getGameAnalytics                = (formData) => endpoint.post('/game/analytics', formData)

/*
    PAGE BUILDER
*/
export const getPages                        = () => endpoint.get('/page/pages', getOptions())
export const getTrashPages                   = () => endpoint.get('/page/trash', getOptions())
export const getPageForEdit                  = (id) => endpoint.get(`/page/edit/${id}`, getOptions())
export const getPageBySlug                   = (slug) => endpoint.get(`/page/${slug}`)
export const createPage                      = (formData) => endpoint.post('/page/', formData, getOptions())
export const updatePage                      = (formData) => endpoint.patch('/page/', formData, getOptions())
export const deletePage                      = (id) => endpoint.delete(`/page/${id}`, getOptions())
export const duplicatePage                   = (formData) => endpoint.post('/page/duplicate', formData, getOptions())
export const togglePagePrivacy               = (id) => endpoint.patch(`/page/privacy/${id}`, {}, getOptions())
export const restorePage                     = (id) => endpoint.patch(`/page/restore/${id}`, {}, getOptions())
export const permanentDeletePage             = (id) => endpoint.delete(`/page/permanent/${id}`, getOptions())
export const emptyTrash                      = () => endpoint.delete('/page/empty-trash', getOptions())
export const getPageImages                   = () => endpoint.get('/page/images/all', getOptions())
export const uploadPageImages                = (formData) => endpoint.post('/page/images', formData, getOptions())
export const deletePageImage                 = (id) => endpoint.delete(`/page/images/${id}`, getOptions())

/*
    COMMUNITY
*/
export const getCommunities                  = (params) => endpoint.get('/community', { params })
export const getCommunityBySlug              = (slug) => endpoint.get(`/community/${slug}`)
export const createCommunity                 = (formData) => endpoint.post('/community', formData, getOptions())
export const updateCommunity                 = (id, formData) => endpoint.patch(`/community/${id}`, formData, getOptions())
export const deleteCommunity                 = (id) => endpoint.delete(`/community/${id}`, getOptions())
export const joinCommunity                   = (id, body = {}) => endpoint.post(`/community/${id}/join`, body, getOptions())
export const leaveCommunity                  = (id) => endpoint.post(`/community/${id}/leave`, {}, getOptions())
export const joinCommunityByCode             = (code) => endpoint.post(`/community/invite/${code}/join`, {}, getOptions())
export const regenerateInviteCode            = (id) => endpoint.post(`/community/${id}/regenerate-invite`, {}, getOptions())
export const addCommunityModerator           = (id, formData) => endpoint.post(`/community/${id}/moderator`, formData, getOptions())
export const removeCommunityModerator        = (id, userId) => endpoint.delete(`/community/${id}/moderator/${userId}`, getOptions())
export const banFromCommunity                = (id, formData) => endpoint.post(`/community/${id}/ban`, formData, getOptions())
export const unbanFromCommunity              = (id, userId) => endpoint.delete(`/community/${id}/ban/${userId}`, getOptions())

/*
    FORUM
*/
export const getForumFeed                    = (params) => endpoint.get('/forum/feed', { ...getOptions(), params })
export const getForumPosts                   = (params) => endpoint.get('/forum/posts', { params })
export const getForumPost                    = (id) => endpoint.get(`/forum/posts/${id}`)
export const createForumPost                 = (formData) => endpoint.post('/forum/posts', formData, getOptions())
export const updateForumPost                 = (id, formData) => endpoint.patch(`/forum/posts/${id}`, formData, getOptions())
export const deleteForumPost                 = (id) => endpoint.delete(`/forum/posts/${id}`, getOptions())
export const toggleForumPostPin              = (id) => endpoint.post(`/forum/posts/${id}/pin`, {}, getOptions())
export const toggleForumPostLock             = (id) => endpoint.post(`/forum/posts/${id}/lock`, {}, getOptions())
export const voteForumPost                   = (id, formData) => endpoint.post(`/forum/posts/${id}/vote`, formData, getOptions())
export const getForumComments                = (postId, params) => endpoint.get(`/forum/posts/${postId}/comments`, { params })
export const createForumComment              = (postId, formData) => endpoint.post(`/forum/posts/${postId}/comments`, formData, getOptions())
export const updateForumComment              = (id, formData) => endpoint.patch(`/forum/comments/${id}`, formData, getOptions())
export const deleteForumComment              = (id) => endpoint.delete(`/forum/comments/${id}`, getOptions())
export const voteForumComment                = (id, formData) => endpoint.post(`/forum/comments/${id}/vote`, formData, getOptions())
export const getForumTags                    = () => endpoint.get('/forum/tags')
export const searchForum                     = (params) => endpoint.get('/forum/search', { params })

/*
    BLOB STORAGE
*/
export const getBlobList                     = (params) => endpoint.get('/blob-storage/list', { ...getOptions(), params })
export const getBlobStats                    = () => endpoint.get('/blob-storage/stats', getOptions())
export const getUnusedBlobs                  = () => endpoint.get('/blob-storage/unused', getOptions())
export const deleteBlobs                     = (urls) => endpoint.post('/blob-storage/delete', { urls }, getOptions())

/*
    MONGO STORAGE
*/
export const getMongoStats                  = () => endpoint.get('/mongo-storage/stats', getOptions())
export const getMongoCollections            = (db) => endpoint.get('/mongo-storage/collections', { ...getOptions(), params: db ? { db } : {} })
export const getMongoDocuments              = (params) => endpoint.get('/mongo-storage/documents', { ...getOptions(), params })
export const createMongoDatabase            = (name) => endpoint.post('/mongo-storage/create-db', { name }, getOptions())
