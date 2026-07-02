// =========================================
// SHUBHAN PAYMENT PORTAL
// cloudinary.js
// =========================================

// -----------------------------------------
// CONFIGURATION
// -----------------------------------------

const CLOUD_NAME = "dydu3zn1f";

const UPLOAD_PRESET = "payment_uploads";

const CLOUDINARY_URL =
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;



// =========================================
// UPLOAD DOCUMENT
// =========================================

export async function uploadDocument(file, progressCallback = null) {
    try {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        return await uploadXHR(
            CLOUDINARY_URL,
            formData,
            progressCallback
        );

    } catch (error) {
        console.error(error);
        throw error;
    }
}



// =========================================
// XHR UPLOAD
// (Needed for Progress Bar)
// =========================================

function uploadXHR(
    url,
    formData,
    progressCallback
) {

    return new Promise((resolve, reject) => {

        const xhr = new XMLHttpRequest();

        xhr.open(
            "POST",
            url
        );

        xhr.upload.addEventListener(

            "progress",

            function (event) {

                if (
                    event.lengthComputable &&
                    progressCallback
                ) {

                    const percent = Math.round(

                        (event.loaded / event.total) * 100

                    );

                    progressCallback(percent);

                }

            }

        );

        xhr.onload = function () {

            if (
                xhr.status >= 200 &&
                xhr.status < 300
            ) {

                const response = JSON.parse(
                    xhr.responseText
                );

                resolve({
                    success: true,
                    url: response.secure_url,
                    publicId: response.public_id,
                    originalName: response.original_filename,
                    bytes: response.bytes,
                    format: response.format,
                    resourceType: response.resource_type
                });

            }

            else {

                reject(

                    JSON.parse(
                        xhr.responseText
                    )

                );

            }

        };

        xhr.onerror = function () {

            reject({

                message:
                    "Cloudinary Upload Failed"

            });

        };

        xhr.send(formData);

    });

}



// =========================================
// VALIDATE FILE
// =========================================

export function validateDocument(file) {

    if (!file) {

        return {

            valid: true

        };

    }

    const allowedTypes = [

    "application/pdf",

    "image/jpeg",

    "image/png",

    "image/jpg",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "application/vnd.ms-excel",

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

];

    if (
        !allowedTypes.includes(file.type)
    ) {

        return {

            valid: false,

            message:
                "Invalid file type."

        };

    }

    const maxSize = 10 * 1024 * 1024;

    if (
        file.size > maxSize
    ) {

        return {

            valid: false,

            message:
                "Maximum file size is 10 MB."

        };

    }

    return {

        valid: true

    };

}



// =========================================
// FORMAT FILE SIZE
// =========================================

export function formatFileSize(bytes) {

    if (bytes === 0)
        return "0 B";

    const sizes = [

        "B",
        "KB",
        "MB",
        "GB"

    ];

    const i = Math.floor(

        Math.log(bytes) /
        Math.log(1024)

    );

    return (

        bytes /
        Math.pow(1024, i)

    ).toFixed(2) +

        " " +

        sizes[i];

}



// =========================================
// GET FILE ICON
// =========================================

export function getFileIcon(fileName) {

    const ext = fileName
        .split(".")
        .pop()
        .toLowerCase();

    switch (ext) {

        case "pdf":

            return "fa-solid fa-file-pdf";

        case "jpg":

        case "jpeg":

        case "png":

            return "fa-solid fa-file-image";

        case "xls":

        case "xlsx":

            return "fa-solid fa-file-excel";

        case "doc":

        case "docx":
            return "fa-solid fa-file-word";
        default:

            return "fa-solid fa-file";

    }

}



// =========================================
// OPEN DOCUMENT
// =========================================
export function openDocument(url, resourceType, format) {
    if (!url) return;
const isPDF =
    resourceType === "raw" ||
    format === "pdf" ||
    url?.split("?")[0].toLowerCase().endsWith(".pdf");

    if (isPDF) {
        window.open(url, "_blank");
    } else {
        window.open(url, "_blank");
    }
}