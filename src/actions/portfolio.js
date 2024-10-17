import * as api from '../api'
import { createSlice } from '@reduxjs/toolkit'
import { requestAPI } from '../api/function'

const initialState = {
    error               : '',
    isLoading           : false,
    alert               : '',
    variant             : '',
    data                : {},
    notFound            : false,
    published           : false,
    project             : {},
    mailStatus          : ''
}

export const uploadHero                                 = await requestAPI('portfolio/uploadHero', api.uploadPortfolioHero)
export const uploadSkills                               = await requestAPI('portfolio/uploadSkills', api.uploadPortfolioSkills)
export const uploadServices                             = await requestAPI('portfolio/uploadServices', api.uploadPortfolioServices)
export const addExperience                              = await requestAPI('portfolio/addExperience', api.addPortfolioExperience)
export const updateExperience                           = await requestAPI('portfolio/updateExperience', api.updatePortfolioExperience)
export const addProject                                 = await requestAPI('portfolio/addProject', api.addPortfolioProject)
export const updateProject                              = await requestAPI('portfolio/updateProject', api.updatePortfolioProject)
export const deleteProject                              = await requestAPI('portfolio/deleteProject', api.deletePortfolioProject)
export const sendTestEmail                              = await requestAPI('portfolio/sendTestEmail', api.sendTestEmail)
export const sendEmail                                  = await requestAPI('portfolio/sendEmail', api.sendEmail)
export const sendContactUs                              = await requestAPI('portfolio/sendContactUs', api.sendContactUs)
export const uploadContacts                             = await requestAPI('portfolio/uploadContacts', api.uploadPortfolioContacts)
export const getPortfolio                               = await requestAPI('portfolio/getPortfolio', api.getPortfolio)
export const publishPortfolio                           = await requestAPI('portfolio/publishPortfolio', api.publishPortfolio)
export const unpublishPortfolio                         = await requestAPI('portfolio/unpublishPortfolio', api.unpublishPortfolio)
export const getPortfolioByUsername                     = await requestAPI('portfolio/getPortfolioByUsername', api.getPortfolioByUsername)
export const getProject                                 = await requestAPI('portfolio/getProject', api.getProject)

