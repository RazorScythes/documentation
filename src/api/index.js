import axios from 'axios'
import Cookies from 'universal-cookie';

const cookies = new Cookies();

let Admin_API, User_API

if(import.meta.env.VITE_DEVELOPMENT == "true"){
    Admin_API = axios.create({ baseURL: `${import.meta.env.VITE_APP_PROTOCOL}://${import.meta.env.VITE_APP_LOCALHOST}:${import.meta.env.VITE_APP_SERVER_PORT}/admin`})
    User_API = axios.create({ baseURL: `${import.meta.env.VITE_APP_PROTOCOL}://${import.meta.env.VITE_APP_LOCALHOST}:${import.meta.env.VITE_APP_SERVER_PORT}`})
}
else {
    Admin_API = axios.create({ baseURL: `https://main-api-eight.vercel.app/`})
    User_API = axios.create({ baseURL: `https://main-api-eight.vercel.app/`})
}

User_API.interceptors.request.use((req) => {
    if (localStorage.getItem('profile')) {
        req.headers.token = `${JSON.parse(localStorage.getItem('profile')).token}`;
    }
    if(cookies.get('uid')){
        req.headers.uid = `${cookies.get('uid')}`;
    }
    return req;
});

// User_API.interceptors.request.use((req) => {
//     if(cookies.get('uid')){
//         req.headers.uid = `${cookies.get('uid')}`;
//     }
//     return req;
// });

const options = {
    headers: {
        // Authorization: `Bearer ${cookies.get('myCat')}`
    },
    withCredentials: true,
};

/*
    Admin
*/
export const getOverviewData                            = (formData) => User_API.post('/admin/getOverviewData', formData)

/*
    Sign in
*/
export const SignIn                                     = (formData) => User_API.post('/auth/signin', formData)
export const getAccountRole                             = () => Admin_API.get('/accounts/')


/*
    Portfolio
*/
export const getProject                                 = (formData) => User_API.post('/portfolio/getProject', formData)
export const publishPortfolio                           = (formData) => User_API.post('/portfolio/publishPortfolio', formData)
export const unpublishPortfolio                         = (formData) => User_API.post('/portfolio/unpublishPortfolio', formData)
export const getPortfolio                               = (formData) => User_API.post('/portfolio/getPortfolio', formData)
export const getPortfolioByUsername                     = (formData) => User_API.post('/portfolio/getPortfolioByUsername', formData, options)
export const uploadPortfolioHero                        = (formData) => User_API.post('/portfolio/hero', formData)
export const uploadPortfolioSkills                      = (formData) => User_API.post('/portfolio/skills', formData)
export const uploadPortfolioServices                    = (formData) => User_API.post('/portfolio/services', formData)
export const addPortfolioExperience                     = (formData) => User_API.post('/portfolio/addExperience', formData)
export const updatePortfolioExperience                  = (formData) => User_API.post('/portfolio/updateExperience', formData)
export const addPortfolioProject                        = (formData) => User_API.post('/portfolio/addProject', formData)
export const updatePortfolioProject                     = (formData) => User_API.post('/portfolio/updateProject', formData)
export const deletePortfolioProject                     = (formData) => User_API.post('/portfolio/deleteProject', formData)
export const uploadPortfolioContacts                    = (formData) => User_API.post('/portfolio/uploadContacts', formData)
export const sendTestEmail                              = (formData) => User_API.post('/portfolio/testEmail', formData)
export const sendEmail                                  = (formData) => User_API.post('/portfolio/sendEmail', formData)
export const sendContactUs                              = (formData) => User_API.post('/portfolio/sendContactUs', formData)

/*
    Settings
*/
export const userToken                                  = (formData) => User_API.post('/settings/userToken', formData)
export const verifyEmail                                = (formData) => User_API.post('/settings/verifyEmail', formData)
export const sendVerificationEmail                      = (formData) => User_API.post('/settings/sendVerificationEmail', formData)
export const getProfile                                 = (formData) => User_API.post('/settings/getProfile', formData)
export const updateProfile                              = (formData) => User_API.post('/settings/updateProfile', formData)
export const updatePassword                             = (formData) => User_API.post('/settings/updatePassword', formData)
export const updateOptions                              = (formData) => User_API.post('/settings/updateOptions', formData)
export const getAllUsers                                = (formData) => User_API.post('/settings/getAllUsers', formData)

