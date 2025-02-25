import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const SmokeEffect = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    // 初始化场景
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    camera.position.z = 1000;
    sceneRef.current = scene;

    // 创建粒子系统
    const maxParticles = 1000;
    const material = new THREE.PointsMaterial({
      color: 0xcccccc,
      size: 20,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(maxParticles * 3);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // 粒子类
    class Particle {
      constructor(x, y) {
        this.position = new THREE.Vector3(x, y, 0);
        this.velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          0
        );
        this.life = 1.0;
        this.size = Math.random() * 20 + 10;
        this.alpha = Math.random() * 0.5 + 0.5;
      }

      update() {
        this.position.add(this.velocity);
        this.velocity.y -= 0.02; // 向上漂移
        this.velocity.multiplyScalar(0.98); // 阻力
        this.life -= 0.01;
        return this.life > 0;
      }
    }

    // 鼠标事件处理
    const handleMouseMove = (event) => {
      const mouseX = event.clientX - window.innerWidth / 2;
      const mouseY = -(event.clientY - window.innerHeight / 2);

      // 创建新粒子
      for (let i = 0; i < 5; i++) {
        if (particlesRef.current.length < maxParticles) {
          particlesRef.current.push(new Particle(mouseX, mouseY));
        }
      }
    };

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);

      // 更新粒子
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].update()) {
          particles.splice(i, 1);
          continue;
        }

        const index = i * 3;
        positions[index] = particles[i].position.x;
        positions[index + 1] = particles[i].position.y;
        positions[index + 2] = particles[i].position.z;
      }

      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    };

    // 窗口大小调整
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // 添加事件监听
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    // 开始动画
    animate();

    // 清理函数
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 100,
      }}
    />
  );
};

export default SmokeEffect;
