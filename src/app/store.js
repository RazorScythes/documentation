import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../actions/auth'
import portfolioReducer from '../actions/portfolio'
import settingsSlice from '../actions/settings'
import logsSlice from '../actions/logs'
import videoSlice from '../actions/video'
import uploadsSlice from '../actions/uploads'
import gameSlice from '../actions/game'
import blogsSlice from '../actions/blogs'
import archiveSlice from '../actions/archive'
import projectSlice from '../actions/project'
import adminSlice from '../actions/admin'
import groupSlice from '../actions/groups'
import videosSlice from '../actions/videos'
import userSlice from '../actions/user'
import tagsSlice from '../actions/tags'
import categorySlice from '../actions/category'
import authorSlice from '../actions/author'
import watchSlice from '../actions/watch'
import docsSlice from '../actions/documentation'
import playlistSlice from '../actions/playlist'
import reportSlice from '../actions/report'
import chatSlice from '../actions/chat'
import manageUsersSlice from '../actions/manageUsers'
import budgetSlice from '../actions/budget'
import gameManagerSlice from '../actions/gameManager'
import pageBuilderSlice from '../actions/pageBuilder'

export const store = configureStore({
    reducer: {
        auth        : authReducer,
        portfolio   : portfolioReducer,
        settings    : settingsSlice,
        logs        : logsSlice,
        video       : videoSlice,
        uploads     : uploadsSlice,
        game        : gameSlice,
        blogs       : blogsSlice,
        archive     : archiveSlice,
        project     : projectSlice,
        admin       : adminSlice,
        groups      : groupSlice,
        videos      : videosSlice,
        user        : userSlice,
        tags        : tagsSlice,
        category    : categorySlice,
        author      : authorSlice,
        watch       : watchSlice,
        docs        : docsSlice,
        playlist    : playlistSlice,
        report      : reportSlice,
        chat        : chatSlice,
        manageUsers : manageUsersSlice,
        budget      : budgetSlice,
        gameManager : gameManagerSlice,
        pageBuilder : pageBuilderSlice
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})