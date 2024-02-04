class BlobAndDataUrl {
    /**
     * Convert a Data URL (data:) to a Blob.
     * @param {string} url The data URL to convert.
     * @returns {Blob} The Blob that the data URL was converted to.
     */
    static dataURLtoBlob(url) {
        var arr = url.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    static blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onabort = reject;
            reader.onload = function (event) {
                resolve(event.target.result);
            };
            reader.readAsDataURL(blob);
        });
    }

    static arrayBufferToBlob(arrayBuffer, optMimeType) {
        if (!optMimeType) {
            return new Blob([arrayBuffer]);
        }
        return new Blob([arrayBuffer], { type: optMimeType });
    }
}

export default BlobAndDataUrl;