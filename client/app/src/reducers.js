const initialState = {
    isLoggedIn: false
};

function reducers(state = initialState, action) {
    switch (action.type) {
        case "SET_LOGGED_IN":
            return {...state, isLoggedIn: action.isLoggedIn};
        default:
            return state;
    }
}

export default reducers;