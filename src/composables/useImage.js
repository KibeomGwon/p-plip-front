export const useImage = () => {
    const getImageUrl = (image) => {
        if (!image) return '';
        const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL || '';

        if (typeof image === 'string') {
            return `${baseUrl}${image}`;
        }
        if (image.path) {
            return `${baseUrl}${image.path}`;
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
        const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL || '';
        return images.map(image => {
            if (typeof image === 'string') {
                return `${baseUrl}${image}`;
            }
            return `${baseUrl}${image.path}`;
        });
    };

    return {
        getImagesUrl
    };
};
