document.addEventListener("DOMContentLoaded", () => {
  // Elementos de la UI
  const infoCard = document.querySelector("#info-card");
  const cardTitle = document.querySelector("#card-title");
  const cardTag = document.querySelector("#card-tag");
  const cardDescription = document.querySelector("#card-description");
  const scannerHint = document.querySelector("#scanner-hint");
  const statusBadge = document.querySelector("#scan-status");
  const btnToggleAnim = document.querySelector("#btn-toggle-anim");
  const btnAudio = document.querySelector("#btn-audio");

  // Targets de la escena
  const targetHidrogeno = document.querySelector("#target-hidrogeno");
  const targetCorazon = document.querySelector("#target-corazon");
  const orbitAnim = document.querySelector("#orbit-anim");

  let isRotating = true;
  let currentTargetData = null;

  // Base de datos local de contenidos por Target Index
  const targetsData = {
    0: {
      title: "Átomo de Hidrógeno (H)",
      tag: "Química",
      description: "El elemento más ligero y abundante del universo. Posee 1 protón en su núcleo y 1 electrón en órbita.",
      speech: "Átomo de Hidrógeno. Es el primer elemento de la tabla periódica, compuesto por un protón y un electrón."
    },
    1: {
      title: "Corazón Humano",
      tag: "Biología",
      description: "Órgano muscular principal del sistema circulatorio. Bombea sangre oxigenada a todo el cuerpo humano.",
      speech: "Corazón Humano. Órgano muscular hueco que bombea sangre a través de los vasos sanguíneos del sistema circulatorio."
    }
  };

  // Web Audio API: Sonido sintético de confirmación
  function playFeedbackSound(freq = 600, type = 'sine') {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.log("AudioContext no soportado o bloqueado por el navegador", e);
    }
  }

  // Actualiza la UI según el objetivo detectado
  function onTargetFound(index) {
    currentTargetData = targetsData[index];
    if (!currentTargetData) return;

    playFeedbackSound(880, 'triangle');

    cardTitle.textContent = currentTargetData.title;
    cardTag.textContent = currentTargetData.tag;
    cardDescription.textContent = currentTargetData.description;

    infoCard.classList.remove("hidden");
    scannerHint.classList.add("hidden");

    statusBadge.textContent = "Detectado";
    statusBadge.classList.remove("pulse");
    statusBadge.style.background = "rgba(16, 185, 129, 0.2)";
    statusBadge.style.color = "#34d399";
  }

  // Restablece la UI cuando se pierde el objetivo
  function onTargetLost() {
    window.speechSynthesis.cancel(); // Detener narración si estaba activa
    infoCard.classList.add("hidden");
    scannerHint.classList.remove("hidden");

    statusBadge.textContent = "Escaneando...";
    statusBadge.classList.add("pulse");
    statusBadge.style.background = "rgba(255, 255, 255, 0.15)";
    statusBadge.style.color = "#ffffff";
    currentTargetData = null;
  }

  // Suscripción a eventos de MindAR
  if (targetHidrogeno) {
    targetHidrogeno.addEventListener("targetFound", () => onTargetFound(0));
    targetHidrogeno.addEventListener("targetLost", onTargetLost);
  }

  if (targetCorazon) {
    targetCorazon.addEventListener("targetFound", () => onTargetFound(1));
    targetCorazon.addEventListener("targetLost", onTargetLost);
  }

  // Control de Animación
  btnToggleAnim.addEventListener("click", () => {
    isRotating = !isRotating;
    if (orbitAnim) {
      orbitAnim.setAttribute("animation", "pause", !isRotating);
    }
    btnToggleAnim.textContent = isRotating ? "⏸️ Pausar Animación" : "▶️ Reanudar";
  });

  // Narración por Voz Sintetizada (Web Speech API)
  btnAudio.addEventListener("click", () => {
    if (!currentTargetData) return;
    window.speechSynthesis.cancel(); // Cancelar lecturas previas
    const utterance = new SpeechSynthesisUtterance(currentTargetData.speech);
    utterance.lang = "es-ES";
    window.speechSynthesis.speak(utterance);
  });
});