const server = require('http').createServer();
const io = require('socket.io')(server);

let ready = [];
let finish = false;
io.on('connection', socket => {
  console.log(socket.id);
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('ready', () => {
    if (ready.indexOf(socket.id) === -1) {
      // 记住用户，并初始化用户位置
      ready.push(socket.id);
    }
    console.log(ready);
    if (ready.length === 2) {
      io.emit('status', '准备');
      setTimeout(() => {
        io.emit('status', 3);
        setTimeout(() => {
          io.emit('status', 2);
          setTimeout(() => {
            io.emit('status', 1);
            setTimeout(() => {
              io.emit('status', '开始');
            }, 1000);
          }, 1000);
        }, 1000);
      }, 1000);
    }
  });
  socket.on('clear', () => {
    ready = [];
    finish = false;
  });
  socket.on('run', distance => {
    ready[socket.id] = distance;
    io.emit('run', {id: socket.id, distance})
  })
  socket.on('finish', message => {
    if (finish) return false;
    finish = true;
    io.emit('status', '结束');
    io.emit('finish', {id: socket.id})
  })
})

server.listen(8080);

