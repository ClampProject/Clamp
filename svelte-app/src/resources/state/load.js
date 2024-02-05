import ProjectState from "./index";
import BlobAndDataUrl from "../blobanddataurl";
import JSZip from "jszip";

// NOTE: any and all breaking changes should check the zip version & handle appropriately based on what it is.
/**
 * ---- !!!! VERSION DIFFERENCES !!!! ----
 * 
 * 0: images & sounds are stored inside project.json, project.json is inside data folder
 * workspace XMLs are all in workspaces folder named like: "CHARACTERID.xml"
 * 
 * 1: images & sounds are stored in images & sounds folders respectively,
 * named by a random ID that can be matched by opening the "files.json" file inside the folders, everything else is the same as v0
 */

export default async (arrayBuffer, formatVersionFoundCallback) => {
    // Don't do anything before checking the format version & allowing the user to cancel.
    const zip = await JSZip.loadAsync(arrayBuffer);
    console.log("loaded zip file...");

    // check format version
    let formatVersion = 0;
    if (zip.file("fmt_version.txt")) {
        formatVersion = await zip
            .file("fmt_version.txt")
            .async("string");
        if (!isNaN(Number(formatVersion))) {
            formatVersion = Number(formatVersion);
        }
    }
    // allow the user to cancel if provided
    console.log('zip format version:', formatVersion);
    if (formatVersionFoundCallback) {
        const shouldContinue = await formatVersionFoundCallback(formatVersion);
        if (shouldContinue === false) {
            console.log('aborted zip load...');
            return false; // load was cancelled
        }
    }

    // We can start doing things now.
    // get project json from the data folder
    const dataFolder = zip.folder("data");
    const projectJsonString = await dataFolder
        .file("project.json")
        .async("string");
    const projectJson = JSON.parse(projectJsonString);

    if (formatVersion > 0) {
        // read images folder
        const imagesFolder = zip.folder("images");
        const tracingImagePaths = JSON.parse(await imagesFolder
            .file("files.json")
            .async("string"));
        for (const imageFileName in tracingImagePaths) {
            const imageId = tracingImagePaths[imageFileName];
            const imageData = await BlobAndDataUrl.blobToDataURL(await imagesFolder
                .file(imageFileName)
                .async("blob"));
            for (const imageObj of projectJson.images) {
                if (imageObj.id === imageId) {
                    imageObj.image = imageData;
                    break;
                }
            }
        }
        // read sounds folder
        const soundsFolder = zip.folder("sounds");
        const tracingSoundPaths = JSON.parse(await soundsFolder
            .file("files.json")
            .async("string"));
        for (const soundFileName in tracingSoundPaths) {
            const soundId = tracingSoundPaths[soundFileName];
            const soundData = await BlobAndDataUrl.blobToDataURL(await soundsFolder
                .file(soundFileName)
                .async("blob"));
            for (const soundObj of projectJson.sounds) {
                if (soundObj.id === soundId) {
                    soundObj.data = soundData;
                    break;
                }
            }
        }
    }

    // get project workspace xml stuffs
    const workspacesFolder = zip.folder("workspaces");
    const fileNames = [];
    workspacesFolder.forEach((_, file) => {
        // remove dir name so we can push the character ID that these workspaces are for
        const fileName = file.name.replace("workspaces/", "");
        fileNames.push(fileName);
    });
    // console.log(fileNames); // debug
    const idWorkspacePairs = {};
    for (const fileName of fileNames) {
        const idx = fileName.lastIndexOf(".xml");
        const id = fileName.substring(0, idx);
        // assign to pairs
        idWorkspacePairs[id] = await workspacesFolder
            .file(fileName)
            .async("string");
    }
    // console.log(idWorkspacePairs); // debug

    // laod
    console.log(projectJson); // debug
    ProjectState.loadProject(projectJson, idWorkspacePairs, formatVersion);
    return true; // loaded fully
};