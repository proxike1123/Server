const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
var multer = require('multer');
const mkdirp = require('mkdirp');
const fs = require('fs')
var mysql = require('mysql');
// const open = require('open');

const app = express();

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "manager1",
});


//log request from client
app.use(logger('dev'));

//set pug to use bootstrap
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//access parameters from clients (ex: req.body...)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))


// public "pictures, videos" folder
app.use(express.static(path.join(__dirname, 'pictures')));
app.use(express.static(path.join(__dirname, 'videos')));
app.use(express.static(path.join(__dirname, 'public')));

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});



//check connect
app.get('/api', function (req, res, mext) {
    res.send({message: 'Kết nối đến Server thành công'})
})

//upload image to server
const storageImage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = 'pictures/';
        mkdirp.sync(dest);
        cb(null, dest);
        //cb(null, './pictures');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
    }
})

var uploadImage = multer({
    dest: 'pictures/',
    storage: storageImage,
}).single('file');

app.post('/api/upload/picture', uploadImage, (req, res) => {
    var sql = `INSERT INTO images (image) VALUES ('${req.file.filename}')`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });
    if (req.file.path) {
        res.send({
            success: true,
            message: 'Upload ảnh thành công',
            data: {
                filepath: req.file.path,
            }
        })
    } else {
        res.send({
            success: false,
            message: 'Upload ảnh thất bại. Vui lòng thử lại'
        })
    }
})


//get all image 
app.get('/api/images', (req, res) => {
  con.query("SELECT * FROM images", function (err, result, fields) {
    if (err) throw err;
    var data = []
    result.forEach(row => {
      data.push({'filepath': row.image})
    })
    if (err != null) {
      res.send({
        error: err.message
      })
    } else {
      res.send({
        data: data
      })
    }
  });
})

app.post('/api/images/delete', (req, res) => {

  var sql = `DELETE FROM images WHERE image = '${req.body.filepath}'`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Number of records deleted: " + result.affectedRows);
  });

  fs.unlink('pictures/' + req.body.filepath, (err) => {
    if (err) {
      return res.send({
        success: false,
        message: 'Failed to delete file on server!',
        error: err
      })
    }
    return res.send({
      success: true,
      message: 'Successfully delete file on server!',
    })
  })
})


//upload video to server
const storageVideo = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = 'videos/';
        mkdirp.sync(dest);
        cb(null, dest);
        //cb(null, './pictures');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
    }
})

var uploadVideo = multer({
    dest: 'videos/',
    storage: storageVideo,
}).single('file');

app.post('/api/upload/video', uploadVideo, (req, res) => {
  console.log(req.file)
  var sql = `INSERT INTO videos (video) VALUES ('${req.file.filename}')`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
  if (req.file.path) {
      res.send({
          success: true,
          message: 'Upload video thành công',
          data: {
              filepath: req.file.path,
          }
      })
  } else {
      res.send({
          success: false,
          message: 'Upload video thất bại. Vui lòng thử lại'
      })
  }
})

app.post('/api/video/delete', (req, res) => {
  var sql = `DELETE FROM videos WHERE video = '${req.body.filepath}'`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Number of records deleted: " + result.affectedRows);
  });

  fs.unlink('videos/' + req.body.filepath, (err) => {
    if (err) {
      return res.send({
        success: false,
        message: 'Failed to delete file on server!',
        error: err
      })
    }
    return res.send({
      success: true,
      message: 'Successfully delete file on server!',
    })
  })
})

//get all video
app.get('/api/videos', (req, res) => {
  con.query("SELECT * FROM videos", function (err, result, fields) {
    if (err) throw err;
    var data = []
    result.forEach(row => {
      data.push({'filepath': row.video})
    })
    if (err != null) {
      res.send({
        error: err.message
      })
    } else {
      res.send({
        data: data
      })
    }
  });
  })

app.listen(6969);