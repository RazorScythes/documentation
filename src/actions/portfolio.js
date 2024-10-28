import * as api from '../api'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
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

export const uploadHero = createAsyncThunk('portfolio/uploadHero', async (form, thunkAPI) => {
  try {
      const response = await api.uploadPortfolioHero(form);
      return response;
  } catch (err) {
      if (err.response && err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);
      return { variant: 'danger', message: "409: there was a problem with the server." };
  }
});

export const uploadSkills = createAsyncThunk('portfolio/uploadSkills', async (form, thunkAPI) => {
  try {
      const response = await api.uploadPortfolioSkills(form);
      return response;
  } catch (err) {
      if (err.response && err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);
      return { variant: 'danger', message: "409: there was a problem with the server." };
  }
});

export const uploadServices = createAsyncThunk('portfolio/uploadServices', async (form, thunkAPI) => {
  try {
      const response = await api.uploadPortfolioServices(form);
      return response;
  } catch (err) {
      if (err.response && err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);
      return { variant: 'danger', message: "409: there was a problem with the server." };
  }
});

export const addExperience = createAsyncThunk('portfolio/addExperience', async (form, thunkAPI) => {
  try {
      const response = await api.addPortfolioExperience(form);
      return response;
  } catch (err) {
      if (err.response && err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);
      return { variant: 'danger', message: "409: there was a problem with the server." };
  }
});

export const updateExperience = createAsyncThunk('portfolio/updateExperience', async (form, thunkAPI) => {
  try {
      const response = await api.updatePortfolioExperience(form);
      return response;
  } catch (err) {
      if (err.response && err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);
      return { variant: 'danger', message: "409: there was a problem with the server." };
  }
});

export const addProject = createAsyncThunk('portfolio/addProject', async (form, thunkAPI) => {
  try {
      const response = await api.addPortfolioProject(form);
      return response;
  } catch (err) {
      if (err.response && err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);
      return { variant: 'danger', message: "409: there was a problem with the server." };
  }
});

export const updateProject = createAsyncThunk('portfolio/updateProject', async (form, thunkAPI) => {
  try {
      const response = await api.updatePortfolioProject(form);
      return response;
  } catch (err) {
      if (err.response && err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);
      return { variant: 'danger', message: "409: there was a problem with the server." };
  }
});

export const deleteProject = createAsyncThunk('portfolio/deleteProject', async (form, thunkAPI) => {
  try {
      const response = await api.deletePortfolioProject(form);
      return response;
  } catch (err) {
      if (err.response && err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);
      return { variant: 'danger', message: "409: there was a problem with the server." };
  }
});

export const sendTestEmail = createAsyncThunk('portfolio/sendTestEmail', async (form, thunkAPI) => {
  try {
      const response = await api.sendTestEmail(form);
      return response;
  } catch (err) {
      if (err.response && err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);
      return { variant: 'danger', message: "409: there was a problem with the server." };
  }
});

export const sendEmail = createAsyncThunk('portfolio/sendEmail', async (form, thunkAPI) => {
  try {
      const response = await api.sendEmail(form);
      return response;
  } catch (err) {
      if (err.response && err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);
      return { variant: 'danger', message: "409: there was a problem with the server." };
  }
});

export const sendContactUs = createAsyncThunk('portfolio/sendContactUs', async (form, thunkAPI) => {
  try {
      const response = await api.sendContactUs(form);
      return response;
  } catch (err) {
      if (err.response && err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);
      return { variant: 'danger', message: "409: there was a problem with the server." };
  }
});

export const uploadContacts = createAsyncThunk('portfolio/uploadContacts', async (form, thunkAPI) => {
  try {
      const response = await api.uploadPortfolioContacts(form);
      return response;
  } catch (err) {
      if (err.response && err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);
      return { variant: 'danger', message: "409: there was a problem with the server." };
  }
});

export const getPortfolio = createAsyncThunk('portfolio/getPortfolio', async (form, thunkAPI) => {
  try {
      const response = await api.getPortfolio(form);
      return response;
  } catch (err) {
      if (err.response && err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);
      return { variant: 'danger', message: "409: there was a problem with the server." };
  }
});

export const publishPortfolio = createAsyncThunk('portfolio/publishPortfolio', async (form, thunkAPI) => {
  try {
      const response = await api.publishPortfolio(form);
      return response;
  } catch (err) {
      if (err.response && err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);
      return { variant: 'danger', message: "409: there was a problem with the server." };
  }
});

export const unpublishPortfolio = createAsyncThunk('portfolio/unpublishPortfolio', async (form, thunkAPI) => {
  try {
      const response = await api.unpublishPortfolio(form);
      return response;
  } catch (err) {
      if (err.response && err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);
      return { variant: 'danger', message: "409: there was a problem with the server." };
  }
});

export const getPortfolioByUsername = createAsyncThunk('portfolio/getPortfolioByUsername', async (form, thunkAPI) => {
  try {
      const response = await api.getPortfolioByUsername(form);
      return response;
  } catch (err) {
      if (err.response && err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);
      return { variant: 'danger', message: "409: there was a problem with the server." };
  }
});

export const getProject = createAsyncThunk('portfolio/getProject', async (form, thunkAPI) => {
  try {
      const response = await api.getProject(form);
      return response;
  } catch (err) {
      if (err.response && err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);
      return { variant: 'danger', message: "409: there was a problem with the server." };
  }
});


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