/*
    Uploads
*/
export const getUserVideo                               = (formData) => User_API.post('/uploads/getUserVideo', formData)
export const getUserGame                                = (formData) => User_API.post('/uploads/getUserGame', formData)
export const getUserBlog                                = (formData) => User_API.post('/uploads/getUserBlog', formData)
export const uploadVideo                                = (formData) => User_API.post('/uploads/uploadVideo', formData)
export const uploadGame                                 = (formData) => User_API.post('/uploads/uploadGame', formData)
export const uploadBlog                                 = (formData) => User_API.post('/uploads/uploadBlog', formData)
export const editVideo                                  = (formData) => User_API.post('/uploads/editVideo', formData)
export const editGame                                   = (formData) => User_API.post('/uploads/editGame', formData)
export const editBlog                                   = (formData) => User_API.post('/uploads/editBlog', formData)
export const removeVideo                                = (formData) => User_API.post('/uploads/removeVideo', formData)
export const bulkRemoveVideo                            = (formData) => User_API.post('/uploads/bulkRemoveVideo', formData)
export const removeGame                                 = (formData) => User_API.post('/uploads/removeGame', formData)
export const bulkRemoveGame                             = (formData) => User_API.post('/uploads/bulkRemoveGame', formData)
export const changePrivacyById                          = (formData) => User_API.post('/uploads/changePrivacyById', formData)
export const changeStrictById                           = (formData) => User_API.post('/uploads/changeStrictById', formData)
export const changeGamePrivacyById                      = (formData) => User_API.post('/uploads/changeGamePrivacyById', formData)
export const changeGameStrictById                       = (formData) => User_API.post('/uploads/changeGameStrictById', formData)
export const changeDownloadById                         = (formData) => User_API.post('/uploads/changeDownloadById', formData)
export const changeBlogPrivacyById                      = (formData) => User_API.post('/uploads/changeBlogPrivacyById', formData)
export const changeBlogStrictById                       = (formData) => User_API.post('/uploads/changeBlogStrictById', formData)
export const removeBlog                                 = (formData) => User_API.post('/uploads/removeBlog', formData)
export const bulkRemoveBlog                             = (formData) => User_API.post('/uploads/bulkRemoveBlog', formData)
export const logsActivity                               = (formData) => User_API.post('/uploads/logsActivity', formData)

/*
    Logs
*/
export const getLogs                                    = (formData) => User_API.post('/logs/getLogs', formData)

/*
    Video
*/
export const getVideos                                  = (formData) => User_API.post('/video/getVideos', formData)
export const addOneLikes                                = (formData) => User_API.post('/video/addOneLikes', formData)
export const addOneDislikes                             = (formData) => User_API.post('/video/addOneDislikes', formData)
export const addOneViews                                = (formData) => User_API.post('/video/addOneViews', formData)
export const getVideoByID                               = (formData) => User_API.post('/video/getVideoByID', formData)
export const getVideoByTag                              = (formData) => User_API.post('/video/getVideoByTag', formData)
export const getVideoByArtist                           = (formData) => User_API.post('/video/getVideoByArtist', formData)
export const getVideoBySearchKey                        = (formData) => User_API.post('/video/getVideoBySearchKey', formData)
export const getComments                                = (formData) => User_API.post('/video/getComments', formData)
export const getRelatedVideos                           = (formData) => User_API.post('/video/getRelatedVideos', formData)
export const uploadComment                              = (formData) => User_API.post('/video/uploadComment', formData)
export const removeComment                              = (formData) => User_API.post('/video/removeComment', formData)
export const addToWatchLater                            = (formData) => User_API.post('/video/addToWatchLater', formData)
export const countVideoTags                             = (formData) => User_API.post('/video/countVideoTags', formData)
export const uploadLists                                = (formData) => User_API.post('/video/uploadLists', formData)
export const uploadReport                               = (formData) => User_API.post('/video/uploadReport', formData)
export const newGroupList                               = (formData) => User_API.post('/video/newGroupList', formData)
export const editGroupList                              = (formData) => User_API.post('/video/editGroupList', formData)
export const removeGroup                                = (formData) => User_API.post('/video/removeGroup', formData)
export const getGroupList                               = (formData) => User_API.post('/video/getGroupList', formData)

/*
    Game
*/

