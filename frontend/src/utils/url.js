const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const getBrowserOrigin = () => {
    if (typeof window === 'undefined') {
        return '';
    }

    return trimTrailingSlash(window.location.origin);
};

export const getApiBaseUrl = () => {
    const configuredUrl = trimTrailingSlash(import.meta.env.VITE_API_URL || '');
    if (configuredUrl) {
        return configuredUrl;
    }

    const browserOrigin = getBrowserOrigin();
    if (!browserOrigin) {
        return 'http://localhost:5000/api';
    }

    if (browserOrigin.includes('localhost') || browserOrigin.includes('127.0.0.1')) {
        return 'http://localhost:5000/api';
    }

    return `${browserOrigin}/api`;
};

export const getUploadsBaseUrl = () => {
    const apiBaseUrl = getApiBaseUrl();
    return apiBaseUrl.endsWith('/api') ? apiBaseUrl.slice(0, -4) : apiBaseUrl;
};

export const resolveUploadUrl = (filePath) => {
    if (!filePath) {
        return null;
    }

    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }

    const uploadsBaseUrl = getUploadsBaseUrl();
    return filePath.startsWith('/uploads/')
        ? `${uploadsBaseUrl}${filePath}`
        : `${uploadsBaseUrl}/uploads/${filePath}`;
};
