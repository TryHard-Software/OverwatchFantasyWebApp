
function isUsername(username) {
    const regex = /^[\p{L}0-9]{3,16}$/u;
    return regex.test(username);
}

function isPassword(password) {
    const regex = /^[.\S]{1,20}$/u;
    return regex.test(password);
}

module.exports = {
    isUsername,
    isPassword
};