// --- VARIABLES GLOBALES ---
let toqueIzquierda = false;
let toqueDerecha = false;
let toqueSalto = false;
let saltosRealizados = 0;
let botonSaltoLiberado = true; // Para evitar volar si dejas la tecla apretada
let diamantesRecolectados = 0;
const totalDiamantes = 4;

// --- BASE DE DATOS DE PIONERAS ---
const datosPioneras = [
    {
        nombre: "Ada Lovelace",
        texto: "Considerada la primera programadora de la historia (1843). Ella imaginó que las computadoras podrían ir más allá de los números y crear arte y música.",
        foto: "assets/Ada Lovelace.png" // Luego cambias esto por tu PNG con filtro de lápiz
    },
    {
        nombre: "Grace Hopper",
        texto: "Pionera de la informática y contraalmirante de la Marina de EE. UU. Inventó el primer compilador de código y popularizó el término 'bug'.",
        foto: "assets/Grace Hopper.png"
    },
    {
        nombre: "Jane McGonigal",
        texto: "Diseñadora de juegos defensora de la gamificación para resolver problemas del mundo real. Demostró que jugar puede sanar nuestro cerebro.",
        foto: "assets/Jane McGonigal.png"
    },
    {
        nombre: "Susan Kare",
        texto: "La diseñadora pionera detrás del 'pixel art' y los íconos originales de la primera Apple Macintosh. Tradujo el lenguaje de las máquinas a un lenguaje visual.",
        foto: "assets/Susan Kare.png"
    }
];

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT, // Se adapta al tamaño de la pantalla
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1000, // Ancho de la cámara que ve el usuario
        height: 500
    },
    backgroundColor: '#f3e5f5', 
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 800 }, debug: false }
    },
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);
let player;
let cursors;
let plataformas;
let diamantes;

// --- 1. PRECARGA DE ARCHIVOS ---
function preload() {
    this.load.image('fondoMapa', 'assets/mapa.png');

     // Agrega esto donde cargas tus imágenes
    this.load.image('miDiamante', 'assets/diamante.png');

    // Animación STAY (Quieta)
    this.load.image('stay1', 'assets/personaje/stay/stay1.png');
    this.load.image('stay2', 'assets/personaje/stay/stay2.png');
    this.load.image('stay3', 'assets/personaje/stay/stay3.png');

    // Animación WALK (Caminar)
    this.load.image('walk1', 'assets/personaje/walk/walk1.png');
    this.load.image('walk2', 'assets/personaje/walk/walk2.png');
    this.load.image('walk3', 'assets/personaje/walk/walk3.png');
    this.load.image('walk4', 'assets/personaje/walk/walk4.png');
    this.load.image('walk5', 'assets/personaje/walk/walk5.png');
    this.load.image('walk6', 'assets/personaje/walk/walk6.png');

    // Animación JUMP (Saltar)
    this.load.image('jump1', 'assets/personaje/jump/jump1.png');
    this.load.image('jump2', 'assets/personaje/jump/jump2.png');
    this.load.image('jump3', 'assets/personaje/jump/jump3.png');
    this.load.image('jump4', 'assets/personaje/jump/jump4.png');

   

    // --- CARGAR AUDIOS ---
    this.load.audio('musicaFondo', 'assets/sounds/musica.mp3');
    this.load.audio('sonidoDiamante', 'assets/sounds/Diamond.mp3');
}