export const getGameByID                                = (formData) => User_API.post('/game/getGameByID', formData)
export const getGames                                   = (formData) => User_API.post('/game/getGames', formData)
export const getRelatedGames                            = (formData) => User_API.post('/game/getRelatedGames', formData)
export const addRatings                                 = (formData) => User_API.post('/game/addRatings', formData, options)
export const countTags                                  = (formData) => User_API.post('/game/countTags', formData, options)
export const categoriesCount                            = (formData) => User_API.post('/game/categoriesCount', formData, options)
export const getGameByTag                               = (formData) => User_API.post('/game/getGameByTag', formData)
export const getGameByDeveloper                         = (formData) => User_API.post('/game/getGameByDeveloper', formData)
export const getGameBySearchKey                         = (formData) => User_API.post('/game/getGameBySearchKey', formData)
export const getRecentGameBlog                          = (formData) => User_API.post('/game/getRecentGameBlog', formData)
export const addRecentGamingBlogLikes                   = (formData) => User_API.post('/game/addRecentGamingBlogLikes', formData)
export const addOneDownload                             = (formData) => User_API.post('/game/addOneDownload', formData)
export const updateGameAccessKey                        = (formData) => User_API.post('/game/updateGameAccessKey', formData)
export const getGameComments                            = (formData) => User_API.post('/game/getGameComments', formData)
export const uploadGameComment                          = (formData) => User_API.post('/game/uploadGameComment', formData)
export const removeGameComment                          = (formData) => User_API.post('/game/removeGameComment', formData)

/*
    Blogs
*/

export const getBlogs                                   = (formData) => User_API.post('/blogs/getBlogs', formData)
export const getLatestBlogs                             = (formData) => User_API.post('/blogs/getLatestBlogs', formData)
export const getBlogByID                                = (formData) => User_API.post('/blogs/getBlogByID', formData)
export const getBlogComments                            = (formData) => User_API.post('/blogs/getBlogComments', formData)
export const uploadBlogComment                          = (formData) => User_API.post('/blogs/uploadBlogComment', formData)
export const removeBlogComment                          = (formData) => User_API.post('/blogs/removeBlogComment', formData)
export const countBlogCategories                        = (formData) => User_API.post('/blogs/countBlogCategories', formData)
export const countBlogCategoriesBySearchKey             = (formData) => User_API.post('/blogs/countBlogCategoriesBySearchKey', formData)
export const addOneBlogViews                            = (formData) => User_API.post('/blogs/addOneBlogViews', formData)
export const addOneBlogLikes                            = (formData) => User_API.post('/blogs/addOneBlogLikes', formData)
export const addOneBlogLikesBySearchKey                 = (formData) => User_API.post('/blogs/addOneBlogLikesBySearchKey', formData)
export const addLatestBlogLikes                         = (formData) => User_API.post('/blogs/addLatestBlogLikes', formData)
export const getBlogsBySearchKey                        = (formData) => User_API.post('/blogs/getBlogsBySearchKey', formData)
export const blogsCountTags                             = (formData) => User_API.post('/blogs/blogsCountTags', formData)

/*
    Archive
*/

export const getArchiveNameById                         = (formData) => User_API.post('/archive/getArchiveNameById', formData)
export const getArchiveDataById                         = (formData) => User_API.post('/archive/getArchiveDataById', formData)
export const newArchiveList                             = (formData) => User_API.post('/archive/newArchiveList', formData)
export const removeArchiveList                          = (formData) => User_API.post('/archive/removeArchiveList', formData)

/* 
    Project
*/
export const getProjectByID                             = (formData) => User_API.post('/project/getProjectByID', formData)
export const getCategory                                = (formData) => User_API.post('/project/getCategory', formData)
export const getAdminCategory                           = (formData) => User_API.post('/project/getAdminCategory', formData)
export const getProjects                                = (formData) => User_API.post('/project/getProjects', formData)
export const getProjectsByCategories                    = (formData) => User_API.post('/project/getProjectsByCategories', formData)
export const getProjectsBySearchKey                     = (formData) => User_API.post('/project/getProjectsBySearchKey', formData)
export const getUserProject                             = (formData) => User_API.post('/project/getUserProject', formData)
export const uploadProject                              = (formData) => User_API.post('/project/uploadProject', formData)
export const editUserProject                            = (formData) => User_API.post('/project/editUserProject', formData)
export const removeUserProject                          = (formData) => User_API.post('/project/removeUserProject', formData)
export const projectCountTags                           = (formData) => User_API.post('/project/projectCountTags', formData)
export const getProjectComments                         = (formData) => User_API.post('/project/getProjectComments', formData)
export const uploadProjectComment                       = (formData) => User_API.post('/project/uploadProjectComment', formData)
export const removeProjectComment                       = (formData) => User_API.post('/project/removeProjectComment', formData)
export const getLatestProjects                          = (formData) => User_API.post('/project/getLatestProjects', formData)