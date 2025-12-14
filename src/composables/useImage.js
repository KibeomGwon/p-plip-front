export const useImage = () => {
    const getImageUrl = (image) => {
        if (!image) return '';
        const baseUrl = import.meta.env.VITE_FILE_BASE_URL || '';

        if (typeof image === 'string') {
            return `${baseUrl}/${image}`;
        }
        if (image.name) {
            return `${baseUrl}/${image.name}`;
        }
        return '';
    };

    return {
        getImageUrl
    };
};

export const useImages = () => {
    const getImagesUrl = (images) => {
        if (!images || !images.length) return [];
        const baseUrl = import.meta.env.VITE_FILE_BASE_URL || '';
        return images.map(image => {
            if (typeof image === 'string') {
                return `${baseUrl}/${image}`;
            }
            return `${baseUrl}/${image.name}`;
        });
    };

    return {
        getImagesUrl
    };
};
