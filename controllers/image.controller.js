const cloudinary = require("../config/cloudinary");

// helper function: upload a buffer to Cloudinary using a stream
// returns a promise so we can await it

/*
    takes raw file data (buffer)
    uploads it to Cloudinary
    returns a Promise (so we can use await)
*/

/* 
Why Promise is used?
Cloudinary upload is asynchronous (takes time).
Because
cloudinary.uploader.upload_stream()
does not return a Promise.
Instead it works using callbacks.

upload_stream(options, callback):
The callback runs later after upload finishes.
stream.end(buffer);
sends the buffer into the stream.
Without it, nothing uploads.
*/

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "ecommerce-products",
        timeout: 60000,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        if (!result) {
          return reject(new Error("Cloudinary upload failed"));
        }
        resolve(result);
      },
    );
    stream.end(buffer);
  });
};

module.exports = uploadToCloudinary;
