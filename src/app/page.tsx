'use client';

import React, { useEffect, useRef, useState } from "react";
import { AiOutlineGithub, AiOutlineLinkedin } from 'react-icons/ai';
import { BsFillFileTextFill } from 'react-icons/bs';
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import * as THREE from 'three';
import Typewriter from 'typewriter-effect';
import { Plus, Minus } from "lucide-react";

export default function Home() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  const velocityX = useMotionValue(0);
  const velocityY = useMotionValue(0);
  const dotX = useSpring(0, { damping: 50, stiffness: 2000 });
  const dotY = useSpring(0, { damping: 50, stiffness: 2000 });

  useEffect(() => {
    if (!sceneRef.current) return;

    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    sceneRef.current.appendChild(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add spot light
    const spotLight = new THREE.SpotLight(0xffffff, 8);
    spotLight.position.set(0, 15, 15);
    spotLight.target.position.set(0, -10, -20)
    scene.add(spotLight.target);
    spotLight.angle = Math.PI / 2.5;
    spotLight.penumbra = 0.5;
    spotLight.decay = 0.2;
    spotLight.castShadow = true;
    spotLight.shadow.bias = -0.001;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.camera.fov = 60;
    scene.add(spotLight);

    // Create a div for the moon with box shadows
    const moonDiv = document.createElement('div');
    moonDiv.className = 'moon-circle';
    moonDiv.style.cssText = `
      position: absolute;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #fff;
      opacity: 1;
      box-shadow: 
        inset 0 0 30px 0 #fff,
        inset 20px 0 30px #3F7BA9,
        inset -20px 0 30px #4A90E2,
        inset 20px 0 300px #5679C1,
        inset -20px 0 300px #497BA6,
        0 0 50px #fff,
        -10px 0 100px #4A90E2,
        10px 0 80px #3F7BA9;
      pointer-events: none;
      transform: translate(-50%, -50%);
      z-index: 1000;
    `;
    document.body.appendChild(moonDiv);
    
    // Position the moon div
    function updateMoonPosition() {
      const vector = new THREE.Vector3(-10, 7, 5);
      vector.project(camera);
      const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
      moonDiv.style.left = `${x}px`;
      moonDiv.style.top = `${y}px`;
    }
    
    // Create ground plane with physical properties
    const planeGeometry = new THREE.PlaneGeometry(2500, 500);
    const planeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x202020,
      roughness: 0.8,
      metalness: 0.2,
      transparent: true,
      opacity: 0.3
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.z = -100;
    plane.position.y = -15;
    plane.receiveShadow = true;
    scene.add(plane);

    // Function to check collision with ground plane
    function checkGroundCollision(object: THREE.Mesh) {
      const COLLISION_OFFSET = 2;
      const boundingBox = new THREE.Box3().setFromObject(object);
      const objectBottom = boundingBox.min.y;
      
      if (objectBottom <= plane.position.y + COLLISION_OFFSET) {
        const adjustment = (plane.position.y + COLLISION_OFFSET) - objectBottom;
        object.position.y += adjustment;
        return true;
      }
      return false;
    }

    // Create material
    const material = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.4,
      roughness: 0.7,
      emissive: 0x1A1A1A,
      emissiveIntensity: 0.05
    });

    // Create shapes with physics objects
    const shapes: THREE.Mesh[] = [];

    // Create cubes
    const cubeGeometry1 = new THREE.BoxGeometry(7.5, 7.5, 7.5);
    const cube1 = new THREE.Mesh(cubeGeometry1, material);
    cube1.position.set(3, 2, -5);  
    cube1.rotation.set(Math.PI / 6, Math.PI / 4, 0);
    cube1.castShadow = true;
    cube1.receiveShadow = false;
    scene.add(cube1);
    shapes.push(cube1);

    const cubeGeometry2 = new THREE.BoxGeometry(6.5, 6.5, 6.5);
    const cube2 = new THREE.Mesh(cubeGeometry2, material);
    cube2.position.set(-5, 8, -10);  
    cube2.rotation.set(-Math.PI / 4, Math.PI / 3, Math.PI / 6);
    cube2.castShadow = true;
    cube2.receiveShadow = false;
    scene.add(cube2);
    shapes.push(cube2);

    // Create spheres
    const sphereGeometry1 = new THREE.SphereGeometry(1, 32, 32);
    const sphere1 = new THREE.Mesh(sphereGeometry1, material);
    sphere1.position.set(6, 10, -7);  
    sphere1.castShadow = true;
    sphere1.receiveShadow = false;
    scene.add(sphere1);
    shapes.push(sphere1);

    const sphereGeometry2 = new THREE.SphereGeometry(1.3, 32, 32);
    const sphere2 = new THREE.Mesh(sphereGeometry2, material);
    sphere2.position.set(-6, 1, 1);  
    sphere2.castShadow = true;
    sphere2.receiveShadow = false;
    scene.add(sphere2);
    shapes.push(sphere2);

    // Create cylinders
    const cylinderGeometry = new THREE.CylinderGeometry(1.1, 1.1, 3.5, 32);
    const cylinder = new THREE.Mesh(cylinderGeometry, material);
    cylinder.position.set(-4, -3, 2);  
    cylinder.rotation.set(-Math.PI / 6, Math.PI / 8, -Math.PI / 6);
    cylinder.castShadow = true;
    cylinder.receiveShadow = false;
    scene.add(cylinder);
    shapes.push(cylinder);

    // Create pyramid
    const pyramidGeometry = new THREE.ConeGeometry(3, 4, 4);
    const pyramid = new THREE.Mesh(pyramidGeometry, material);
    pyramid.position.set(13, -2, -10);  
    pyramid.rotation.set(Math.PI / 6, -Math.PI / 4, Math.PI / 3);
    pyramid.castShadow = true;
    pyramid.receiveShadow = false;
    scene.add(pyramid);
    shapes.push(pyramid);

    // Track mouse position and movement
    const mouse = new THREE.Vector2();
    const previousMouse = new THREE.Vector2();
    const mouseDelta = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    interface ObjectState {
      velocity: THREE.Vector3;
      originalPosition: THREE.Vector3;
      rotationVelocity: THREE.Vector3;
      originalRotation: THREE.Euler;
      isHit: boolean;
    }

    // Initialize object states
    const objectStates = new Map<THREE.Mesh, ObjectState>();
    shapes.forEach(shape => {
      objectStates.set(shape, {
        velocity: new THREE.Vector3(),
        originalPosition: shape.position.clone(),
        rotationVelocity: new THREE.Vector3(),
        originalRotation: shape.rotation.clone(),
        isHit: false
      });
    });

    // Handle mouse move
    const onMouseMove = (event: MouseEvent) => {
      previousMouse.copy(mouse);
      
      // Calculate normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      // Calculate mouse movement delta
      mouseDelta.subVectors(mouse, previousMouse);

      // Update raycaster
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(shapes);

      if (intersects.length > 0) {
        const hitObject = intersects[0].object as THREE.Mesh;
        const state = objectStates.get(hitObject);
        if (!state) return;

        state.isHit = true;

        // Add movement force in same direction as mouse
        const force = new THREE.Vector3(
          mouseDelta.x * 2,
          mouseDelta.y * 2,
          0
        );
        state.velocity.add(force);

        // Add rotation based on movement direction
        const rotationForce = new THREE.Vector3(
          -mouseDelta.y * 0.15,  // Pitch (around X)
          mouseDelta.x * 0.15, // Yaw (around Y)
          -(Math.abs(mouseDelta.x) + Math.abs(mouseDelta.y)) * 0.15 // Roll (around Z)
        );
        state.rotationVelocity.add(rotationForce);
      }
    };

    function updatePhysics() {
      shapes.forEach(shape => {
        const state = objectStates.get(shape);
        if (!state) return;

        // Store original Z position
        const originalZ = shape.position.z;

        // Update position based on velocity
        shape.position.add(state.velocity);

        // Update rotation based on rotation velocity
        shape.rotation.x += state.rotationVelocity.x;
        shape.rotation.y += state.rotationVelocity.y;
        shape.rotation.z += state.rotationVelocity.z;

        // Ground collision check
        if (checkGroundCollision(shape)) {
          state.velocity.y = 0;
          state.rotationVelocity.x *= 0.7; // Gentle rotation damping on ground
          state.rotationVelocity.z *= 0.7;
        }

        // Maintain original Z position
        shape.position.z = originalZ;

        // Apply damping
        state.velocity.multiplyScalar(0.95);
        state.rotationVelocity.multiplyScalar(0.97); // Slower rotation decay

        // Reset if velocities are very small
        if (state.velocity.length() < 0.001) {
          state.velocity.set(0, 0, 0);
        }
        if (state.rotationVelocity.length() < 0.001) {
          state.rotationVelocity.set(0, 0, 0);
        }

        // Return force towards original position and rotation
        if (!state.isHit) {
          const returnForce = new THREE.Vector3(
            state.originalPosition.x - shape.position.x,
            state.originalPosition.y - shape.position.y,
            0
          ).multiplyScalar(0.001);
          state.velocity.add(returnForce);

          // Gentler return to original rotation
          const returnRotation = new THREE.Vector3(
            (state.originalRotation.x - shape.rotation.x) * 0.005,
            (state.originalRotation.y - shape.rotation.y) * 0.005,
            (state.originalRotation.z - shape.rotation.z) * 0.005
          );
          state.rotationVelocity.add(returnRotation);
        }

        // Reset hit state at end of frame
        state.isHit = false;
      });
    }

    // Animation loop
    function animate() {
      updateMoonPosition();
      updatePhysics();
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    // Event listeners
    window.addEventListener('mousemove', onMouseMove);
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (sceneRef.current) {
        sceneRef.current.removeChild(renderer.domElement);
      }
      document.body.removeChild(moonDiv);
    };
  }, []);

  useEffect(() => {
    let lastTime = performance.now();
    let prevMouseX = 0;
    let prevMouseY = 0;

    const moveCursor = (e: MouseEvent) => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      
      const newVelocityX = (e.clientX - prevMouseX) / (deltaTime || 16.67);
      const newVelocityY = (e.clientY - prevMouseY) / (deltaTime || 16.67);
      
      velocityX.set(newVelocityX);
      velocityY.set(newVelocityY);
      
      const predictiveDistance = 35;
      dotX.set(newVelocityX * predictiveDistance);
      dotY.set(newVelocityY * predictiveDistance);
      
      cursorX.set(e.clientX - 12);
      cursorY.set(e.clientY - 12);
      
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      lastTime = currentTime;
    };

    document.body.style.cursor = 'none';
    const links = document.querySelectorAll('a, button');
    links.forEach(link => {
      (link as HTMLElement).style.cursor = 'none';
    });

    window.addEventListener('mousemove', moveCursor);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.body.style.cursor = 'auto';
      links.forEach(link => {
        (link as HTMLElement).style.cursor = 'auto';
      });
    };
  }, [cursorX, cursorY, dotX, dotY, velocityX, velocityY]);

  const projectsData = [
    {
      title: "Boo",
      image: "/boo.png",
      description: "A versatile Discord bot designed to enhance server interactions and entertainment. It offers music playback and queue management, fun commands like 8ball predictions, server utilities such as clear messages, and an XP-based ranking system with leaderboard functionality. The bot makes servers more engaging and efficient for users and administrators alike.",
      tech: ["Python", "MongoDB"],
      link: "https://github.com/theanimated01/Boo"
    },
    {
      title: "Neptune",
      image: "/neptune.png",
      description: "Designed and implemented a dynamic scripting language inspired by Python, using C++. The language features a robust interpreter, comprehensive variable management, and essential control flow constructs. It emphasizes modularity and well-documented design for extensibility and clarity.",
      tech: ["C++"],
      link: "https://github.com/kenisha-v/Neptune-"
    },
    {
      title: "Crossy Roads",
      image: "/crossy_road.png",
      description: "An arcade game inspired by Crossy Roads, the game everyone knows and loves, where players guide chickens across various obstacles using keyboard controls. It features dynamic game levels and a simple yet fun gameplay experience. Developed with OpenGL for graphics rendering, the game offers a polished visual experience.",
      tech: ["C++", "OpenGL"],
      link: "https://github.com/rachit182/cs32-arcade"
    },
    {
      title: "Portfolio Website",
      image: "/website.png",
      description: "A modern, minimalist portfolio website built with Next.js and Three.js. Features interactive 3D elements, smooth animations, and responsive design. Implements custom shaders and physics-based interactions for an engaging user experience.",
      tech: ["Next.js", "Three.js", "TypeScript", "TailwindCSS"],
      link: "https://github.com/theanimated01/Portfolio-Website"
    },
    {
      title: "Zenith",
      image: "/zenith.png",
      description: "Zenith is a virtual fitness coach that uses MediaPipe for motion tracking and Cohere’s AI for personalized feedback, helping users improve exercise form in real-time.",
      tech: ["Python", "Tkinter", "OpenCV", "Cohere", "MediaPipe"],
      link: "https://github.com/kenisha-v/Zenith"
    },
    {
      title: "RealtAR",
      image: "/realtar.png",
      description: "The app helps potential home buyers instantly access property details via AR. Users point their camera at a house and takes a picture, and the app uses the user location to fetch property information, displaying details include price, bedrooms, bathrooms, and owner information in AR.",
      tech: ["iOS", "Swift", "SwiftUI", "Firebase"],
      link: "https://github.com/ucsb-cs184-f24/team13RealEstateAR"
    },
    {
      title: "Purrformance",
      image: "/purrformance.png",
      description: "Purrformance is a desktop cat companion designed to enhance focus and productivity. This AI-powered pet monitors your web activity, closing distractions and playfully interacting with your cursor. Combining AI and fun animations, Purrformance makes studying or working an engaging experience.",
      tech: ["Python", "PyQt", "Google Cloud NLP"],
      link: "https://github.com/theanimated01/SBHacksX"
    },
    {
      title: "Wordle Wizard",
      image: "/wordle.png",
      description: "Wordle Solver is a C++ program that helps players solve Wordle by refining word suggestions based on user feedback. It uses an interactive loop to filter a list of 5-letter words, suggesting the next best guess until the correct word is identified. Efficient, fun, and perfect for Wordle enthusiasts!",
      tech: ["C++"],
      link: "https://github.com/theanimated01/wordle-wizard"
    },
  ];

  const experienceData = [
    {
      company: "Event Staff App",
      role: "Software Engineer Intern",
      period: "April 2023 - Present",
      description: [
        "Integrated the Tripleseat API into the web app, automating event imports and account connectivity, increasing user engagement by 25%.",
        "Integrated QuickBooks into the web app, enabling clients to manage staff timesheets and payments seamlessly increasing user retention.",
        "Transformed the web app into a PWA, improving load times by 30%, enabling offline use, and boosting accessibility.",
        "Optimized a database of 100,000+ records by restructuring and removing redundancies, improving query performance."
      ]
    },
    {
      company: "Human AI Integration Lab",
      role: "Undergrad Research Assistant",
      period: "Sept 2023 - Dec 2023",
      description: [
        "Contributed to a project enabling individuals with disabilities to experience tactile sensations in VR through haptic feedback.",
        "Developed an application utilizing linear actuators to simulate object sensations, enhancing virtual reality interactions.",
        "Focused on improving accessibility by integrating advanced haptic technology to create immersive VR experiences."
      ]
    },
    {
      company: "International Space Settlement Design Competition",
      role: "Team Member - Automation Systems",
      period: "July 28-29, 2019",
      description: [
        "Contributed to the development of automation systems for space settlement operations, integrating robotics and network systems for maintenance and construction",
        "Facilitated team collaboration by resolving conflicts and guiding the team through creative plateaus, ensuring steady progress",
        "Used 3DS Max to model and visualize key settlement structures, ensuring alignment with the automation and operational requirements",
        "Won the competition with a sustainable, innovative space settlement design, reinforcing my passion for STEM and influencing my college major decision"
      ]
    }
  ];

  const ProjectCarousel = ({ projects }: { projects: typeof projectsData }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [displayedProjects, setDisplayedProjects] = useState<typeof projectsData>([]);
    const [lastScrollPos, setLastScrollPos] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize with 5 sets of projects for smoother bidirectional scrolling
    useEffect(() => {
      setDisplayedProjects([...projects, ...projects, ...projects, ...projects, ...projects]);
      setIsInitialized(true);
    }, [projects]);

    // Set initial scroll position to middle set
    useEffect(() => {
      if (isInitialized && containerRef.current) {
        const container = containerRef.current;
        const middlePosition = (container.scrollWidth - container.clientWidth) / 2;
        container.scrollLeft = middlePosition;
        setLastScrollPos(middlePosition);
      }
    }, [isInitialized]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const scrollPos = container.scrollLeft;
      const isScrollingRight = scrollPos > lastScrollPos;
      setLastScrollPos(scrollPos);

      // Calculate thresholds
      const scrollEndThreshold = container.clientWidth; // One viewport width
      const nearEnd = container.scrollWidth - (scrollPos + container.clientWidth) < scrollEndThreshold;
      const nearStart = scrollPos < scrollEndThreshold;

      if (nearEnd && isScrollingRight) {
        // Add more projects to the end
        setDisplayedProjects(prev => [...prev, ...projects]);
      } else if (nearStart && !isScrollingRight) {
        // Add more projects to the start and adjust scroll position
        setDisplayedProjects(prev => [...projects, ...prev]);
        // Maintain scroll position when adding to start
        requestAnimationFrame(() => {
          container.scrollLeft += projects.length * 432;
        });
      }

      // Cleanup if list gets too long
      if (displayedProjects.length > projects.length * 10) {
        if (isScrollingRight) {
          // Remove from start when scrolling right
          setDisplayedProjects(prev => prev.slice(projects.length));
          container.scrollLeft -= projects.length * 432;
        } else {
          // Remove from end when scrolling left
          setDisplayedProjects(prev => prev.slice(0, -projects.length));
        }
      }
    };

    return (
      <div className="relative">
        {/* Left Arrow */}
        <button 
          onClick={() => {
            if (containerRef.current) {
              containerRef.current.scrollBy({ left: -432, behavior: 'smooth' });
            }
          }}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white/80 hover:text-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Arrow */}
        <button 
          onClick={() => {
            if (containerRef.current) {
              containerRef.current.scrollBy({ left: 432, behavior: 'smooth' });
            }
          }}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white/80 hover:text-white w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Scroll Container */}
        <div 
          ref={containerRef}
          className="scroll-container overflow-x-auto hide-scrollbar scroll-smooth"
          onScroll={handleScroll}
        >
          <div className="flex space-x-8 pl-24" style={{ minWidth: 'min-content' }}>
            {displayedProjects.map((project, index) => (
              <motion.div
                key={`${project.title}-${index}`}
                className="bg-black/20 rounded-xl overflow-hidden flex-none w-[400px]"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.3) }}
                viewport={{ once: false, margin: "-100px" }}
              >
                {/* Project Image */}
                <div className="aspect-video w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Project Info */}
                <div className="p-6 flex flex-col h-[400px]">
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    {project.title}
                  </h3>
                  
                  <p className="text-white/70 leading-relaxed mb-6 h-[200px] overflow-y-auto custom-scrollbar">
                    {project.description}
                  </p>

                  <div className="mt-auto space-y-4">
                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map(tech => (
                        <span 
                          key={tech} 
                          className="text-sm bg-white/10 text-white/60 px-3 py-1 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Project Link - Optional */}
                    {project.link && (
                      <motion.a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-white/80 hover:text-white"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        View Project →
                      </motion.a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const [expandedExperience, setExpandedExperience] = useState("Event Staff App");

  const ExperienceBar = React.memo(function ExperienceBar({ experience }: { experience: typeof experienceData[0] }) {
      const isExpanded = expandedExperience === experience.company;

      const handleToggle = () => {
          setExpandedExperience(isExpanded ? "" : experience.company);
      };

      return (
          <div className="w-full mb-4">
              {/* Header Section */}
              <motion.div
                  className={`rounded-lg py-4 px-6 transition-colors duration-300 cursor-pointer ${
                      isExpanded ? 'bg-[#5679C1]' : 'bg-[#2A5D9E] hover:bg-[#4A90E2]'
                  }`}
                  style={{ width: '1200px' }}
                  onClick={handleToggle}
              >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold text-white">{experience.company}</h3>
                      <p className="text-white/80">{experience.role}</p>
                      <p className="text-sm text-white/60">{experience.period}</p>
                    </div>
                    <motion.button
                        className="text-white/80 hover:text-white"
                        onClick={handleToggle}
                    >
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {isExpanded ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </motion.div>
                    </motion.button>
                  </div>
              </motion.div>

              {/* Expandable Content Section */}
              <AnimatePresence initial={false}>
                  {isExpanded && (
                      <motion.div
                          key={experience.company}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="bg-[#1E293B] p-6 rounded-b-lg overflow-hidden"
                          style={{ width: '1200px' }}
                      >
                        
                          <ul className="space-y-2 text-white/70 list-disc list-inside">
                              {experience.description.map((point, i) => (
                                  <li key={i}>{point}</li>
                              ))}
                          </ul>
                      </motion.div>
                  )}
              </AnimatePresence>
          </div>
      );
  });

  return (
    <>
      {/* Custom Cursor */}
      <motion.div
        className="fixed w-6 h-6 rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
        transition={{
          scale: {
            type: "spring",
            damping: 25,
            stiffness: 100,
          },
        }}
      >
        <motion.div 
          className="w-1 h-1 bg-white rounded-full absolute top-1/2 left-1/2"
          style={{
            x: dotX,
            y: dotY,
            translateX: "-50%",
            translateY: "-50%"
          }}
        />
        <div className="w-full h-full border border-white rounded-full" />
      </motion.div>

      {/* Navbar */}
      <nav className="fixed top-0 z-[100] w-full bg-black/10 pointer-events-none h-16">
        <div className="mx-auto max-w-7xl px-6 h-full flex items-center justify-between">
          <motion.span 
            className="text-xl font-bold text-white pointer-events-auto tracking-wider"
            style={{ fontFamily: "var(--font-jetbrains)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            animesh_sachan
          </motion.span>
            <div className="flex gap-8 justify-center w-full absolute left-1/2 transform -translate-x-1/2">
            {['home', 'about', 'projects', 'experience', 'contact'].map((item, index) => (
              <motion.a
              key={item}
              href={`#${item}`}
              className="text-me text-white/80 hover:text-white transition-colors pointer-events-auto"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              >
              {`// ${item}`}
              </motion.a>
            ))}
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-[#1A1A1A] to-[#333333]">
        {/* 3D Canvas */}
        <div ref={sceneRef} className="absolute inset-0 z-[1]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center pointer-events-none">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
          <h1 
            className="text-8xl font-bold mb-4 text-white tracking-tight"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            ANIMESH SACHAN
            </h1>
            <div className="h-[30px] text-2xl text-[#B0C4DE] font-semibold tracking-widest">
              <Typewriter
                options={{
                  strings: [
                    'Fullstack Web Developer',
                    'Mobile App Developer',
                    'Game Developer',
                    'Racing Enthusiast'
                  ],
                  autoStart: true,
                  loop: true,
                  delay: 75,
                  deleteSpeed: 50,
                  cursor: '_',
                  wrapperClassName: "text-2xl text-[#FFFFFF] font-light tracking-widest",
                  cursorClassName: "text-[#FFFFFF]"
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen bg-[#1A1A1A] flex items-center">
        <div className="max-w-[100vw] mx-auto">
          <div className="px-6 max-w-6xl mx-auto">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {/* Left Column - Text */}
              <div className="space-y-8 max-w-xl">
                <h2 className="text-4xl font-bold text-white">About Me</h2>
                <div className="space-y-6">
                  <p className="text-white/80 leading-relaxed text-lg">
                    I&apos;m a passionate software engineer with a love for creating innovative solutions and tinkering with new technologies. 
                    My journey in tech has been driven by curiosity and the desire to build something impactful.
                  </p>
                  <p className="text-white/80 leading-relaxed text-lg">
                    When I&apos;m not coding, you&apos;ll find me engrossed in my hobbies like traveling, gaming, racing, (or anything that gives me that adrenaline rush). 
                    And obviously I also work on side projects - nothing groundbreaking (yet), but definitely entertaining enough to keep me awake past midnight.
                  </p>
                  <p className="text-white/80 leading-relaxed text-lg">
                    I&apos;m all about writing clean, efficient code—because who wants to debug a spaghetti mess at 3 a.m.?
                  </p>
                </div>
              </div>

              {/* Right Column - Photo */}
              <div className="flex flex-col items-center text-center md:translate-x-16">
                <motion.div 
                  className="relative w-72 h-72 mb-8"
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src="/photo.png" 
                      alt="Animesh Sachan" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 transform scale-105" />
                </motion.div>
                <motion.h3 
                  className="text-4xl font-bold text-white mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Animesh Sachan
                </motion.h3>
                <motion.p 
                  className="text-lg text-white/60 italic"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  &quot;live life, make a mark&quot;
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 bg-[#262626]">
        <div className="max-w-[100vw] mx-auto">
          <div className="px-6 max-w-6xl mx-auto">
            <motion.h2
              className="text-4xl font-bold text-white mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Projects
            </motion.h2>
          </div>
          
          <ProjectCarousel projects={projectsData} />
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="min-h-screen py-20 bg-[#1A1A1A] flex items-center">
        <div className="max-w-[100vw] mx-auto">
          <div className="px-6 max-w-6xl mx-auto">
            <motion.h2
              className="text-4xl font-bold text-white mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Professional Experience
            </motion.h2>
            <div className="space-y-4">
              {experienceData.map((exp) => (
                <ExperienceBar key={exp.company} experience={exp} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-screen py-20 bg-[#262626] text-white overflow-hidden flex items-center justify-center">
        <div className="max-w-3xl mx-auto text-center z-10">
          <motion.h2
            className="text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Contact Me
          </motion.h2>

          <motion.p
            className="text-lg mb-8 text-[#A4CBE3] font-medium tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Lets connect! Whether youre interested in collaborating on a project or just want to chat about technology feel free to reach out.
          </motion.p>

          <motion.p
            className="text-lg mb-8 text-[#A4CBE3] font-medium tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Currently seeking Summer 2025 internship opportunities!
          </motion.p>

          {/* Contact Options */}
          <div className="flex flex-col gap-6 md:gap-8 justify-center items-center">
            {/* Email */}
            <motion.a
              href="mailto:animesh010305@gmail.com"
              className="flex items-center gap-3 bg-transparent border-2 border-white text-white py-3 px-6 rounded-full text-lg hover:bg-white hover:text-black transition duration-300 ease-in-out relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <span className="font-mono text-xl">animesh010305@gmail.com</span>
              <motion.div
                className="absolute inset-0 border-2 border-white rounded-full animate-pulse"
                style={{ animationDuration: "1.5s" }}
              />
            </motion.a>

            {/* LinkedIn */}
            <motion.a
              href="https://www.linkedin.com/in/animesh-sachan-"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-transparent border-2 border-white text-white py-3 px-6 rounded-full text-lg hover:bg-white hover:text-black transition duration-300 ease-in-out"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              <AiOutlineLinkedin className="text-2xl" />
              LinkedIn
            </motion.a>

            {/* GitHub */}
            <motion.a
              href="https://github.com/theanimated01"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-transparent border-2 border-white text-white py-3 px-6 rounded-full text-lg hover:bg-white hover:text-black transition duration-300 ease-in-out"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.9 }}
            >
              <AiOutlineGithub className="text-2xl" />
              GitHub
            </motion.a>

            {/* Resume */}
            <motion.a
              href="/resume.pdf"
              download
              className="flex items-center gap-3 bg-transparent border-2 border-white text-white py-3 px-6 rounded-full text-lg hover:bg-white hover:text-black transition duration-300 ease-in-out"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.1 }}
            >
              <BsFillFileTextFill className="text-2xl" />
              Download Resume
            </motion.a>
          </div>
        </div>
      </section>
    </>
  );
}
