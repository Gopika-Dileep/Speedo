import multer from 'multer'
import path from 'path'

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext !== ".csv") {
        return cb(new Error("only csv files are allowed"))
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
});

export default upload;