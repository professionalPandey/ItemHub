import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  loading: false,
  error: null,
  ageFilter: 0,
  page: 1,
  pageSize: 20,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    fetchUsersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess: (state, action) => {
      state.loading = false;
      state.users = [...state.users, ...action.payload];
    },
    fetchUsersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setAgeFilter: (state, action) => {
      state.ageFilter = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
    },
  },
});

export const {
  fetchUsersStart,
  fetchUsersSuccess,
  fetchUsersFailure,
  setAgeFilter,
  setPage,
  setPageSize,
} = userSlice.actions;

export const fetchUsers = (page, pageSize) => async (dispatch) => {
  try {
    dispatch(fetchUsersStart());
    const response = await fetch(
      `https://randomuser.me/api/?page=${page}&results=${pageSize}`
    );
    const data = await response.json();
    dispatch(fetchUsersSuccess(data.results));
  } catch (error) {
    dispatch(fetchUsersFailure(error.message));
  }
};

export default userSlice.reducer;
