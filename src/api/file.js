import api from "./index";

export const IMAGE_TYPE = {
    FREE_BOARD: "FREE_BOARD",
    NOTICE: "NOTICE",
    PROFILE: "PROFILE",
    REVIEW: "REVIEW",
    STORY_BOOK: "STORY_BOOK",
}

export const fileApi = {
    uploadFile: (file, imageType) => api.post("/file/image", file, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        params: {
            imageType: imageType
        }
    }),
    uploadFiles: (files, imageType) => api.post("/file/images", files, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        params: {
            imageType: imageType
        }
    }),
    deleteFile: (fileId, imageType) => api.delete(`/file/image/${fileId}`, {
        params: {
            imageType: imageType
        }
    }),
}
