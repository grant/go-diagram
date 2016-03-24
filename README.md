# go-diagram
A UML diagram editor for Golang projects

## Links
[Project Proposal (includes response to feedback, reference, and design document)](https://docs.google.com/document/d/1exvOxiBwERKd5P1nZ7hjmhkGchoAhr0tZK_f_3EVy2M/edit)

[Poster](https://docs.google.com/presentation/d/1xgy8ltVHn0e96vcdWVlRIYVDdQI2QKU-5a366ivnRjo/edit)

## [Video Demo](https://drive.google.com/file/d/0B4riRkl944ZqcnQzR0x1c0QxVDA/view?usp=sharing)
[![screenshot from 2016-03-17 02 05 31](https://cloud.githubusercontent.com/assets/2159661/13841247/f70780fa-ebe4-11e5-96ba-5667c4af1b12.png)](https://drive.google.com/file/d/0B4riRkl944ZqcnQzR0x1c0QxVDA/view?usp=sharing)

## Setup
Make sure your `PATH` includes `:$GOPATH/bin`
```
cd app
sudo npm i
npm run build

cd ..
go install github.com/grant/go-diagram
go-diagram <directory name>
```

## Tech Stack
- Golang for the server (uses goparser, gorilla websockets)
- React + Redux frontend
  - Webpack
  - Babel
  - Stylus

## Other
I believe Go 1.5+ is required.
