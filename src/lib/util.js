export const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        console.error("FULL ERROR:");
        console.error(error);
        console.error(error.stack);

        next(error);
    }
};

export const getSecondsFromNow = (seconds) => {
    const currentTime = new Date();
    currentTime.setSeconds(currentTime.getSeconds() + seconds);
    return currentTime.getTime() / 1000;
};

export const getBearerToken = (req) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return null;
    return header.slice('Bearer '.length).trim() || null;
};
