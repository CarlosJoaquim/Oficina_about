// script.js
document.addEventListener('DOMContentLoaded', function() {
    // ========== THEME TOGGLE FUNCTIONALITY ==========
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    // ========== MOBILE MENU FUNCTIONALITY ==========
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const navLinks = document.querySelectorAll('.nav-link');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on links
    [...navLinks, ...mobileNavLinks].forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            
            // Update active states
            updateActiveNavLink(this);
            updateActiveMobileNavLink(this.getAttribute('href'));
        });
    });
    
    function updateActiveNavLink(clickedLink) {
        navLinks.forEach(link => link.classList.remove('active'));
        clickedLink.classList.add('active');
    }
    
    function updateActiveMobileNavLink(href) {
        mobileNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === href) {
                link.classList.add('active');
            }
        });
    }

    // ========== SMOOTH SCROLLING ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========== MODAL FUNCTIONALITY ==========
    const modalTriggers = document.querySelectorAll('.clickable-card');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const targetModal = this.getAttribute('data-target');
            const modal = document.getElementById(targetModal);
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });
    
    // Close modal when clicking outside
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });

    // ========== FAQ ACCORDION FUNCTIONALITY ==========
    const faqQuestions = document.querySelectorAll('.faq-question');
    const faqCategoryBtns = document.querySelectorAll('.faq-category-btn');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('i');
            
            // Toggle current answer
            answer.classList.toggle('active');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
            
            // Close other answers in the same category
            const parentCategory = this.closest('.faq-category-content');
            const otherQuestions = parentCategory.querySelectorAll('.faq-question');
            
            otherQuestions.forEach(otherQuestion => {
                if (otherQuestion !== this) {
                    const otherAnswer = otherQuestion.nextElementSibling;
                    const otherIcon = otherQuestion.querySelector('i');
                    
                    otherAnswer.classList.remove('active');
                    otherIcon.classList.remove('fa-chevron-up');
                    otherIcon.classList.add('fa-chevron-down');
                }
            });
        });
    });
    
    // FAQ Category Switching
    faqCategoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            faqCategoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected category content
            document.querySelectorAll('.faq-category-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(category).classList.add('active');
        });
    });

    // ========== ENHANCED 3D PRODUCT VIEWER ==========
    const productBtns = document.querySelectorAll('.product-btn');
    let currentScene, currentCamera, currentRenderer, currentControls;
    let currentModel, isRotating = true;
    let textureLoader = new THREE.TextureLoader();
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();
    let measurePoints = [];
    let currentProductType = 'guardanapo';

    // Initialize enhanced 3D viewer
    initEnhanced3DViewer();

    productBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const product = this.getAttribute('data-product');
            currentProductType = product;
            
            // Update active button
            productBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update product info and 3D model
            updateProductInfo(product);
            update3DModel(product);
        });
    });

    function initEnhanced3DViewer() {
        const container = document.getElementById('product-viewer-3d');
        if (!container) return;
        
        // Hide loading after a short delay
        setTimeout(() => {
            const loadingElement = container.querySelector('.loading-3d');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        }, 1000);
        
        // Create scene with better lighting
        currentScene = new THREE.Scene();
        currentScene.background = new THREE.Color(0xf8f9fa);
        
        // Create camera with better positioning
        currentCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        currentCamera.position.set(0, 2, 8);
        
        // Create renderer with enhanced settings
        currentRenderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        currentRenderer.setSize(container.clientWidth, container.clientHeight);
        currentRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        currentRenderer.shadowMap.enabled = true;
        currentRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Clear existing content and add canvas
        container.innerHTML = '';
        container.appendChild(currentRenderer.domElement);
        
        // Enhanced lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        currentScene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        currentScene.add(directionalLight);
        
        const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        backLight.position.set(-5, -5, -5);
        currentScene.add(backLight);
        
        // Enhanced controls
        currentControls = new THREE.OrbitControls(currentCamera, currentRenderer.domElement);
        currentControls.enableDamping = true;
        currentControls.dampingFactor = 0.05;
        currentControls.rotateSpeed = 0.5;
        currentControls.enableZoom = true;
        currentControls.zoomSpeed = 0.8;
        currentControls.minDistance = 3;
        currentControls.maxDistance = 15;
        
        // Add a subtle grid for reference
        const gridHelper = new THREE.GridHelper(10, 10, 0x000000, 0x000000);
        gridHelper.material.opacity = 0.1;
        gridHelper.material.transparent = true;
        currentScene.add(gridHelper);
        
        // Create initial product
        createEnhancedProductModel('guardanapo');
        
        // Add click event for measurements
        container.addEventListener('click', onCanvasClick, false);
        
        // Handle window resize
        window.addEventListener('resize', onWindowResize);
        
        // Start animation loop
        animate();
        
        // Setup control buttons
        setup3DControls();
        
        function animate() {
            requestAnimationFrame(animate);
            
            if (isRotating && currentModel) {
                currentModel.rotation.y += 0.005;
            }
            
            currentControls.update();
            currentRenderer.render(currentScene, currentCamera);
        }
        
        function onWindowResize() {
            currentCamera.aspect = container.clientWidth / container.clientHeight;
            currentCamera.updateProjectionMatrix();
            currentRenderer.setSize(container.clientWidth, container.clientHeight);
        }
    }

    function onCanvasClick(event) {
        const container = document.getElementById('product-viewer-3d');
        const rect = container.getBoundingClientRect();
        
        mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, currentCamera);
        
        const intersects = raycaster.intersectObjects(currentScene.children, true);
        
        if (intersects.length > 0) {
            const point = intersects[0].point;
            showMeasurementAtPoint(point);
        }
    }

    function showMeasurementAtPoint(point) {
        // Remove previous measurement points
        measurePoints.forEach(obj => currentScene.remove(obj));
        measurePoints = [];
        
        // Create a marker at the clicked point
        const markerGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.copy(point);
        currentScene.add(marker);
        measurePoints.push(marker);
        
        // Get current product measures
        const measures = getProductMeasures(currentProductType);
        
        let measurementText = '';
        if (currentProductType === 'toalha-retangular') {
            // Convert 3D coordinates to real measurements (310x190 cm)
            const relativeX = ((point.x + measures.width/2) / measures.width) * 310;
            const relativeY = ((point.z + measures.height/2) / measures.height) * 190;
            measurementText = `Posição: ${Math.round(relativeX)}cm x ${Math.round(relativeY)}cm`;
        } else if (currentProductType === 'base-mesa') {
            // Convert 3D coordinates to real measurements (47x37 cm)
            const relativeX = ((point.x + measures.width/2) / measures.width) * 47;
            const relativeY = ((point.z + measures.height/2) / measures.height) * 37;
            measurementText = `Posição: ${Math.round(relativeX)}cm x ${Math.round(relativeY)}cm`;
        } else if (currentProductType === 'guardanapo') {
            // Convert 3D coordinates to real measurements (40x40 cm)
            const relativeX = ((point.x + measures.width/2) / measures.width) * 40;
            const relativeY = ((point.z + measures.height/2) / measures.height) * 40;
            measurementText = `Posição: ${Math.round(relativeX)}cm x ${Math.round(relativeY)}cm`;
        }
        
        // Update measurement display
        updateMeasureDisplay(measurementText);
        
        // Auto-remove marker after 3 seconds
        setTimeout(() => {
            currentScene.remove(marker);
            measurePoints = measurePoints.filter(m => m !== marker);
        }, 3000);
    }

    function updateMeasureDisplay(text) {
        let measureDisplay = document.getElementById('measure-display');
        if (!measureDisplay) {
            measureDisplay = document.createElement('div');
            measureDisplay.id = 'measure-display';
            measureDisplay.style.cssText = `
                position: absolute;
                top: 10px;
                left: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-size: 14px;
                z-index: 100;
                font-family: Arial, sans-serif;
            `;
            document.getElementById('product-viewer-3d').appendChild(measureDisplay);
        }
        measureDisplay.textContent = text;
    }

    function setup3DControls() {
        const resetBtn = document.getElementById('reset-view');
        const rotateBtn = document.getElementById('auto-rotate');
        const measuresBtn = document.getElementById('toggle-measures');
        
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                currentControls.reset();
                if (currentModel) {
                    currentModel.rotation.set(0, 0, 0);
                }
                // Clear measurements
                measurePoints.forEach(obj => currentScene.remove(obj));
                measurePoints = [];
                const measureDisplay = document.getElementById('measure-display');
                if (measureDisplay) measureDisplay.remove();
            });
        }
        
        if (rotateBtn) {
            rotateBtn.addEventListener('click', function() {
                isRotating = !isRotating;
                this.classList.toggle('active', isRotating);
            });
        }
        
        if (measuresBtn) {
            measuresBtn.addEventListener('click', function() {
                const measuresVisible = this.classList.toggle('active');
                const measureOverlay = document.querySelector('.measure-overlay');
                if (measureOverlay) {
                    measureOverlay.style.display = measuresVisible ? 'block' : 'none';
                }
            });
        }
    }

    function createEnhancedProductModel(productType) {
        // Clear existing model (keep lights and grid)
        const objectsToRemove = [];
        currentScene.children.forEach(child => {
            if (child.type === 'Mesh' && child !== currentScene.children.find(c => c.type === 'GridHelper')) {
                objectsToRemove.push(child);
            }
        });
        
        objectsToRemove.forEach(obj => currentScene.remove(obj));
        
        // Clear measurements
        measurePoints.forEach(obj => currentScene.remove(obj));
        measurePoints = [];
        
        let geometry, material, mesh;
        const measures = getProductMeasures(productType);
        
        // Load textures
        const textures = loadTextures(productType);
        
        switch(productType) {
            case 'guardanapo':
                // Guardanapo quadrado 40x40 cm
                geometry = new THREE.PlaneGeometry(measures.width, measures.height, 16, 16);
                
                material = new THREE.MeshLambertMaterial({ 
                    map: textures.diffuse,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.9
                });
                
                mesh = new THREE.Mesh(geometry, material);
                mesh.rotation.x = -Math.PI / 2;
                break;
                
            case 'base-mesa':
                // Base de mesa retangular 47x37 cm
                geometry = new THREE.PlaneGeometry(measures.width, measures.height, 1, 1);
                material = new THREE.MeshLambertMaterial({ 
                    map: textures.diffuse,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.85
                });
                
                mesh = new THREE.Mesh(geometry, material);
                mesh.rotation.x = -Math.PI / 2;
                break;
                
            case 'toalha-retangular':
                // Toalha retangular 310x190 cm (8 lugares)
                geometry = new THREE.PlaneGeometry(measures.width, measures.height, 32, 32);
                
                // Aplicar curva suave para simular caimento de tecido
                const positions = geometry.attributes.position;
                for (let i = 0; i < positions.count; i++) {
                    const x = positions.getX(i) / (measures.width / 2);
                    const y = positions.getY(i) / (measures.height / 2);
                    // Curva mais pronunciada nas bordas
                    const distanceFromCenter = Math.sqrt(x*x + y*y);
                    const curve = Math.cos(distanceFromCenter * Math.PI / 2) * 0.4;
                    positions.setZ(i, curve);
                }
                positions.needsUpdate = true;
                
                material = new THREE.MeshLambertMaterial({ 
                    map: textures.diffuse,
                    side: THREE.DoubleSide
                });
                
                mesh = new THREE.Mesh(geometry, material);
                mesh.rotation.x = -Math.PI / 2;
                break;
        }
        
        if (mesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            currentScene.add(mesh);
            currentModel = mesh;
            
            // Update visual measurements display
            updateVisualMeasures(measures, productType);
        }
    }

    function loadTextures(productType) {
        const basePath = 'img/'; // CAMINHO CORRETO PARA A PASTA IMG
        const textures = {
            diffuse: null
        };
        
        // Create canvas-based textures as fallback
        const createFallbackTexture = (color, pattern = false) => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            
            // Fill with base color
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 512, 512);
            
            if (pattern) {
                // Add fabric-like pattern
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                for (let i = 0; i < 512; i += 8) {
                    for (let j = 0; j < 512; j += 8) {
                        if ((i + j) % 16 === 0) {
                            ctx.fillRect(i, j, 2, 2);
                        }
                    }
                }
            }
            
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(4, 4);
            return texture;
        };
        
        // Try to load actual images from img/ folder
        switch(productType) {
            case 'guardanapo':
                textures.diffuse = createFallbackTexture('#f5e6c5', true);
                textureLoader.load('img/guardanapo.jpg', 
                    (tex) => { 
                        console.log('Textura guardanapo carregada com sucesso!');
                        textures.diffuse = tex; 
                        textures.diffuse.wrapS = THREE.RepeatWrapping;
                        textures.diffuse.wrapT = THREE.RepeatWrapping;
                        textures.diffuse.repeat.set(2, 2);
                        if(currentModel) {
                            currentModel.material.map = tex;
                            currentModel.material.needsUpdate = true;
                        }
                    },
                    // onProgress callback
                    (xhr) => {
                        console.log((xhr.loaded / xhr.total * 100) + '% carregado');
                    },
                    // onError callback
                    (err) => {
                        console.log('Erro ao carregar guardanapo.jpg, usando textura gerada');
                        console.log('Caminho tentado: img/guardanapo.jpg');
                    }
                );
                break;
                
            case 'base-mesa':
                textures.diffuse = createFallbackTexture('#2c5aa0', true);
                textureLoader.load('img/base-mesa.jpg', 
                    (tex) => { 
                        console.log('Textura base-mesa carregada com sucesso!');
                        textures.diffuse = tex; 
                        textures.diffuse.wrapS = THREE.RepeatWrapping;
                        textures.diffuse.wrapT = THREE.RepeatWrapping;
                        textures.diffuse.repeat.set(2, 2);
                        if(currentModel) {
                            currentModel.material.map = tex;
                            currentModel.material.needsUpdate = true;
                        }
                    },
                    (xhr) => {
                        console.log((xhr.loaded / xhr.total * 100) + '% carregado');
                    },
                    (err) => {
                        console.log('Erro ao carregar base-mesa.jpg, usando textura gerada');
                        console.log('Caminho tentado: img/base-mesa.jpg');
                    }
                );
                break;
                
            case 'toalha-retangular':
                textures.diffuse = createFallbackTexture('#ffffff', true);
                textureLoader.load('img/toalha-retangular.jpg', 
                    (tex) => { 
                        console.log('Textura toalha-retangular carregada com sucesso!');
                        textures.diffuse = tex; 
                        textures.diffuse.wrapS = THREE.RepeatWrapping;
                        textures.diffuse.wrapT = THREE.RepeatWrapping;
                        textures.diffuse.repeat.set(2, 2);
                        if(currentModel) {
                            currentModel.material.map = tex;
                            currentModel.material.needsUpdate = true;
                        }
                    },
                    (xhr) => {
                        console.log((xhr.loaded / xhr.total * 100) + '% carregado');
                    },
                    (err) => {
                        console.log('Erro ao carregar toalha-retangular.jpg, usando textura gerada');
                        console.log('Caminho tentado: img/toalha-retangular.jpg');
                    }
                );
                break;
        }
        
        return textures;
    }

    function getProductMeasures(productType) {
        const measures = {
            'guardanapo': { 
                width: 4.0,  // 40 cm em escala 3D
                height: 4.0, // 40 cm em escala 3D
                shape: 'Quadrado',
                displayWidth: '40 cm',
                displayHeight: '40 cm',
                places: '1 lugar'
            },
            'base-mesa': { 
                width: 4.7,  // 47 cm em escala 3D
                height: 3.7, // 37 cm em escala 3D
                shape: 'Retangular',
                displayWidth: '47 cm',
                displayHeight: '37 cm',
                places: '1 lugar'
            },
            'toalha-retangular': { 
                width: 6.2,  // 310 cm em escala 3D (reduzido para caber na cena)
                height: 3.8, // 190 cm em escala 3D (reduzido para caber na cena)
                shape: 'Retangular',
                displayWidth: '310 cm',
                displayHeight: '190 cm',
                places: '8 lugares'
            }
        };
        return measures[productType] || measures.guardanapo;
    }

    function updateVisualMeasures(measures, productType) {
        const horizontalMeasure = document.getElementById('measure-horizontal');
        const verticalMeasure = document.getElementById('measure-vertical');
        const widthElement = document.getElementById('measure-width');
        const heightElement = document.getElementById('measure-height');
        const shapeElement = document.getElementById('measure-shape');
        const placesElement = document.getElementById('measure-places');
        
        if (horizontalMeasure && verticalMeasure) {
            // Atualizar medidas visuais sobrepostas
            horizontalMeasure.querySelector('.measure-value').textContent = measures.displayWidth;
            verticalMeasure.querySelector('.measure-value').textContent = measures.displayHeight;
        }
        
        if (widthElement) {
            widthElement.textContent = `Comprimento: ${measures.displayWidth}`;
        }
        if (heightElement) {
            heightElement.textContent = `Largura: ${measures.displayHeight}`;
            heightElement.style.display = 'block';
        }
        if (shapeElement) {
            shapeElement.textContent = measures.shape;
        }
        if (placesElement) {
            placesElement.textContent = `${measures.places}`;
        }
    }

    function updateProductInfo(product) {
        const productName = document.getElementById('product-name');
        const productMeasures = document.getElementById('product-measures');
        const productDescription = document.getElementById('product-description');
        
        const productInfo = {
            'guardanapo': {
                name: 'Guardanapo',
                measures: '40x40 cm - 1 lugar',
                description: 'Guardanapo de alta qualidade em algodão, perfeito para complementar seu jogo americano.'
            },
            'base-mesa': {
                name: 'Base de Mesa',
                measures: '47x37 cm - 1 lugar',
                description: 'Base de mesa resistente e elegante, disponível em diversas cores e padrões.'
            },
            'toalha-retangular': {
                name: 'Toalha Retangular',
                measures: '310x190 cm - 8 lugares',
                description: 'Toalha de mesa rectangular premium, ideal para jantares formais e ocasiões especiais.'
            }
        };
        
        if (productInfo[product]) {
            if (productName) productName.textContent = productInfo[product].name;
            if (productMeasures) productMeasures.textContent = `Medidas: ${productInfo[product].measures}`;
            if (productDescription) productDescription.textContent = productInfo[product].description;
        }
    }

    function update3DModel(product) {
        createEnhancedProductModel(product);
    }

    // ========== CALCULATOR FUNCTIONALITY ==========
    const calculateBtn = document.getElementById('calculate-btn');
    const productTypeSelect = document.getElementById('product-type');
    const productPriceInput = document.getElementById('product-price');
    const quantityInput = document.getElementById('quantity');
    const deliveryLocationInput = document.getElementById('delivery-location');
    const calculationResult = document.getElementById('calculation-result');
    
    // Sample delivery fees (in practice, this would come from a database)
    const deliveryFees = {
        'luanda': 1500,
        'belas': 1200,
        'cazenga': 1000,
        'viana': 2000,
        'kilamba': 2500,
        'talatona': 1800
    };
    
    if (calculateBtn) {
        calculateBtn.addEventListener('click', function() {
            calculatePrice();
        });
    }
    
    // Also calculate when inputs change
    const calculatorInputs = [productTypeSelect, productPriceInput, quantityInput, deliveryLocationInput].filter(input => input);
    calculatorInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (productPriceInput.value && quantityInput.value) {
                calculatePrice();
            }
        });
    });
    
    function calculatePrice() {
        if (!calculationResult) return;
        
        const productType = productTypeSelect ? productTypeSelect.value : 'jogo-americano';
        const unitPrice = parseFloat(productPriceInput ? productPriceInput.value : 0) || 0;
        const quantity = parseInt(quantityInput ? quantityInput.value : 0) || 0;
        const location = deliveryLocationInput ? deliveryLocationInput.value.toLowerCase() : '';
        
        if (!unitPrice || !quantity) {
            calculationResult.innerHTML = '<p style="color: #dc3545;">Por favor, preencha o preço unitário e a quantidade.</p>';
            return;
        }
        
        let totalPrice = unitPrice * quantity;
        let deliveryFee = 0;
        let locationName = '';
        
        // Calculate delivery fee
        if (location) {
            for (const [key, fee] of Object.entries(deliveryFees)) {
                if (location.includes(key)) {
                    deliveryFee = fee;
                    locationName = key.charAt(0).toUpperCase() + key.slice(1);
                    break;
                }
            }
            
            if (!deliveryFee && location.trim() !== '') {
                deliveryFee = 2000; // Default fee for unspecified locations
                locationName = 'seu local';
            }
        }
        
        const finalPrice = totalPrice + deliveryFee;
        
        // Format currency (Kz)
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('pt-AO', {
                style: 'currency',
                currency: 'AOA'
            }).format(amount);
        };
        
        let resultHTML = `
            <div class="calculation-line">
                <span>Preço Unitário:</span>
                <strong>${formatCurrency(unitPrice)}</strong>
            </div>
            <div class="calculation-line">
                <span>Quantidade:</span>
                <strong>${quantity} ${productType === 'jogo-americano' ? 'lugares' : 'unidades'}</strong>
            </div>
            <div class="calculation-line">
                <span>Subtotal:</span>
                <strong>${formatCurrency(totalPrice)}</strong>
            </div>
        `;
        
        if (deliveryFee > 0) {
            resultHTML += `
                <div class="calculation-line">
                    <span>Taxa de Entrega (${locationName}):</span>
                    <strong>${formatCurrency(deliveryFee)}</strong>
                </div>
            `;
        }
        
        resultHTML += `
            <div class="calculation-line total">
                <span>Total a Pagar:</span>
                <strong>${formatCurrency(finalPrice)}</strong>
            </div>
        `;
        
        if (productType === 'jogo-americano') {
            resultHTML += `
                <div class="calculation-note">
                    <p><small>Nota: O preço do jogo americano é por lugar (Base + Guardanapo)</small></p>
                </div>
            `;
        }
        
        calculationResult.innerHTML = resultHTML;
    }

    // ========== CONTACT FORM FUNCTIONALITY ==========
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Basic validation
            if (!name || !email || !message) {
                showNotification('Por favor, preencha todos os campos.', 'error');
                return;
            }
            
            // Simulate form submission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.innerHTML = '<span class="loading"></span> Enviando...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
    
    function showNotification(message, type) {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1200;
            display: flex;
            align-items: center;
            gap: 15px;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Add close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', function() {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
        
        // Add keyframes for animation
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ========== SCROLL ANIMATIONS ==========
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Update navigation active state
                const id = entry.target.getAttribute('id');
                updateNavigationActiveState(id);
            }
        });
    }, observerOptions);
    
    // Observe sections for animation
    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    function updateNavigationActiveState(sectionId) {
        const correspondingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        const correspondingMobileLink = document.querySelector(`.mobile-nav-link[href="#${sectionId}"]`);
        
        if (correspondingLink) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            correspondingLink.classList.add('active');
        }
        
        if (correspondingMobileLink) {
            document.querySelectorAll('.mobile-nav-link').forEach(link => {
                link.classList.remove('active');
            });
            correspondingMobileLink.classList.add('active');
        }
    }

    // ========== ENHANCE CARDS WITH HOVER EFFECTS ==========
    const cards = document.querySelectorAll('.catalogo-card, .info-card, .rule-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // ========== PERFORMANCE OPTIMIZATIONS ==========
    // Lazy loading for images (if added later)
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ========== INITIALIZE DEFAULT STATES ==========
    // Set first FAQ category as active
    const firstFaqCategory = document.querySelector('.faq-category-content');
    if (firstFaqCategory) {
        firstFaqCategory.classList.add('active');
    }
    
    // Initialize calculator with sample data
    if (productPriceInput && quantityInput) {
        productPriceInput.value = '1500';
        quantityInput.value = '8';
        calculatePrice();
    }
    
    console.log('Oficina da Fampa - Página carregada com sucesso!');
});

// ========== ADDITIONAL GLOBAL FUNCTIONS ==========
// WhatsApp quick contact
function openWhatsApp(number = '938534066') {
    const message = 'Olá! Gostaria de obter mais informações sobre os produtos da Oficina da Fampa.';
    const url = `https://wa.me/244${number}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Quick catalog access
function openCatalog(url) {
    window.open(url, '_blank');
}

// Print product information
function printProductInfo(productId) {
    const productElement = document.getElementById(productId);
    if (productElement) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Informações do Produto - Oficina da Fampa</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #d4af37; }
                        .product-info { margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <h1>Oficina da Fampa</h1>
                    <div class="product-info">
                        ${productElement.innerHTML}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}