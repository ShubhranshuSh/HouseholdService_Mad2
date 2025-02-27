const store = new Vuex.Store({
    state: {
        auth_token: localStorage.getItem("auth_token") || null,
        role: localStorage.getItem("role") || null,
        loggedIn: !!localStorage.getItem("auth_token"),
        user_id: localStorage.getItem("user_id") || null,
    },
    mutations: {
        setUser(state) {
            try {
                const user = JSON.parse(localStorage.getItem("user"));

                if (user && typeof user === "object") {
                    state.auth_token = user.token || null;
                    state.role = typeof user.role === "string" ? user.role.trim().toLowerCase() : null;
                    state.loggedIn = !!user.token;
                    state.user_id = user.id || null;

                    localStorage.setItem("auth_token", user.token || "");
                    localStorage.setItem("role", state.role || "");  // Store role as string
                    localStorage.setItem("user_id", user.id || "");
                } else {
                    console.warn("Invalid user data in localStorage:", user);
                    state.auth_token = null;
                    state.role = null;
                    state.loggedIn = false;
                    state.user_id = null;
                }
            } catch (error) {
                console.warn("Error parsing user data:", error);
                state.auth_token = null;
                state.role = null;
                state.loggedIn = false;
                state.user_id = null;
            }
        },
        logout(state) {
            state.auth_token = null;
            state.role = null;
            state.loggedIn = false;
            state.user_id = null;

            localStorage.removeItem("user");
            localStorage.removeItem("auth_token");
            localStorage.removeItem("role");
            localStorage.removeItem("user_id");
        },
    },
    actions: {
        login({ commit }, userData) {
            if (typeof userData.role !== "string") {
                console.warn("Invalid role format. Expected string but got:", userData.role);
                userData.role = "";
            }
            localStorage.setItem("user", JSON.stringify(userData));
            commit("setUser");
        },
    },
});

// Ensure user session persists on page reload
store.commit("setUser");

export default store;
