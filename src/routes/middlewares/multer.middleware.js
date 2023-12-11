import multer from "multer";
import __dirname from '../../utils.js';
import { v4 as uuidV4 } from 'uuid'
import {logger} from '../../logs/logger.config.js'

export const prodImgStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folder = file.fieldname === 'Img' ? 'Img' :
            file.fieldname === 'Img' ? 'Img' : 'unknown';
        cb(null, __dirname + '/public/img/products/' + folder);
    },
    filename: function (req, file, cb) {
        cb(null, uuidV4() + " - " + file.originalname)
    }
});

export const profImgStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/public/imgs/profiles');
    },
    filename: function (req, file, cb) {
        cb(null, uuidV4() + '-' + file.originalname)
    }
});

export const documentsStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folder = file.fieldname === 'identification' ? 'identification' :
            file.fieldname === 'proofOfAddress' ? 'proofOfAddress' :
            file.fieldname === 'bankStatement' ? 'bankStatement' : 'unknown';
        cb(null, __dirname + '/public/imgs/documents/' + folder);
    },
    filename: function (req, file, cb) {
        cb(null, uuidV4() + " - " + file.originalname)
    }
});

export const uploaderProducts = multer({
    storage:  prodImgStorage, onError: function(err, next){
        logger.error("Error multer.middleware.js (Prod):" + err); next();
    }
})

export const uploaderPofiles = multer({
    storage:  profImgStorage, onError: function(err, next){
        logger.error("Error multer.middleware.js (Prof):" + err); next();
    }
})

export const uploaderDocuments = multer({
    storage: documentsStorage, onError: function(err, next){
        logger.error("Error multer.middleware.js (Docs):" + err); next();
    }
})