(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const source = el('source'), canvas = el('output');
  const ctx = canvas.getContext('2d', {alpha: false});
  const probe = document.createElement('canvas');
  probe.width = 192; probe.height = 108;
  const analysis = probe.getContext('2d', {willReadFrequently: true});
  const entire = {left: 0, top: 0, right: 1, bottom: 1};
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const number = (value, digits = 0) => value.toLocaleString('pt-PT', {maximumFractionDigits: digits});
  let roi = entire, selecting = false, corner = null, crop = null;
  let session = 0, stream = null, url = null, raf = 0, callback = null, running = false;
  let auto = true, previous = null, lastMedia = null, lastHit = 0, hit = null;
  let misses = 0, samples = 0, draws = 0, rateStart = 0, lastDraw = 0, sampleTime = 0;
  let wantedX = .5, wantedY = .5, viewX = .5, viewY = .5;

  function resetAnalysis() {
    previous = null; lastMedia = null; hit = null; misses = 0; lastHit = 0;
    samples = draws = 0; rateStart = performance.now(); sampleTime = 0;
    el('fps').textContent = 'Análise — fps · Ecrã — fps';
    el('tracking').textContent = 'Alvo —';
    el('debug').textContent = auto ? 'À espera de fotogramas distintos.' : 'Análise suspensa em modo manual.';
  }

  function sample(now, media) {
    if (!auto || selecting || source.readyState < 2 || source.seeking || media === lastMedia) return;
    if (lastMedia !== null && (media < lastMedia || media - lastMedia > .8)) previous = null;
    if (previous && media >= lastMedia && media - lastMedia < .093) return;
    lastMedia = media;
    try {
      analysis.drawImage(source, 0, 0, probe.width, probe.height);
      const rgba = analysis.getImageData(0, 0, probe.width, probe.height).data;
      const gray = new Uint8Array(probe.width * probe.height);
      for (let i = 0; i < gray.length; i++) {
        const k = i * 4;
        gray[i] = (3 * rgba[k] + 6 * rgba[k+1] + rgba[k+2]) / 10;
      }
      if (previous) {
        const result = measureMotion(gray, previous, probe.width, probe.height, roi,
          Number(el('contrast').value), Number(el('area').value));
        samples++;
        hit = result.target;
        if (hit) {
          wantedX = hit.x; wantedY = hit.y; lastHit = now; misses = 0;
          el('tracking').textContent = 'Alvo · X ' + number(hit.x*100) + '% · Y ' + number(hit.y*100) + '%';
        } else {
          misses++;
          if (now - lastHit > 3000) wantedX = wantedY = .5;
          el('tracking').textContent = 'Sem alvo · ' + misses + ' análises consecutivas';
        }
        el('debug').textContent = (hit ? 'Movimento localizado' : result.reason) +
          ' · Área ativa ' + number(result.percent, 2) + '%';
      } else {
        hit = null;
        el('tracking').textContent = 'Alvo —';
        el('debug').textContent = 'A recolher referência.';
      }
      sampleTime = now;
      previous = gray;
    } catch (error) {
      previous = hit = null;
      el('tracking').textContent = 'Alvo —';
      el('debug').textContent = 'Falha ao ler o vídeo · ' + error.message;
    }
  }

  function onFrame(now, metadata) {
    if (!running) return;
    sample(now, metadata.mediaTime);
    callback = source.requestVideoFrameCallback(onFrame);
  }

  // The same transform serves drawing, overlay placement and touch coordinates.
  function geometry() {
    const w = source.videoWidth, h = source.videoHeight;
    const scale = selecting ? Math.min(canvas.width/w, canvas.height/h) :
      Math.max(canvas.width/w, canvas.height/h) * Number(el('zoom').value);
    const dw = Math.min(canvas.width, w*scale), dh = Math.min(canvas.height, h*scale);
    const sw = dw/scale, sh = dh/scale;
    return {sx: clamp(viewX*w-sw/2, 0, w-sw), sy: clamp(viewY*h-sh/2, 0, h-sh),
      sw, sh, dx: (canvas.width-dw)/2, dy: (canvas.height-dh)/2, dw, dh, scale};
  }

  function draw(now) {
    if (!running) return;
    raf = requestAnimationFrame(draw);
    if (source.readyState >= 2 && source.videoWidth) {
      if (!source.requestVideoFrameCallback) sample(now, source.currentTime);
      const dt = Math.min(.1, (now-lastDraw)/1000);
      const ease = 1-Math.exp(-dt*(11-Number(el('smooth').value)/10));
      viewX += (wantedX-viewX)*ease; viewY += (wantedY-viewY)*ease;
      crop = geometry();
      const {sx, sy, sw, sh, dx, dy, dw, dh, scale} = crop;
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh);
      const px = x => dx + (x*source.videoWidth-sx)*scale;
      const py = y => dy + (y*source.videoHeight-sy)*scale;
      ctx.lineWidth = 3; ctx.strokeStyle = '#b4fa56';
      if (selecting) {
        ctx.strokeRect(px(roi.left)+1, py(roi.top)+1, px(roi.right)-px(roi.left)-2, py(roi.bottom)-py(roi.top)-2);
        if (corner) ctx.strokeRect(px(corner.x)-5, py(corner.y)-5, 10, 10);
      } else if (auto && hit && now-sampleTime < 750 && el('marker').checked) {
        const x = px(hit.x), y = py(hit.y);
        ctx.beginPath(); ctx.arc(x,y,12,0,2*Math.PI); ctx.stroke();
        ctx.fillStyle = '#b4fa56'; ctx.fillRect(x-2,y-2,4,4);
      }
      draws++;
    }
    lastDraw = now;
    const elapsed = now-rateStart;
    if (elapsed >= 1000) {
      el('fps').textContent = 'Análise ' + number(samples*1000/elapsed,1) + ' fps · Ecrã ' +
        number(draws*1000/elapsed) + ' fps';
      if (auto && !selecting && !samples && sampleTime && now-sampleTime > 1200 && !source.error) {
        el('debug').textContent = 'Sem novos fotogramas para análise.';
        el('tracking').textContent = 'Alvo —';
      }
      rateStart = now; samples = draws = 0;
    }
  }

  function regionLabel() {
    el('pitch').textContent = selecting ? 'Cancelar seleção' : 'Selecionar região';
    el('region').textContent = selecting ? (corner ? 'Toca no canto oposto.' : 'Toca num canto do campo na imagem inteira.') :
      (roi === entire ? 'Região de análise · imagem inteira' : 'Região selecionada · X ' +
        number(100*roi.left)+'–'+number(100*roi.right)+'% · Y '+number(100*roi.top)+'–'+number(100*roi.bottom)+'%');
    document.querySelector('.hint').textContent = selecting ? el('region').textContent :
      'Um toque na imagem passa para Manual. Para retomar o seguimento, escolhe Automático.';
  }

  function mode(value) {
    auto = value; selecting = false; corner = null; regionLabel();
    el('auto').classList.toggle('active', auto); el('manual').classList.toggle('active', !auto);
    el('modeText').textContent = auto ? 'Automático' : 'Manual';
    resetAnalysis();
  }
  el('auto').onclick = () => mode(true);
  el('manual').onclick = () => mode(false);
  el('center').onclick = () => { wantedX = wantedY = .5; };
  el('pitch').onclick = () => {
    selecting = !selecting; corner = null; crop = null; resetAnalysis(); regionLabel();
    if (selecting) canvas.scrollIntoView({block: 'center'});
  };
  el('all').onclick = () => {
    selecting = false; corner = null; roi = entire; crop = null; resetAnalysis(); regionLabel();
  };
  canvas.onclick = event => {
    if (!running || !crop) return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX-rect.left)*canvas.width/rect.width;
    const y = (event.clientY-rect.top)*canvas.height/rect.height;
    const {dx,dy,dw,dh,sx,sy,scale} = crop;
    if (x<dx || y<dy || x>dx+dw || y>dy+dh) return;
    const point = {x: clamp((sx+(x-dx)/scale)/source.videoWidth, 0, 1),
      y: clamp((sy+(y-dy)/scale)/source.videoHeight, 0, 1)};
    if (selecting) {
      if (!corner) { corner = point; regionLabel(); return; }
      if (Math.abs(point.x-corner.x)<.05 || Math.abs(point.y-corner.y)<.05) {
        el('region').textContent = 'Escolhe o canto oposto, pelo menos 5% da imagem em cada direção.';
        document.querySelector('.hint').textContent = el('region').textContent;
        return;
      }
      roi = {left: Math.min(point.x,corner.x), right: Math.max(point.x,corner.x),
        top: Math.min(point.y,corner.y), bottom: Math.max(point.y,corner.y)};
      selecting = false; corner = null; crop = null; resetAnalysis(); regionLabel();
    } else { mode(false); wantedX = point.x; wantedY = point.y; }
  };
  for (const [id, suffix] of [['zoom','×'],['smooth','%'],['contrast',''],['area','%']]) {
    el(id).oninput = () => {
      el(id+'Value').textContent = number(Number(el(id).value),2) + suffix;
      if (id === 'contrast' || id === 'area') resetAnalysis();
    };
  }

  function stop() {
    ++session; running = false; cancelAnimationFrame(raf);
    if (callback !== null) source.cancelVideoFrameCallback(callback);
    callback = null; source.pause();
    if (stream) stream.getTracks().forEach(track => track.stop());
    stream = null; source.srcObject = null; source.removeAttribute('src'); source.load();
    if (url) URL.revokeObjectURL(url);
    url = null; crop = null; roi = entire; selecting = false; corner = null;
    viewX = viewY = wantedX = wantedY = .5;
    resetAnalysis(); regionLabel();
    el('state').textContent = '● À ESPERA'; el('resolution').textContent = '16:9';
    el('debug').textContent = 'Abre a câmara ou escolhe um vídeo.';
    el('start').disabled = false;
    el('stop').disabled = el('snapshot').disabled = el('pitch').disabled = true;
    ctx.fillStyle = '#071411'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.textAlign = 'center'; ctx.fillStyle = '#b4fa56'; ctx.font = 'bold 36px system-ui';
    ctx.fillText('FutsalCam AI',480,260);
  }

  function fail(message) {
    stop();
    el('state').textContent = 'FONTE INDISPONÍVEL';
    el('debug').textContent = message;
  }
  async function open(file) {
    stop();
    const id = session;
    el('start').disabled = true; el('stop').disabled = false;
    el('state').textContent = '● A ABRIR';
    try {
      if (file) {
        url = URL.createObjectURL(file); source.loop = true; source.src = url;
      } else {
        if (!navigator.mediaDevices?.getUserMedia) throw Error('Abre a página por HTTPS para usar a câmara.');
        const acquired = await navigator.mediaDevices.getUserMedia({audio:false,
          video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:30,max:30}}});
        if (id !== session) { acquired.getTracks().forEach(track => track.stop()); return; }
        stream = acquired; source.loop = false; source.srcObject = stream;
      }
      source.muted = true; source.playsInline = true;
      await source.play();
      if (id !== session) return;
      running = true; lastDraw = rateStart = performance.now();
      el('state').textContent = file ? '● VÍDEO DE TESTE' : '● CÂMARA ATIVA';
      el('snapshot').disabled = el('pitch').disabled = false;
      el('resolution').textContent = source.videoWidth+'×'+source.videoHeight;
      if (source.requestVideoFrameCallback) callback = source.requestVideoFrameCallback(onFrame);
      raf = requestAnimationFrame(draw);
    } catch (error) {
      if (id === session) fail(error.message + (file ? ' · Experimenta MP4/H.264.' : ' · Verifica a permissão da câmara.'));
    }
  }
  source.addEventListener('error', () => { if (source.error && (stream || url)) fail('Erro de leitura do vídeo. Verifica o formato ou a ligação à câmara.'); });
  el('start').onclick = () => open(null);
  el('stop').onclick = stop;
  el('upload').onchange = event => {
    const file = event.target.files[0]; event.target.value = '';
    if (file) open(file);
  };
  el('fullscreen').onclick = async () => {
    try {
      const enter = canvas.requestFullscreen || canvas.webkitRequestFullscreen;
      if (!enter) throw Error();
      await enter.call(canvas);
    } catch { el('debug').textContent = 'Ecrã inteiro indisponível. Roda o iPhone para horizontal.'; }
  };
  el('snapshot').onclick = () => canvas.toBlob(blob => {
    if (!blob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob); link.download = 'futsalcam-fotografia.png';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 10000);
  }, 'image/png');
  window.addEventListener('pagehide', stop);
  stop();
})();
