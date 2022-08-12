import { useEffect, useRef, useState } from 'react';
import './app.css';
import src from "./img/test1.jpg";
import * as faceapi from 'face-api.js';

const styles = { width: "300px" };

function App() {
  const imgRef = useRef();
  const uploadRef = useRef();

  const [ init, setInit ] = useState(false);
  const [ imgSrc, setImgSrc ] = useState("");

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + "/models"; // 모델 경로

      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]).then( () => detect() );
    }
    imgSrc && loadModels();
  }, [imgSrc]);

  const detect = async () => {
    const detections = await faceapi.detectAllFaces(imgRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
    console.log(detections[0]);
    setInit(true);
  }

  const onChange = async evt => {
    let src = await URL.createObjectURL(evt.target.files[0]);

    // const reader = new FileReader();
    // reader.readAsDataURL(evt.target.files[0]);
    // reader.onload = function(event){
    //   src = event.target.result;
    //   console.log(1, src)
    // }

    setImgSrc(src);
 }

  return (
    <div className="App">
      <h1>{ init ? "감지 끝" : "대기 중" }</h1>
      <h2>{ imgSrc ? "이미지 로드 완료" : "이미지 없음" }</h2>
      <img ref={imgRef} src={imgSrc} alt="" style={styles}/>

      <input ref={uploadRef} onChange={onChange} type="file" id="upload" accept="image/*" name="file" hidden={true}/>
      <label htmlFor="upload">파일업로드</label>
    </div>
  );
}

export default App;
