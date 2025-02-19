const store = new Vuex.Store({
    state: {
        auth_token: null,
        role: null,
        loggedIn: false,
        user_id: null,
    },
    mutations: {
        setUser(state) {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (user && user.token) {
                    state.auth_token = user.token;
                    state.role = user.role;
                    state.loggedIn = true;
                    state.user_id = user.id;
                } else {
                    console.warn("User not found in localStorage");
                }
            } catch (error) {
                console.warn("Error parsing user data:", error);
            }
        },
        setToken(state, token) {
            state.auth_token = token;
            localStorage.setItem("auth_token", token);
        },
        logout(state) {
            state.auth_token = null;
            state.role = null;
            state.loggedIn = false;
            state.user_id = null;
            localStorage.removeItem("user");
            localStorage.removeItem("auth_token");
        },
    },
    actions: {
        login({ commit }, userData) {
            commit("setToken", userData.token);
            localStorage.setItem("user", JSON.stringify(userData));
        },
    },
});

store.commit("setUser");

export default store;
