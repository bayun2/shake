import React, { Component } from 'react';
import './App.css';
import io from 'socket.io-client';

class App extends Component {
  distance = 1000
  peopleHeight = 20
  step = 100
  state = {
    translateY: -this.step + this.peopleHeight,
    bottom: 0,
    finish: false,
    status: '准备',
    ready: false,
    otherTranslateY: -this.step + this.peopleHeight,
    result: '',
  }
  componentWillMount() {
    this.socket = new io('http://192.168.21.13:8080');
  }
  componentDidMount() {
    const {scrollHeight, offsetHeight} = this.roadEl
    this.roadEl.scrollTop = scrollHeight - offsetHeight;
    this.setState({bottom: this.state.bottom - this.roadEl.scrollTop});
    this.ready();
    this.run();
  }
  ready = () => {
    this.socket.on('status', message => {
      this.setState({status: message});
    })
    this.socket.on('run', data => {
      if (data.id !== this.socket.id) {
        this.setState({otherTranslateY: -data.distance});
      }
    })
    this.socket.on('finish', data => {
      if (data.id !== this.socket.id) {
        this.setState({finish: true, result: '别人获胜'});
      } else {
        this.setState({finish: true, result: '本人获胜'});
      }
    })
  }
  run = () => {
    if (window.DeviceMotionEvent) {
      const speed = 25;
      let x, y, lastX, lastY;
      x = y = lastX = lastY = 0;
      window.addEventListener('devicemotion', event => {
        const {translateY, finish} = this.state;
        if (finish) {
          return false;
        }
        const acceleration = event.accelerationIncludingGravity;
        x = acceleration.x;
        y = acceleration.y;
        if (Math.abs(x - lastX) > speed || Math.abs(y - lastY) > speed) {
          if (this.roadEl.scrollTop > 0) {
            this.roadEl.scrollTop = this.roadEl.scrollTop - 20;
          }
          this.setState({translateY: translateY-20}, () => {
            this.socket.emit('run', Math.abs(this.state.translateY));
            if (Math.abs(this.state.translateY) >= this.distance + this.step) {
              // 跑到终点
              this.socket.emit('finish');
              this.setState({finish: true});
            }
          });
        }
        lastX = x;
        lastY = y;
      })
    }
  }
  start = () => {
    if (this.state.ready) {
      return false;
    }
    this.setState({ready: true}, () => {
      this.socket.emit('ready');
    });
  }
  render() {
    const {translateY, bottom, status, ready, otherTranslateY, result} = this.state;
    const {distance, step} = this;
    return (
      <div className="App">
        <div className="control">
          <p>translateY: {translateY}</p>
          <p>endPoint: {distance + step}</p>
          <p> {status}</p>
          <p>
            <span onClick={this.start}>{ready ? '' : 'start'}  </span>
            <span onClick={()=> this.socket.emit('clear')}>clear</span>
          </p>
          <p>{result}</p>
        </div>
        <div className="road" ref={el => this.roadEl = el}>
          <div className="dis end"><span>ending</span></div>
          <div className="dis line"><span>100m</span></div>
          <div className="dis line"><span>200m</span></div>
          <div className="dis line"><span>300m</span></div>
          <div className="dis line"><span>400m</span></div>
          <div className="dis line"><span>500m</span></div>
          <div className="dis line"><span>600m</span></div>
          <div className="dis line"><span>700m</span></div>
          <div className="dis line"><span>800m</span></div>
          <div className="dis line"><span>900m</span></div>
          <div className="dis start"><span>beging</span></div>
          <div 
            className="people" 
            style={{transform: `translateY(${translateY}px)`, bottom: `${bottom}px`}}
          >本人</div>
          <div 
            className="otherpeople" 
            style={{transform: `translateY(${otherTranslateY}px)`, bottom: `${bottom}px`}}
          >别人</div>
        </div>
      </div>
    );
  }
}

export default App;
