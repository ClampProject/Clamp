import userReadMeTxt from "./userReadMe.txt?raw";
import ProjectState from "./index";
import BlobAndDataUrl from "../blobanddataurl";
import JSZip from "jszip";

const urlToUint8Array = (url = '') => {
    if (url.startsWith('data:')) {
        // ez, must be base64 since we only pass in image & sound data into here
        return BlobAndDataUrl.base64DataURLtoUint8Array(url);
    }
    // could fail if offline
    // this is used by custom scripts & old saves that never deleted the base costumes
    return BlobAndDataUrl.urlToUint8Array(url);
};
const getFileExt = async (uint8Array) => {
    let fileExt = 'unknown';
    try {
        const ext = BlobAndDataUrl.fileTypeFromDataArray(uint8Array);
        fileExt = ext || 'unknown';
    } catch (err) {
        console.warn(err);
        fileExt = 'unknown';
    }
    return fileExt;
}

// NOTE: Any changes in this save format should be accounted for when loading older formats in the load.js file.
export const saveFormatVersion = 1; // normal integer
export default async (project, optOutputType, optExtraInfo) => {
    if (!optExtraInfo) optExtraInfo = {};

    // data
    const projectData = ProjectState.serializeProject(project);

    // zip
    const zip = new JSZip();
    zip.file("README.txt", userReadMeTxt);
    zip.file("fmt_version.txt", String(saveFormatVersion)); // state the format version
    zip.file("detail.json", JSON.stringify(optExtraInfo, null, 4));

    // workspaces
    const workspaces = zip.folder("workspaces");
    for (const character of project.characters) {
        workspaces.file(character.id + ".xml", character.xml);
    }

    // used by images & audio
    let assetCount = 0;
    // images
    const images = zip.folder("images");
    const imageTracers = {};
    for (const imageObj of project.images) {
        const uint8Array = await urlToUint8Array(imageObj.image);
        const fileExt = await getFileExt(uint8Array);
        const fileName = `asset${assetCount}.${fileExt}`;
        assetCount++;
        imageTracers[fileName] = imageObj.id;
        images.file(fileName, uint8Array);
    }
    images.file('files.json', JSON.stringify(imageTracers, null, 4));

    // sounds
    const sounds = zip.folder("sounds");
    const soundTracers = {};
    for (const soundObj of project.sounds) {
        const uint8Array = await urlToUint8Array(soundObj.data);
        const fileExt = await getFileExt(uint8Array);
        const fileName = `asset${assetCount}.${fileExt}`;
        assetCount++;
        soundTracers[fileName] = soundObj.id;
        sounds.file(fileName, uint8Array);
    }
    sounds.file('files.json', JSON.stringify(soundTracers, null, 4));

    // data
    const data = zip.folder("data");
    data.file("project.json", projectData);

    // return zip file
    return await zip.generateAsync({ type: optOutputType || "blob" });
};