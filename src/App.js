import './App.css';
import * as THREE from 'three';
import globe from './globe.jpg';
import gsap from 'gsap';
import { Float32BufferAttribute } from 'three';
//https://www.youtube.com/watch?v=vM8M4QloVL0&t=1450s
// vertex shader is a program that runs for every vertex with in our geometry
//glsl is a typed language
// the main funtion in vertex.glsl will run once for every vertex
// gl_Position is the x y z coordinate of the vertex
// vertex shader is responsible for placing all the vertices in the correct position
// fragment shader is responsible fro filling the space in between by giving them color or something
//https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGL1Renderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// create spehere
// sphere geometry takes radius,width,height
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  // new THREE.MeshBasicMaterial({
  //   map: new THREE.TextureLoader().load(globe)
  // })
  //vertex shader is boiler plate code to get the position working
  // fragment shader has acces to vertex shader data such as vertices
  // varying variable is used to passs the uv from vertex shader to pragment shader
  // vectorNormal represents the direction of the vertex we are looping through
  new THREE.ShaderMaterial({
    vertexShader: `
    varying vec2 vertexUV;
    varying vec3 vertexNormal;
    void main(){
      vertexUV = uv;
      vertexNormal =  normalize(normalMatrix *normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
    fragmentShader: `
    uniform sampler2D globeTexture;
    varying vec2 vertexUV;
    varying vec3 vertexNormal;
    void main(){
      float intensity = 1.05 - dot(vertexNormal, vec3(0.0,0.0,1.0));
      vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);
       gl_FragColor = vec4(atmosphere+texture2D(globeTexture, vertexUV ).xyz, 1.0);
    }`,
    // in uniform we declare all the different attributes we want to pass to our shader
    uniforms: {
      globeTexture: { value: new THREE.TextureLoader().load(globe) }
    }
  })
);
//create atmosphere
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
  // new THREE.MeshBasicMaterial({
  //   map: new THREE.TextureLoader().load(globe)
  // })
  //vertex shader is boiler plate code to get the position working
  // fragment shader has acces to vertex shader data such as vertices
  // varying variable is used to passs the uv from vertex shader to pragment shader
  // vectorNormal represents the direction of the vertex we are looping through
  new THREE.ShaderMaterial({
    vertexShader: `
    varying vec3 vertexNormal;
    void main(){
      vertexNormal = normalize(normalMatrix *normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
    fragmentShader: `
    uniform sampler2D globeTexture;
    varying vec2 vertexUV;
    varying vec3 vertexNormal;
    void main(){
      float intensity =pow(0.65 -dot(vertexNormal, vec3(0,0,1.0)), 2.0);
       gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) *intensity;
    }`,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  })
);

atmosphere.scale.set(1.1, 1.1, 1.1);
scene.add(atmosphere);
const group = new THREE.Group();
group.add(sphere);
scene.add(group);

const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

// adding poistions for the starts
const starVertices = [];

for (let i = 0; i < 2000; i++) {
  //math.random fives value from 0 to 1 so we sub 0.5 to get negative values
  // multiply by 2000 to spread across screen
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  // as we want the stars behind globe that is why we are adding negative z
  const z = -Math.random() * 2500;
  starVertices.push(x, y, z);
}
// we telll tthe grouping is in 3
starGeometry.setAttribute(
  'position',
  new Float32BufferAttribute(starVertices, 3)
);

//this makes sure that we are rendering some material at each individual point rather than filling everything in
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

camera.position.z = 15;

const mouse = { x: undefined, y: undefined };

const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  sphere.rotation.y += 0.001;
  gsap.to(group.rotation, { y: mouse.x * 0.5, x: -mouse.y * 0.3, duration: 2 });
};

animate();

window.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
});

function App() {
  return <div className="App"></div>;
}

export default App;