export const portfolioSlice = createSlice({
    name: 'portfolio',
    initialState,
    extraReducers: (builder) => {
      builder.addCase(publishPortfolio.fulfilled, (state, action) => {
        state.data              = action.payload.data.result
        state.error             = ''
        state.isLoading         = false
      }),

      builder.addCase(unpublishPortfolio.fulfilled, (state, action) => {
        state.data              = action.payload.data.result
        state.error             = ''
        state.isLoading         = false
      }),

      builder.addCase(getPortfolio.fulfilled, (state, action) => {
        state.data              = action.payload.data.result
        state.error             = ''
        state.isLoading         = false
      }),
      builder.addCase(getPortfolio.rejected, (state, action) => {
        state.alert             = action.payload.message
        state.variant           = action.payload.variant
      }),

      builder.addCase(getProject.fulfilled, (state, action) => {
        if(!action.payload.data.published) state.published = true
        else state.published = !action.payload.data.published
        state.project           = action.payload.data.result
        state.error             = ''
        state.isLoading         = false
      }),
      builder.addCase(getProject.rejected, (state, action) => {
        state.notFound          = true
        state.alert             = action.payload.message
        state.variant           = action.payload.variant
      }),

      builder.addCase(getPortfolioByUsername.fulfilled, (state, action) => {
        if(!action.payload.data.published) state.published = true
        state.data              = action.payload.data.result
        state.error             = ''
        state.isLoading         = false
      }),
      builder.addCase(getPortfolioByUsername.rejected, (state, action) => {
        state.alert             = action.payload.message
        state.variant           = action.payload.variant
        state.notFound          = true
      }),

      builder.addCase(uploadHero.fulfilled, (state, action) => {
        state.data              = action.payload.data.result
        state.alert             = action.payload.data.alert
        state.variant           = action.payload.data.variant
        state.error             = ''
        state.isLoading         = false
      }),
      builder.addCase(uploadHero.rejected, (state, action) => {
        state.alert             = action.payload.message
        state.variant           = action.payload.variant
      }),

      builder.addCase(uploadSkills.fulfilled, (state, action) => {
        state.data              = action.payload.data.result
        state.alert             = action.payload.data.alert
        state.variant           = action.payload.data.variant
        state.error             = ''
        state.isLoading         = false
      }),
      builder.addCase(uploadSkills.rejected, (state, action) => {
        state.alert             = action.payload.message
        state.variant           = action.payload.variant
      }),

      builder.addCase(uploadServices.fulfilled, (state, action) => {
        state.data              = action.payload.data.result
        state.alert             = action.payload.data.alert
        state.variant           = action.payload.data.variant
        state.error             = ''
        state.isLoading         = false
      }),
      builder.addCase(uploadServices.rejected, (state, action) => {
        state.alert             = action.payload.message
        state.variant           = action.payload.variant
      }),

      builder.addCase(addExperience.fulfilled, (state, action) => {
        state.data              = action.payload.data.result
        state.alert             = action.payload.data.alert
        state.variant           = action.payload.data.variant
        state.error             = ''
        state.isLoading         = false
      }),
      builder.addCase(addExperience.rejected, (state, action) => {
        state.alert             = action.payload.message
        state.variant           = action.payload.variant
      }),

      builder.addCase(updateExperience.fulfilled, (state, action) => {
        state.data              = action.payload.data.result
        state.alert             = action.payload.data.alert
        state.variant           = action.payload.data.variant
        state.error             = ''
        state.isLoading         = false
      }),

      builder.addCase(uploadContacts.fulfilled, (state, action) => {
        state.data              = action.payload.data.result
        state.alert             = action.payload.data.alert
        state.variant           = action.payload.data.variant
        state.error             = ''
        state.isLoading         = false
      }),
      builder.addCase(uploadContacts.rejected, (state, action) => {
        state.alert             = action.payload.message
        state.variant           = action.payload.variant
      }),

      builder.addCase(addProject.rejected, (state, action) => {
        state.alert             = action.payload.message
        state.variant           = action.payload.variant
      }),
      builder.addCase(addProject.fulfilled, (state, action) => {
        state.data              = action.payload.data.result
        state.alert             = action.payload.data.alert
        state.variant           = action.payload.data.variant
        state.error             = ''
        state.isLoading         = false
      }),

      builder.addCase(updateProject.rejected, (state, action) => {
        state.alert             = action.payload.message
        state.variant           = action.payload.variant
      }),
      builder.addCase(updateProject.fulfilled, (state, action) => {
        state.data              = action.payload.data.result
        state.alert             = action.payload.data.alert
        state.variant           = action.payload.data.variant
        state.error             = ''
        state.isLoading         = false
      }),

      builder.addCase(deleteProject.rejected, (state, action) => {
        state.alert             = action.payload.message
        state.variant           = action.payload.variant
      }),

      builder.addCase(sendTestEmail.fulfilled, (state, action) => {
        state.alert             = action.payload.data.alert
        state.variant           = action.payload.data.variant
      }),
      builder.addCase(sendTestEmail.rejected, (state, action) => {
        state.alert             = action.payload.message
        state.variant           = action.payload.variant
      }),

      builder.addCase(sendEmail.fulfilled, (state, action) => {
        state.mailStatus        = action.payload.data.mailStatus
      }),
      builder.addCase(sendEmail.rejected, (state, action) => {
        state.mailStatus        = action.payload.mailStatus
      }),

      builder.addCase(sendContactUs.fulfilled, (state, action) => {
        state.mailStatus        = action.payload.data.mailStatus
      }),
      builder.addCase(sendContactUs.rejected, (state, action) => {
        state.mailStatus        = action.payload.mailStatus
      }),

      builder.addCase(deleteProject.fulfilled, (state, action) => {
        state.data              = action.payload.data.result
        state.alert             = action.payload.data.alert
        state.variant           = action.payload.data.variant
        state.error             = ''
        state.isLoading         = false
      }),

      builder.addCase(updateExperience.rejected, (state, action) => {
        state.alert             = action.payload.message
        state.variant           = action.payload.variant
      })
    },
    reducers: {
      clearAlert: (state) => {
        state.alert             = '',
        state.variant           = ''
      },
      clearMailStatus: (state) => {
        state.mailStatus        = ''
      },
      clearProjectSingle: (state) => {
        state.notFound          = false
        state.published         = false
        state.project           = {}
      }
    },
})

export const { clearAlert, clearMailStatus, clearProjectSingle } = portfolioSlice.actions

export default portfolioSlice.reducer