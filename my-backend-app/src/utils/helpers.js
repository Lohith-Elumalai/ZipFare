export const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
};

export const generateId = () => {
    return '_' + Math.random().toString(36).substr(2, 9);
};