// --- 2. CREACIÓN DEL MUNDO ---
function create() {
    // 1. EL MUNDO Y LA CÁMARA
    const anchoDelMapa = 4000; 
    this.physics.world.setBounds(0, 0, anchoDelMapa, 500);
    this.cameras.main.setBounds(0, 0, anchoDelMapa, 500);

    // 2. INTEGRAR EL FONDO
    let fondo = this.add.image(0, 0, 'fondoMapa').setOrigin(0, 0);
    fondo.displayHeight = 500; 
    fondo.scaleX = fondo.scaleY; 

    // 3. EL PISO TRANPARENTE
    plataformas = this.physics.add.staticGroup();
    let piso = this.add.rectangle(anchoDelMapa / 2, 480, anchoDelMapa, 40, 0x000000, 0); 
    plataformas.add(piso);

    // 4. CREAMOS A LA PROTAGONISTA (Nace con la pose stay1)
    player = this.physics.add.sprite(100, 300, 'stay1'); 
    player.setScale(0.75); // Ajusta la escala si lo necesitas
    player.body.setCollideWorldBounds(true);
    this.physics.add.collider(player, plataformas);

    // 5. CREAMOS LAS ANIMACIONES
    this.anims.create({
        key: 'quieta',
        frames: [ { key: 'stay1' }, { key: 'stay2' }, { key: 'stay3' } ],
        frameRate: 3,  
        yoyo: true,
        repeatDelay: 2000,
        repeat: -1     
    });

    this.anims.create({
        key: 'caminar',
        frames: [ { key: 'walk1' }, { key: 'walk2' }, { key: 'walk3' }, { key: 'walk4' },{ key: 'walk5' },{ key: 'walk6' } ],
        frameRate: 10, 
        repeat: -1
    });

    this.anims.create({
        key: 'saltar',
        frames: [ { key: 'jump1' }, { key: 'jump2' }, { key: 'jump3' }, { key: 'jump4' } ],
        frameRate: 8,
        repeat: 0      
    });

    // LA CÁMARA SIGUE AL PERSONAJE
    this.cameras.main.startFollow(player, true, 0.05, 0.05);

    // 6. LOS DIAMANTES
    diamantes = this.physics.add.group({ allowGravity: false });
    
    // Coordenadas de los diamantes (Ajusta según tu mapa)
    crearDiamanteFlotante(this, 600, 210, 0);  // Diamante 1 (Ada)
    crearDiamanteFlotante(this, 1560, 180, 1); // Diamante 2 (Grace)
    crearDiamanteFlotante(this, 2170, 230, 2); // Diamante 3 (Jane)
    crearDiamanteFlotante(this, 2890, 180, 3); // Diamante 4 (Susan)

    this.physics.add.overlap(player, diamantes, chocarConDiamante, null, this);
    cursors = this.input.keyboard.createCursorKeys();

    // --- MÚSICA DE FONDO ---
    // El volumen va de 0.0 a 1.0 (0.2 es un buen volumen de fondo)
    let musica = this.sound.add('musicaFondo', { loop: true, volume: 0.2 });
    musica.play();
    // 7. CONFIGURAR BOTONES Y PAUSAR HASTA DARLE A COMENZAR
    configurarBotonesMoviles();
    this.scene.pause(); 
}

// --- 3. ACTUALIZACIÓN (Bucle del juego) ---
function update() {
    // Si el pop-up está abierto, no hacemos nada
    if (game.scene.scenes[0].scene.isPaused()) return;

    player.body.setVelocityX(0);

    // --- MOVIMIENTO Y ANIMACIÓN HORIZONTAL ---
    if (cursors.left.isDown || toqueIzquierda) { 
        player.body.setVelocityX(-250); 
        player.anims.play('caminar', true); 
        player.setFlipX(true);              
    } else if (cursors.right.isDown || toqueDerecha) { 
        player.body.setVelocityX(250); 
        player.anims.play('caminar', true); 
        player.setFlipX(false);             
    } else {
        // Animación de respirar si está en el piso y sin moverse
        if (player.body.touching.down) {
            player.anims.play('quieta', true);
        }
    }

    // --- LÓGICA DE DOBLE SALTO Y ANIMACIÓN ---
    if (player.body.touching.down) { 
        saltosRealizados = 0; 
    }

    if (!cursors.up.isDown && !toqueSalto) {
        botonSaltoLiberado = true;
    }

    if ((cursors.up.isDown || toqueSalto) && botonSaltoLiberado) {
        if (saltosRealizados < 2) { 
            player.body.setVelocityY(-500); 
            player.anims.play('saltar', true); 
            saltosRealizados++;
            botonSaltoLiberado = false; 
        }
    }
}

// --- 4. FUNCIONES EXTRA ---

