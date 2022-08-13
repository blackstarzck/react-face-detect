import { useEffect, useRef, useState } from 'react';
import './app.css';
import * as faceapi from 'face-api.js';

function App() {
  const [ loading, setLoading ] = useState(false);
  const [ imgSrc, setImgSrc ] = useState("");
  const [ expression, setExpression ] = useState({ });
  const keyNames = [ "angry", "disgusted", "fearful", "happy", "neutral", "sad", "surprised"  ];
  
  useEffect(() => {
    const loadModels = async () => {
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(process.env.PUBLIC_URL+'/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri(process.env.PUBLIC_URL+'/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri(process.env.PUBLIC_URL+'/models'),
        faceapi.nets.faceExpressionNet.loadFromUri(process.env.PUBLIC_URL+'/models'),
        faceapi.nets.ageGenderNet.loadFromUri(process.env.PUBLIC_URL+'/models')
      ])
        .then( () => {
          detect()
            .then( (result) => setExpression(result) );
        })
    }
    imgSrc && loadModels();
  }, [imgSrc]);


  const detect = async () => {
    const img = document.createElement("img");
    img.src = imgSrc;
    const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions()
    .withAgeAndGender();

    const genderResult = detections[0].gender;
    const expResult = detections[0].expressions;
    const resultArray = [];
    let value;

    console.log(detections)

    keyNames.map((key) => {
      value = Math.round(expResult[`${key}`] * 100);
      resultArray.push({ key, value });
    });

    resultArray.sort(function(a, b) { // 오름차순
      return a.value > b.value ? -1 : a.value < b.value ? 1 : 0;
    });

    let obj = {}
    let key = resultArray[0].key;
    let val = resultArray[0].value;
    obj[`${key}`] = val;
    obj["gender"] = genderResult;


    console.log(resultArray)
    return obj;
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
      <h1>{ loading ? "감지 끝" : "대기 중" }</h1>
      <h2>{ imgSrc ? "이미지 로드 완료" : "이미지 없음" }</h2>
      <h3>{ Object.keys(expression).length !== 0 ? `state값 : ${Object.keys(expression)}, ${expression[Object.keys(expression)]}` : "state값 없음" }</h3>

      <input onChange={onChange} type="file" id="upload" accept="image/*" name="file" hidden={true}/>
      <label htmlFor="upload">파일업로드</label>
    </div>
  );
}

export default App;
