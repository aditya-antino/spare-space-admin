import { User } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  tokenID: string | null;
  refreshToken: string | null;
}

interface SetUserPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  tokenID: null,
  refreshToken: null,
};

const userReducer = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<SetUserPayload>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.tokenID = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    updateUser: (state, action: PayloadAction<UpdateUserPayload>) => {
      if (state.user) {
        state.user.firstName = action.payload.firstName ?? state.user.firstName;
        state.user.lastName = action.payload.lastName ?? state.user.lastName;
        state.user.avatar = action.payload.avatar ?? state.user.avatar;
      }
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.tokenID = null;
      state.refreshToken = null;
    },
  },
});

export const { setUser, clearUser, updateUser } = userReducer.actions;

export default userReducer.reducer;
