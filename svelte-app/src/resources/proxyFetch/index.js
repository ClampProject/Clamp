/**
 * Despite the name, this fetches the website first and then uses a proxy if that fails.
 * @param {string} url The URL to fetch.
 * @param {RequestInit} options Any options for things like POST requests.
 */
function proxyFetch(url, options) {
    if (!options) options = {};
    options.cache = "no-cache";
    return new Promise((resolve, reject) => {
        fetch(url, options).then(resolve)
            .catch(() => {
                fetch(`https://api.allorigins.win/raw?url=${url}`, options).then(resolve)
                    .catch(reject);
            });
    });
}

export default proxyFetch;