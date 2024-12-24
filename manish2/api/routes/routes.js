import express from 'express'
import * as   controller from '../controller/controler.js'
import { Router } from 'express'
import multer from  'multer'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // Define the directory to store uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Append timestamp to file name
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only JPEG and PNG files
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Only .jpeg or .png files are allowed!'), false); // Reject the file
  }
};

// Multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5 MB
});
var router =Router()
// router.post("/save",controller.save)
router.post('/save', upload.single('pimage'), controller.save);

router.post("/login",controller.login)
router.get("/fatch",controller.fatch)
router.put("/update/:id",controller.update)
router.delete("/udelete",controller.udelete)
router.post('/verify',controller.verfiy)
router.post('/forgot',controller.forgot)
router.post('/update',controller.updatepassword)
export default router;