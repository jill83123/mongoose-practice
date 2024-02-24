const http = require('http');
const mongoose = require('mongoose');
const Room = require('./models/room');
require('dotenv').config();

const db = process.env.DATABASE_HOTEL.replace('<password>', process.env.DATABASE_PASSWORD);
mongoose.connect(db).then(() => {
  console.log('mongodb 連線成功');
});

const requestListener = async (req, res) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
  };

  let body = '';
  req.on('data', (data) => {
    body += data;
  });

  if (req.url === '/rooms' && req.method === 'GET') {
    const rooms = await Room.find();
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        success: true,
        rooms,
      })
    );
    res.end();
  }

  // 新增
  else if (req.url === '/rooms' && req.method === 'POST') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const room = await Room.create(data);
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            success: true,
            message: '新增成功',
            room,
          })
        );
      } catch (err) {
        res.writeHead(400, headers);
        res.write(
          JSON.stringify({
            success: false,
            error: err,
          })
        );
      }
      res.end();
    });
  }

  // 刪除全部
  else if (req.url === '/rooms' && req.method === 'DELETE') {
    try {
      await Room.deleteMany();
      res.writeHead(200, headers);
      res.write(
        JSON.stringify({
          success: true,
          message: '刪除成功',
          rooms: [],
        })
      );
    } catch (err) {
      res.writeHead(400, headers);
      res.write(
        JSON.stringify({
          success: false,
          error: err,
        })
      );
    }
    res.end();
  }

  // 刪除單筆
  else if (req.url.startsWith('/rooms/') && req.method === 'DELETE') {
    try {
      const id = req.url.split('/').pop();
      await Room.findByIdAndDelete(id);
      res.writeHead(200, headers);
      res.write(
        JSON.stringify({
          success: true,
          message: '刪除成功',
        })
      );
    } catch (err) {
      res.writeHead(400, headers);
      res.write(
        JSON.stringify({
          success: false,
          error: err,
        })
      );
    }
    res.end();
  }

  // 編輯
  else if (req.url.startsWith('/rooms/') && req.method === 'PATCH') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const id = req.url.split('/').pop();
        await Room.findByIdAndUpdate(id, { ...data });
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            success: true,
            message: '編輯成功',
          })
        );
      } catch (err) {
        res.writeHead(400, headers);
        res.write(
          JSON.stringify({
            success: false,
            error: err,
          })
        );
      }
      res.end();
    });
  }

  // Preflight 預檢請求
  else if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  }

  // 404
  else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        success: false,
        message: '此 API 路徑不存在',
      })
    );
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3000);
