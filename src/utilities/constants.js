const path = require('path');
const apiUrl = process.env.API_URL;

const PUBLICDIR = path.join(__dirname, '../../public');
const PUBLICUPLOADDIR = path.join(__dirname, '../../public/uploads');
const IMGUPLOADDIR = path.join(__dirname, '../../public/uploads/img');
const VIDEOUPLOADDIR = path.join(__dirname, '../../public/uploads/videos');
const MEDIAUPLOADDIR = path.join(__dirname, '../../public/uploads/media');
const PRODUCTUPLOADDIR = path.join(__dirname, '../../public/uploads/products');
const MSGUPLOADDIR = path.join(__dirname, '../../public/uploads/message');
const PUBLICPATH = '../../public';
const PUBLICUPLOADPATH = '../../public/uploads';
const PUBLICPATHLive = `${apiUrl}`;
const PUBLICUPLOADPATHLive = `${apiUrl}/uploads`;

module.exports = {
  PUBLICDIR,
  PUBLICUPLOADDIR,
  IMGUPLOADDIR,
  VIDEOUPLOADDIR,
  MEDIAUPLOADDIR,
  PRODUCTUPLOADDIR,
  MSGUPLOADDIR,
  PUBLICPATH,
  PUBLICUPLOADPATH,
  PUBLICPATHLive,
  PUBLICUPLOADPATHLive,
};
