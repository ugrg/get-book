module.exports = () => {
    return new Array(4).fill(0).map(() => Math.floor((Math.random() * 255))).join(".")
};