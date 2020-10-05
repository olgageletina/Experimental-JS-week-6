let scene, camera, renderer, geometry, mesh;
const canvasElm = document.getElementById('canvas');
const video = document.getElementById('video');
const faces = [{ "a": 0, "b": 36, "c": 17 }, { "a": 17, "b": 36, "c": 18 }, { "a": 18, "b": 37, "c": 36 }, { "a": 37, "b": 18, "c": 19 }, { "a": 19, "b": 37, "c": 20 }, { "a": 37, "b": 20, "c": 38 }, { "a": 20, "b": 38, "c": 21 }, { "a": 21, "b": 38, "c": 39 }, { "a": 21, "b": 39, "c": 27 }, { "a": 21, "b": 27, "c": 22 }, { "a": 22, "b": 27, "c": 42 }, { "a": 42, "b": 22, "c": 43 }, { "a": 22, "b": 43, "c": 23 }, { "a": 43, "b": 23, "c": 44 }, { "a": 23, "b": 44, "c": 24 }, { "a": 24, "b": 44, "c": 25 }, { "a": 44, "b": 25, "c": 45 }, { "a": 25, "b": 45, "c": 26 }, { "a": 26, "b": 45, "c": 16 }, { "a": 16, "b": 45, "c": 15 }, { "a": 45, "b": 15, "c": 46 }, { "a": 15, "b": 46, "c": 14 }, { "a": 14, "b": 46, "c": 13 }, { "a": 13, "b": 46, "c": 12 }, { "a": 12, "b": 46, "c": 35 }, { "a": 35, "b": 46, "c": 30 }, { "a": 46, "b": 30, "c": 47 }, { "a": 30, "b": 47, "c": 29 }, { "a": 29, "b": 47, "c": 28 }, { "a": 47, "b": 28, "c": 42 }, { "a": 28, "b": 42, "c": 27 }, { "a": 27, "b": 39, "c": 28 }, { "a": 28, "b": 40, "c": 39 }, { "a": 28, "b": 40, "c": 29 }, { "a": 29, "b": 40, "c": 30 }, { "a": 40, "b": 30, "c": 41 }, { "a": 30, "b": 41, "c": 31 }, { "a": 31, "b": 41, "c": 4 }, { "a": 4, "b": 41, "c": 3 }, { "a": 3, "b": 41, "c": 2 }, { "a": 2, "b": 41, "c": 1 }, { "a": 41, "b": 1, "c": 36 }, { "a": 1, "b": 36, "c": 0 }, { "a": 31, "b": 30, "c": 32 }, { "a": 32, "b": 30, "c": 33 }, { "a": 33, "b": 30, "c": 34 }, { "a": 34, "b": 30, "c": 35 }, { "a": 4, "b": 31, "c": 5 }, { "a": 5, "b": 31, "c": 6 }, { "a": 31, "b": 6, "c": 32 }, { "a": 6, "b": 32, "c": 7 }, { "a": 32, "b": 7, "c": 33 }, { "a": 7, "b": 33, "c": 8 }, { "a": 8, "b": 33, "c": 9 }, { "a": 9, "b": 34, "c": 10 }, { "a": 33, "b": 9, "c": 34 }, { "a": 34, "b": 10, "c": 35 }, { "a": 10, "b": 35, "c": 11 }, { "a": 11, "b": 35, "c": 12 }];

//number of vertices for mesh
const numVertices = 49;

//load asynchronously
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('../../models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('../../models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('../../models'),
    faceapi.nets.faceExpressionNet.loadFromUri('../../models')
]).then(startVideo);

//hook up webcam to video element
function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        //coming from the webcam
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}

//event listener
video.addEventListener('play', () => {
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvasElm, displaySize);


    setInterval(async () => {
        // Execute a specified block of code repeatedly with a fixed time delay between each call.
        const detections = await faceapi.detectAllFaces(video,
            new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        const resizeDetections = faceapi.resizeResults(detections, displaySize);

        if (resizeDetections[0]) {
            const facePos = resizeDetections[0].landmarks.positions.slice(0, numVertices - 1);

            for (var i = 0; i < numVertices; i++) {
                var nextVertex = geometry.vertices[i];
                nextVertex.x = facePos[i]._x;
                nextVertex.y = facePos[i]._y;
            }
            geometry.verticesNeedUpdate = true;
        }
    }, 100)
    createShape();

})

init(canvasElm);
animate();

function init(c) {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(0, canvasElm.width, 0, canvasElm.height, -1, 1);
    renderer = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true });
}

function createShape() {
    geometry = new THREE.Geometry();


    for (let i = 0; i < numVertices; i++) {
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    }

    for (let j = 0; j < faces.length; j++) {
        let face = new THREE.Face3(faces[j].a, faces[j].b, faces[j].c);
        geometry.faces.push(face);
    }


    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    const material = new THREE.MeshBasicMaterial({ color: 0x898989, side: THREE.DoubleSide });

    shapeMesh = new THREE.Mesh(geometry, material);

    scene.add(shapeMesh);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}