function crearDiamanteFlotante(escena, posX, posY, indicePionera) {

    // 1. Creamos la imagen física del diamante (lo que ya tenías)
    let diamante = escena.physics.add.image(posX, posY, 'miDiamante');
    
    // 2. AJUSTE DE TAMAÑO (¡No olvides ajustar este número a tu PNG!)
  
    diamante.setScale(0.3); 
    
    // 3. APAGAMOS GRAVEDAD (Para que no se caiga)
    diamante.body.setAllowGravity(false);
    
    // --- NUEVO: EFECTO DE RESPLANDOR (GLOW) ---

    let efectoBrillo = diamante.postFX.addGlow(0xe0b7f7,5, 1, false);

    // --- OPCIONAL: GLOW QUE PULSA ---
    // Si quieres que el resplandor aumente y disminuya suavemente (pulsante):
    escena.tweens.add({
        targets: efectoBrillo,
        intensity: 2,    // El brillo máximo que alcanza
        duration: 1500,  // Tiempo que tarda en hacer un ciclo de pulso
        yoyo: true,      // Vuelve al valor inicial (0)
        repeat: -1,      // Repite para siempre
        ease: 'Sine.easeInOut' // Movimiento suave
    });
    // ------------------------------------------

    // Tu rotación random (Opcional, se ve bien con el glow)
    diamante.angle = Phaser.Math.Between(-15, 15); 
    
    // La etiqueta invisible de la pionera
    diamante.idPionera = indicePionera; 
    
    // Lo metemos al grupo de diamantes
    diamantes.add(diamante);

    // Animación de flotar (subir y bajar)
    escena.tweens.add({
        targets: diamante,
        y: posY - 15,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
}
function chocarConDiamante(player, diamante) {

    // 👇 REPRODUCIMOS EL EFECTO DE SONIDO (A volumen normal: 1.0) 👇
    this.sound.play('sonidoDiamante', { volume: 1.0 });

    // 1. Leemos qué número de pionera tiene este diamante
    let id = diamante.idPionera;
    let info = datosPioneras[id];

    // 2. INYECTAMOS LA INFORMACIÓN EN EL HTML
    document.getElementById('titulo-pionera').innerText = info.nombre;
    document.getElementById('texto-pionera').innerText = info.texto;
    document.getElementById('img-pionera').src = info.foto;

    // 3. Destruimos el diamante y sumamos puntos (lo que ya tenías)
    diamante.destroy(); 
    diamantesRecolectados++;
    document.getElementById('texto-contador').innerText = diamantesRecolectados + '/' + totalDiamantes;
    
    player.body.setVelocity(0); 
    toqueIzquierda = false; toqueDerecha = false; toqueSalto = false; 
    
    game.scene.scenes[0].scene.pause(); 
    
    // 4. ¡Mostramos el pop-up ya actualizado!
    document.getElementById('popup-pionera').style.display = 'flex';
    document.getElementById('controles-moviles').style.display = 'none'; 
}

window.cerrarPopup = function() {
    document.getElementById('popup-pionera').style.display = 'none'; 
    
    if (diamantesRecolectados >= totalDiamantes) {
        setTimeout(() => {
            document.getElementById('pantalla-final').style.display = 'flex';
            document.getElementById('video-ganador').play();
            
            // 👇 NUEVO: Silenciamos el juego para que brille el video 👇
            game.sound.pauseAll();

        }, 500);
    } else {
        document.getElementById('controles-moviles').style.display = 'block'; 
        game.scene.scenes[0].scene.resume(); 
    }
};

function configurarBotonesMoviles() {
    const btnIzq = document.getElementById('btn-izq');
    const btnDer = document.getElementById('btn-der');
    const btnSalto = document.getElementById('btn-salto');

    btnIzq.addEventListener('mousedown', () => toqueIzquierda = true);
    btnIzq.addEventListener('mouseup', () => toqueIzquierda = false);
    btnDer.addEventListener('mousedown', () => toqueDerecha = true);
    btnDer.addEventListener('mouseup', () => toqueDerecha = false);
    btnSalto.addEventListener('mousedown', () => toqueSalto = true);
    btnSalto.addEventListener('mouseup', () => toqueSalto = false);

    btnIzq.addEventListener('touchstart', (e) => { e.preventDefault(); toqueIzquierda = true; });
    btnIzq.addEventListener('touchend', (e) => { e.preventDefault(); toqueIzquierda = false; });
    btnDer.addEventListener('touchstart', (e) => { e.preventDefault(); toqueDerecha = true; });
    btnDer.addEventListener('touchend', (e) => { e.preventDefault(); toqueDerecha = false; });
    btnSalto.addEventListener('touchstart', (e) => { e.preventDefault(); toqueSalto = true; });
    btnSalto.addEventListener('touchend', (e) => { e.preventDefault(); toqueSalto = false; });
}

window.reiniciarJuego = function() {
    document.getElementById('pantalla-final').style.display = 'none';
    document.getElementById('controles-moviles').style.display = 'none';
    document.getElementById('pantalla-inicio').style.display = 'flex';
    
    let video = document.getElementById('video-ganador');
    video.pause();
    video.currentTime = 0; 
    
    // 👇 NUEVO: Despertamos la música del juego 👇
    game.sound.resumeAll();
    
    diamantesRecolectados = 0;
    document.getElementById('texto-contador').innerText = '0/4';
    
    toqueIzquierda = false; toqueDerecha = false; toqueSalto = false;
    game.scene.scenes[0].scene.restart();
};

// --- CONTROL DE AUDIO ---
let audioMutado = false;

window.toggleAudio = function() {
    audioMutado = !audioMutado; // Cambiamos el estado (de falso a verdadero y viceversa)
    
    // El interruptor maestro de Phaser
    game.sound.mute = audioMutado; 
    
    // Cambiamos el icono del botón en el HTML
    const btn = document.getElementById('btn-audio');
    if (audioMutado) {
        btn.innerHTML = '<img src="assets/soun0ff.png" alt="Mute">'; // Cambia esto por tu icono de mute
        btn.style.opacity = '0.7'; // Lo hacemos un poco transparente para que se note apagado
    } else {
        btn.innerHTML = '<img src="assets/sound.png" alt="Audio">';
        btn.style.opacity = '1';
    }
};

// --- FUNCIÓN PARA DESPERTAR EL JUEGO ---
window.iniciarJuego = function() {
    // 1. Escondemos la pantalla de inicio
    document.getElementById('pantalla-inicio').style.display = 'none';
    
    // 2. Mostramos los controles móviles (si estás en celular)
    document.getElementById('controles-moviles').style.display = 'block';
    
    // 3. ¡Despertamos el motor de Phaser!
    game.scene.scenes[0].scene.resume();
};