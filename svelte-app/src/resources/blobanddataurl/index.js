import proxyFetch from "../proxyFetch";
import MagicNumbers from './magicNumbers';
import FileTypes from './filetypes';

class BlobAndDataUrl {
    static fileTypeFromDataArray = MagicNumbers.detectFileType;
    static fileTypeFromBlob = async (blob) => {
        const arrayBuffer = await BlobAndDataUrl.blobToArrayBuffer(blob);
        return BlobAndDataUrl.fileTypeFromDataArray(arrayBuffer);
    };

    /**
     * Convert a URL to a Blob.
     * @param {string} url The URL to convert.
     * @returns {Promise<Blob>} The Blob that the URL was converted to.
     */
    static async urlToBlob(url) {
        const res = await proxyFetch(url);
        const arrayBuffer = await res.arrayBuffer();
        const fileType = BlobAndDataUrl.fileTypeFromDataArray(arrayBuffer);
        const mimeType = FileTypes.mimeTypePairs[fileType];
        const blob = BlobAndDataUrl.arrayBufferToBlob(arrayBuffer, mimeType);
        return blob;
    }
    /**
     * Convert a URL to a Uint8Array.
     * @param {string} url The URL to convert.
     * @returns {Promise<Uint8Array>} The Uint8Array that the URL was converted to.
     */
    static async urlToUint8Array(url) {
        const res = await proxyFetch(url);
        const arrayBuffer = await res.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        return uint8Array;
    }

    /**
     * Convert a Base64 Data URL (data:) to a Blob.
     * @param {string} url The data URL to convert.
     * @returns {Blob} The Blob that the data URL was converted to.
     */
    static base64DataURLtoBlob(url) {
        var arr = url.split(','), bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        const mime = BlobAndDataUrl.fileTypeFromDataArray(u8arr);
        return new Blob([u8arr], { type: mime });
    }
    /**
     * Convert a Base64 Data URL (data:) to a Uint8Array.
     * @param {string} url The data URL to convert.
     * @returns {Uint8Array} The Uint8Array that the data URL was converted to.
     */
    static base64DataURLtoUint8Array(url) {
        var arr = url.split(','), bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return u8arr;
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
        let fileType;
        if (!optMimeType) {
            fileType = BlobAndDataUrl.fileTypeFromDataArray(arrayBuffer);
            optMimeType = FileTypes.mimeTypePairs[fileType];
        }
        if (!optMimeType) {
            return new Blob([arrayBuffer]);
        }
        return new Blob([arrayBuffer], { type: optMimeType });
    }
    static blobToArrayBuffer(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onabort = reject;
            reader.onload = function (event) {
                resolve(event.target.result);
            };
            reader.readAsArrayBuffer(blob);
        });
    }
}

export default BlobAndDataUrl;