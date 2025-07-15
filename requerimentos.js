// --- RAÇAS ---
const racasOvinos = [
  { value: "santaInes", text: "Santa Inês" },
  { value: "moradaNova", text: "Morada Nova" },
  { value: "somalis", text: "Somalis Brasileira" },
  { value: "cruzado", text: "Cruzado" },
  { value: "srd", text: "Sem Raça Definida (SRD)" }
];
const racasCaprinos = [
  { value: "saanen", text: "Saanen" },
  { value: "toggenburg", text: "Toggenburg" },
  { value: "alpina", text: "Alpina" },
  { value: "anglonubiana", text: "Anglo-nubiana" },
  { value: "boer", text: "Boer" },
  { value: "moxoto", text: "Moxotó" },
  { value: "caninde", text: "Canindé" },
  { value: "pardo", text: "Pardo" },
  { value: "srd", text: "Sem Raça Definida (SRD)" }
];

function atualizarRacas() {
  const especie = document.getElementById('especie').value;
  const raca = document.getElementById('raca');
  let racas = especie === "caprino" ? racasCaprinos : racasOvinos;
  raca.innerHTML = "";
  racas.forEach(o => {
    const opt = document.createElement("option");
    opt.value = o.value;
    opt.text = o.text;
    raca.add(opt);
  });
  atualizarFases();
}

// --- FASES ---
function atualizarFases() {
  const categoria = document.getElementById('categoria').value;
  const fase = document.getElementById('fase');
  const opcoes = {
    'naoCastrado': [
      { value: 'crescimento', text: 'Crescimento' },
      { value: 'terminacao', text: 'Terminação' },
      { value: 'mantença', text: 'Mantença' },
      { value: 'reproducao', text: 'Reprodução' }
    ],
    'castrado': [
      { value: 'crescimento', text: 'Crescimento' },
      { value: 'terminacao', text: 'Terminação' },
      { value: 'mantença', text: 'Mantença' }
    ],
    'femea': [
      { value: 'crescimento', text: 'Crescimento' },
      { value: 'terminacao', text: 'Terminação' },
      { value: 'mantença', text: 'Mantença' },
      { value: 'reproducao', text: 'Reprodução' },
      { value: 'lactacao', text: 'Lactação' },
      { value: 'gestacao', text: 'Gestação' }
    ],
    'lactacao': [
      { value: 'lactacao', text: 'Lactação' },
      { value: 'mantença', text: 'Mantença' }
    ],
    'gestante': [
      { value: 'gestacao', text: 'Gestação' },
      { value: 'mantença', text: 'Mantença' }
    ]
  };
  // limpa opções
  while (fase.options.length > 0) fase.remove(0);

  let lista = opcoes[categoria] || opcoes['femea'];
  lista.forEach(o => {
    let opt = document.createElement('option');
    opt.value = o.value;
    opt.text = o.text;
    fase.add(opt);
  });

  // Atualiza campos adicionais
  if (categoria === 'lactacao') {
    document.getElementById('labelDiasLactacao').style.display = 'block';
    document.getElementById('diasLactacao').style.display = 'block';
    document.getElementById('labelLitrosLeite').style.display = 'block';
    document.getElementById('litrosLeite').style.display = 'block';
  } else {
    document.getElementById('labelDiasLactacao').style.display = 'none';
    document.getElementById('diasLactacao').style.display = 'none';
    document.getElementById('labelLitrosLeite').style.display = 'none';
    document.getElementById('litrosLeite').style.display = 'none';
  }
}

document.addEventListener("DOMContentLoaded", function() {
  atualizarRacas();
});

document.getElementById('fase').addEventListener('change', function() {
  const fase = this.value;
  if (fase === 'lactacao') {
    document.getElementById('labelDiasLactacao').style.display = 'block';
    document.getElementById('diasLactacao').style.display = 'block';
    document.getElementById('labelLitrosLeite').style.display = 'block';
    document.getElementById('litrosLeite').style.display = 'block';
  } else {
    document.getElementById('labelDiasLactacao').style.display = 'none';
    document.getElementById('diasLactacao').style.display = 'none';
    document.getElementById('labelLitrosLeite').style.display = 'none';
    document.getElementById('litrosLeite').style.display = 'none';
  }
});

// --- AJUSTES POR RAÇA ---
function getAjustePorRaca(raca, especie) {
  if (especie === "caprino") {
    const ajustes = {
      saanen: 1.00, toggenburg: 1.00, alpina: 1.00, anglonubiana: 1.00, boer: 1.05,
      moxoto: 0.95, caninde: 0.95, pardo: 0.98, srd: 0.97
    };
    return ajustes[raca] || 1.00;
  } else {
    const ajustes = {
      santaInes: 1.00, moradaNova: 0.95, somalis: 0.93, cruzado: 1.05, srd: 0.97
    };
    return ajustes[raca] || 1.00;
  }
}

// --- EQUAÇÕES PARA OVINOS ---
function estimarPCJOvino(pc) {
  return -0.5470 + 0.9313 * pc;
}
function estimarPCVZOvino(pcj) {
  return -1.4944 + 0.8816 * pcj;
}
function estimarGPCVZOvino(gmd) {
  return 0.906 * gmd;
}

// --- EQUAÇÕES PARA CAPRINOS (BR-CAPRINOS E OVINOS) ---
function estimarPCJCaprino(pc) {
  // Caprinos: PCJ = 0,96 × PV (BR-CAPRINOS E OVINOS)
  return 0.96 * pc;
}
function estimarPCVZCaprino(pcj) {
  // Caprinos: PCVZ = 0,85 × PCJ
  return 0.85 * pcj;
}
function estimarGPCVZCaprino(gmd) {
  // Caprinos: GPCVZ = 0,90 × GMD
  return 0.90 * gmd;
}

// --- CONSUMO DE MATÉRIA SECA (CMS) ---
function estimarCMS(pc, gmd, ajuste, categoria, fase, especie) {
  if (especie === "caprino") {
    if (fase === 'mantença') {
      return (70 * Math.pow(pc, 0.75)) * ajuste;
    } else if (fase === 'crescimento') {
      return (95 * Math.pow(pc, 0.75) + 1.5 * gmd * 1000) * ajuste;
    } else if (fase === 'terminacao') {
      return (90 * Math.pow(pc, 0.75) + 2.0 * gmd * 1000) * ajuste;
    } else if (fase === 'lactacao' || categoria === 'lactacao') {
      return (110 * Math.pow(pc, 0.75) + 350) * ajuste;
    } else if (fase === 'gestacao' || categoria === 'gestante') {
      return (75 * Math.pow(pc, 0.75) + 250) * ajuste;
    } else if (fase === 'reproducao') {
      return (75 * Math.pow(pc, 0.75)) * ajuste;
    }
    return (80 * Math.pow(pc, 0.75) + 1.7 * gmd * 1000) * ajuste;
  } else {
    if (fase === 'mantença') {
      return (60 * Math.pow(pc, 0.75)) * ajuste;
    } else if (fase === 'crescimento') {
      return (80 * Math.pow(pc, 0.75) + 1.3 * gmd * 1000) * ajuste;
    } else if (fase === 'terminacao') {
      return (75 * Math.pow(pc, 0.75) + 1.5 * gmd * 1000) * ajuste;
    } else if (fase === 'lactacao' || categoria === 'lactacao') {
      return (100 * Math.pow(pc, 0.75) + 300) * ajuste;
    } else if (fase === 'gestacao' || categoria === 'gestante') {
      return (65 * Math.pow(pc, 0.75) + 200) * ajuste;
    } else if (fase === 'reproducao') {
      return (65 * Math.pow(pc, 0.75)) * ajuste;
    }
    return (70 * Math.pow(pc, 0.75) + 1.4 * gmd * 1000) * ajuste;
  }
}

// --- PROTEÍNA BRUTA (PB) ---
function getPBpercent(fase, categoria, especie) {
  if (fase === 'lactacao' || categoria === 'lactacao')
    return especie === "caprino" ? 0.16 : 0.16;
  if (fase === 'crescimento' || fase === 'terminacao')
    return especie === "caprino" ? 0.15 : 0.14;
  if (fase === 'gestacao' || categoria === 'gestante')
    return especie === "caprino" ? 0.135 : 0.13;
  if (fase === 'mantença' || fase === 'reproducao')
    return especie === "caprino" ? 0.115 : 0.11;
  return especie === "caprino" ? 0.13 : 0.12;
}
function estimarPB(cms, fase, categoria, especie, raca, pc, gmd) {
  // Ovinos deslanados em crescimento
  if (
    especie === "ovino"
    && fase === "crescimento"
    && (
      raca === "santaInes" ||
      raca === "moradaNova" ||
      raca === "somalis" ||
      raca === "srd"
    )
  ) {
    const PBm = 2.82 * Math.pow(pc, 0.75);
    const PBg = 204 * gmd * 1000;
    return PBm + PBg;
  }
  // Caprinos em crescimento (adaptado BR-CAPRINOS E OVINOS)
  if (
    especie === "caprino"
    && fase === "crescimento"
    && (
      raca === "boer" ||
      raca === "moxoto" ||
      raca === "caninde" ||
      raca === "srd" ||
      raca === "pardo"
    )
  ) {
    const PBm = 3.2 * Math.pow(pc, 0.75);
    const PBg = 220 * gmd * 1000;
    return PBm + PBg;
  }
  // Demais casos: percentual do CMS
  const perc = getPBpercent(fase, categoria, especie);
  return cms * perc;
}

// --- ENERGIA ---
function estimarELm(pcvz, fase, especie) {
  if (especie === "caprino") {
    if (fase === 'mantença' || fase === 'reproducao') return 0.069 * Math.pow(pcvz, 0.75);
    if (fase === 'crescimento' || fase === 'terminacao') return 0.075 * Math.pow(pcvz, 0.75);
    if (fase === 'lactacao') return 0.10 * Math.pow(pcvz, 0.75);
    if (fase === 'gestacao') return 0.08 * Math.pow(pcvz, 0.75);
    return 0.07 * Math.pow(pcvz, 0.75);
  } else {
    if (fase === 'mantença' || fase === 'reproducao') return 0.065 * Math.pow(pcvz, 0.75);
    if (fase === 'crescimento' || fase === 'terminacao') return 0.07 * Math.pow(pcvz, 0.75);
    if (fase === 'lactacao') return 0.09 * Math.pow(pcvz, 0.75);
    if (fase === 'gestacao') return 0.08 * Math.pow(pcvz, 0.75);
    return 0.065 * Math.pow(pcvz, 0.75);
  }
}
function estimarEMm(elm) { return elm / 0.64; }
function estimarELg(pcvz, gpcvz, castrado, fase, especie) {
  let expoente = castrado ? 0.8300 : 0.8767;
  let coef = especie === "caprino" ? 0.30 : 0.248;
  if (fase === 'terminacao' || fase === 'crescimento') coef += 0.02;
  return coef * Math.pow(pcvz, 0.75) * Math.pow(gpcvz, expoente);
}
function estimarEMg(elg) { return elg / 0.29; }
function estimarEMT(emm, emg) { return emm + emg; }
function estimarNDT(emt, ajuste, fase, especie) {
  let digest = 0.85;
  if (fase === 'lactacao') digest = especie === "caprino" ? 0.89 : 0.88;
  else if (fase === 'gestacao') digest = 0.84;
  const ed = emt / digest;
  return (ed / 4.409) * ajuste;
}

// --- MINERAIS ---
function estimarCa(pc, pcvz, gpcvz, ajuste, fase, categoria, especie) {
  let mantenCa = especie === "caprino" ? 25.00 * pc / 1000 : 23.70 * pc / 1000;
  let ganhoCa = gpcvz * (especie === "caprino" ? 18.00 * Math.pow(pcvz, -0.15) : 17.04 * Math.pow(pcvz, -0.1652));
  let ca = ((mantenCa + ganhoCa) / 0.543) * ajuste;
  if (fase === 'lactacao' || categoria === 'lactacao') {
    const litrosLeite = parseFloat(document.getElementById('litrosLeite').value) || 0;
    ca += litrosLeite * (especie === "caprino" ? 1.5 : 1.9);
  }
  if (fase === 'gestacao' || categoria === 'gestante') {
    ca *= 1.12;
  }
  return ca;
}
function estimarP(pc, pcvz, gpcvz, ajuste, fase, categoria, especie) {
  let mantenP = especie === "caprino" ? 28.00 * pc / 1000 : 25.33 * pc / 1000;
  let ganhoP = gpcvz * (especie === "caprino" ? 9.8 * Math.pow(pcvz, -0.20) : 9.19 * Math.pow(pcvz, -0.2057));
  let p = ((mantenP + ganhoP) / 0.798) * ajuste;
  if (fase === 'lactacao' || categoria === 'lactacao') {
    const litrosLeite = parseFloat(document.getElementById('litrosLeite').value) || 0;
    p += litrosLeite * (especie === "caprino" ? 1.1 : 1.4);
  }
  if (fase === 'gestacao' || categoria === 'gestante') {
    p *= 1.18;
  }
  return p;
}

function getRecomendacoes(fase, especie) {
  const dados = {
    crescimento: especie === "caprino"
      ? "Acompanhe o GMD e ajuste a dieta para crescimento ósseo e muscular, com proteína e energia adequadas para caprinos."
      : "Acompanhar o GMD e ajustar a dieta para evitar déficit energético. Forneça proteína e energia adequadas para bom desenvolvimento ósseo e muscular.",
    terminacao: especie === "caprino"
      ? "Ofereça dieta de alta energia/proteína para caprinos, controle acidose e forneça fibra efetiva."
      : "Ofereça dieta de alta energia e proteína, controle de acidose ruminal, inclusão de buffers e fibras efetivas.",
    mantença: "Manter exigências mínimas sem excesso de energia, boa oferta de volumoso e monitorar escore corporal.",
    reproducao: "Aporte adequado de minerais (Ca, P, Se, Zn), vitaminas, energia e proteína moderadas. Corrigir escore corporal antes do acasalamento.",
    lactacao: especie === "caprino"
      ? "Caprinos leiteiros: proteína, cálcio e fósforo elevados. Monitorar produção leiteira, boa oferta de água e dieta palatável."
      : "Incrementar proteína, cálcio e fósforo. Monitorar produção leiteira, oferta de água e manter dieta palatável.",
    gestacao: especie === "caprino"
      ? "Caprinas gestantes: dieta com energia/proteína crescentes no último terço, corrigir minerais e evitar subnutrição fetal."
      : "Oferecer dieta com energia e proteína crescente no último terço. Corrigir minerais e vitaminas, evitar subnutrição fetal."
  };
  return dados[fase] || "";
}

// ... (mantém todas as funções JS já fornecidas anteriormente)

function calcularRequerimentos() {
  const especie = document.getElementById('especie').value;
  const raca = document.getElementById('raca').value;
  const pc = parseFloat(document.getElementById('peso').value);
  const gmd = parseFloat(document.getElementById('gmd').value);
  const categoria = document.getElementById('categoria').value;
  const fase = document.getElementById('fase').value;
  const ajuste = getAjustePorRaca(raca, especie);
  const castrado = categoria === 'castrado';

  // Peso em jejum, PCVZ, GPCVZ
  let pcj, pcvz, gpcvz;
  if (especie === "caprino") {
    pcj = estimarPCJCaprino(pc);
    pcvz = estimarPCVZCaprino(pcj);
    gpcvz = estimarGPCVZCaprino(gmd);
  } else {
    pcj = estimarPCJOvino(pc);
    pcvz = estimarPCVZOvino(pcj);
    gpcvz = estimarGPCVZOvino(gmd);
  }

  // Consumo de MS
  const cms = estimarCMS(pc, gmd, ajuste, categoria, fase, especie);

  // -------- AJUSTE DA PROTEÍNA BRUTA (PB) --------
  let pb;
  if (
    especie === "ovino" &&
    (categoria === "naoCastrado" || categoria === "castrado" || categoria === "femea") &&
    (fase === "crescimento" || fase === "terminacao")
  ) {
    // Apenas cordeiros em crescimento/terminação (desmamados)
    const PBm = 2.82 * Math.pow(pc, 0.75);
    const PBg = 204 * gmd * 1000;
    pb = PBm + PBg;
  } else {
    // Todas as demais situações: usa percentual
    const perc = getPBpercent(fase, categoria, especie);
    pb = cms * perc;
  }

  // Energia
  const elm = estimarELm(pcvz, fase, especie);
  const emm = estimarEMm(elm);
  const elg = estimarELg(pcvz, gpcvz, castrado, fase, especie);
  const emg = estimarEMg(elg);
  const emt = estimarEMT(emm, emg);
  const ndt = estimarNDT(emt, ajuste, fase, especie);

  // Minerais
  const ca = estimarCa(pc, pcvz, gpcvz, ajuste, fase, categoria, especie);
  const p = estimarP(pc, pcvz, gpcvz, ajuste, fase, categoria, especie);

  const recomendacao = getRecomendacoes(fase, especie);

  // Ícones profissionais (pode ser substituído por SVG próprios)
  const icons = {
    especie:   especie === "caprino" ? '<i class="bi bi-emoji-smile text-warning"></i>' : '<i class="bi bi-emoji-smile text-success"></i>',
    animal:    '<i class="bi bi-hexagon text-brand"></i>',
    raca:      '<i class="bi bi-award-fill text-info"></i>',
    categoria: '<i class="bi bi-person-badge text-secondary"></i>',
    fase:      '<i class="bi bi-activity text-info"></i>',
    peso:      '<i class="bi bi-bar-chart-line text-secondary"></i>',
    gmd:       '<i class="bi bi-graph-up-arrow text-secondary"></i>',
    cms:       '<i class="bi bi-droplet-half text-brand"></i>',
    pb:        '<i class="bi bi-egg-fried text-warning"></i>',
    ndt:       '<i class="bi bi-lightning-charge text-warning"></i>',
    ca:        '<i class="bi bi-capsule text-primary"></i>',
    p:         '<i class="bi bi-capsule text-info"></i>',
    recomend:  '<i class="bi bi-lightbulb text-brand"></i>',
    pcj:       '<i class="bi bi-arrow-down-short text-info"></i>',
    pcvz:      '<i class="bi bi-arrow-down-short text-success"></i>',
    gpcvz:     '<i class="bi bi-arrow-up-short text-warning"></i>',
  };

  // Cálculo percentual NDT
  const ndtPercent = 100 * ndt * 1000 / cms; // ndt está em kg/dia, transformar p/ g/dia

  document.getElementById('resultados').innerHTML = `
    <div class="col-12">
      <div class="result-card bg-animal mb-2">
        ${icons.animal}
        <div>
          <strong>Espécie:</strong> ${especie === "caprino" ? "Caprino" : "Ovino"}
          <br><strong>Raça:</strong> ${document.getElementById('raca').options[document.getElementById('raca').selectedIndex].text}
        </div>
      </div>
    </div>
    <div class="col-12 col-sm-6">
      <div class="result-card bg-animal mb-2">
        <span class="result-icon">${icons.categoria}</span>
        <div>
          <strong>Categoria:</strong> ${document.getElementById('categoria').options[document.getElementById('categoria').selectedIndex].text}<br>
          <strong>Fase:</strong> ${document.getElementById('fase').options[document.getElementById('fase').selectedIndex].text}
        </div>
      </div>
      <div class="result-card bg-animal mb-2">
        <span class="result-icon">${icons.peso}</span>
        <div>
          <strong>Peso:</strong> ${pc.toFixed(2)} kg<br>
          <strong>GMD:</strong> ${gmd.toFixed(3)} kg/dia
        </div>
      </div>
      <div class="result-card bg-animal mb-2">
        <span class="result-icon">${icons.pcj}</span>
        <div>
          <strong>Peso em jejum (PCJ):</strong> ${pcj.toFixed(2)} kg<br>
          <strong>Corpo vazio (PCVZ):</strong> ${pcvz.toFixed(2)} kg
        </div>
      </div>
      <div class="result-card bg-animal mb-2">
        <span class="result-icon">${icons.gpcvz}</span>
        <div>
          <strong>Ganho corpo vazio:</strong> ${gpcvz.toFixed(3)} kg/dia
        </div>
      </div>
    </div>
    <div class="col-12 col-sm-6">
      <div class="result-card bg-cms mb-2">
        <span class="result-icon">${icons.cms}</span>
        <div>
          <strong>Consumo Matéria Seca (CMS):</strong> ${cms.toFixed(0)} g/dia <br>
          <small>(${((100*(cms/1000))/pc).toFixed(1)}% do PV)</small>
        </div>
      </div>
      <div class="result-card bg-proteina mb-2">
        <span class="result-icon">${icons.pb}</span>
        <div>
          <strong>Proteína Bruta (PB):</strong> ${pb.toFixed(0)} g/dia <br>
          <small>(${(100*pb/cms).toFixed(1)}% da MS)</small>
        </div>
      </div>
      <div class="result-card bg-ndt mb-2">
        <span class="result-icon">${icons.ndt}</span>
        <div>
          <strong>NDT:</strong> ${(ndt*1000).toFixed(0)} g/dia <br>
          <small>(${ndtPercent.toFixed(1)}% da MS)</small>
        </div>
      </div>
      <div class="result-card bg-mineral mb-2">
        <span class="result-icon">${icons.ca}</span>
        <div>
          <strong>Cálcio (Ca):</strong> ${ca.toFixed(2)} g/dia
        </div>
      </div>
      <div class="result-card bg-mineral mb-2">
        <span class="result-icon">${icons.p}</span>
        <div>
          <strong>Fósforo (P):</strong> ${p.toFixed(2)} g/dia
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="result-card bg-recomendacao mb-2">
        <span class="result-icon">${icons.recomend}</span>
        <div>
          <strong>Recomendação:</strong> <br>
          <span>${recomendacao}</span>
        </div>
      </div>
    </div>
  `;
  document.getElementById('resultados').scrollIntoView({behavior:"smooth"});
}


document.addEventListener("DOMContentLoaded", function() {
  // ... seu código de inicialização ...

  function getNutrientesPercentuais() {
  let pbPct = null, ndtPct = null, caPct = null, pPct = null;
  document.querySelectorAll('#resultados .result-card').forEach(card => {
    // PB
    let m = card.innerHTML.match(/Prote[ií]na Bruta.*\(([\d\.,]+)% da MS\)/i);
    if (m) pbPct = parseFloat(m[1].replace(",", "."));
    // NDT
    m = card.innerHTML.match(/NDT:.*\(([\d\.,]+)% da MS\)/i);
    if (m) ndtPct = parseFloat(m[1].replace(",", "."));
    // Ca
    // Para Ca e P, preferencialmente utilize os valores exibidos em g/dia e converta para %MS se desejar.
    // Mas como os campos de limites são para %MS, e os cards não mostram Ca/P em %MS, 
    // é aceitável deixar preenchimento manual se não conseguir encontrar (a função pode ser expandida).
  });
  return {
    pb: pbPct ? pbPct.toFixed(1) : "",
    ndt: ndtPct ? ndtPct.toFixed(1) : "",
    ca: "", // Se quiser implementar cálculo a partir do valor em g/dia e CMS, adapte aqui.
    p:  ""  // Se quiser implementar cálculo a partir do valor em g/dia e CMS, adapte aqui.
  };
}

// Preenche os campos mínimos dos limites da dieta
function preencherLimitesComResultados() {
  const nutrs = getNutrientesPercentuais();
  let pbMin = document.getElementById('pb-min');
  let ndtMin = document.getElementById('ndt-min');
  let caMin = document.getElementById('ca-min');
  let pMin = document.getElementById('p-min');
  if (pbMin && nutrs.pb) { pbMin.value = nutrs.pb; pbMin.style.background="#e7f9ee"; }
  if (ndtMin && nutrs.ndt) { ndtMin.value = nutrs.ndt; ndtMin.style.background="#e7f9ee"; }
  // caMin/pMin: se quiser preencher automaticamente, faça cálculo aqui e preencha.
  // Os campos continuam editáveis para o usuário!
}

// Sincroniza os limites ao mudar para a aba dieta ou ao calcular
document.addEventListener('DOMContentLoaded', function() {
  // Quando a aba dieta for ativada, preenche limites se já houver resultados calculados
  document.querySelector('button#dieta-tab').addEventListener('shown.bs.tab', function () {
    if (document.getElementById('resultados').innerHTML.trim() !== '') {
      preencherLimitesComResultados();
    }
  });
  // Também logo após o cálculo dos requisitos
  let btnCalcReq = document.querySelector('button[onclick*="calcularRequerimentos"]');
  if (btnCalcReq) {
    btnCalcReq.addEventListener('click', function() {
      setTimeout(() => {
        if(document.querySelector('button#dieta-tab').classList.contains('active')) {
          preencherLimitesComResultados();
        }
      }, 300);
    });
  }
});

// --- Mudança: mover seleção de ingredientes e ingredientes selecionados para a nova aba ---
// (No HTML, as seções já estão em outra aba, então só garantir que a inicialização JS rode nas duas abas.)
// Inicialização para garantir que sempre que abrir a aba "Seleção de Ingredientes", as listas sejam renderizadas
document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('button#ingredientes-tab').addEventListener('shown.bs.tab', function () {
    atualizarTabelaIngredientes();
    atualizarSelecaoIngredientes();
  });
});

  // Evento correto do Bootstrap 5 ao mostrar aba
  document.querySelector('button#dieta-tab').addEventListener('shown.bs.tab', function (e) {
    // Checa se cálculo já foi feito
    let resultados = document.getElementById('resultados');
    if (!resultados || resultados.innerHTML.trim() === '') {
      alert('Por favor, calcule primeiro os requisitos nutricionais do animal na primeira aba antes de calcular a dieta!');
      // Volta automaticamente para aba requisitos
      document.querySelector('button#requisitos-tab').click();
      return false;
    }
    // Preenche limites mínimos com valores dos cálculos
    const nutrs = getNutrientesPercentuais();
    let pbMin = document.getElementById('pb-min');
    let ndtMin = document.getElementById('ndt-min');
    let caMin = document.getElementById('ca-min');
    let pMin = document.getElementById('p-min');
    if (pbMin && nutrs.pb) { pbMin.value = nutrs.pb; pbMin.style.background="#e7f9ee"; }
    if (ndtMin && nutrs.ndt) { ndtMin.value = nutrs.ndt; ndtMin.style.background="#e7f9ee"; }
    if (caMin && nutrs.ca) { caMin.value = nutrs.ca; caMin.style.background="#e7f9ee"; }
    if (pMin && nutrs.p) { pMin.value = nutrs.p; pMin.style.background="#e7f9ee"; }
    // Os campos seguem editáveis
  });

  // Também sincroniza logo após cálculo dos requisitos (caso o usuário já esteja na aba dieta)
  let btnCalcReq = document.querySelector('button[onclick*="calcularRequerimentos"]');
  if (btnCalcReq) {
    btnCalcReq.addEventListener('click', function() {
      setTimeout(() => {
        if(document.querySelector('button#dieta-tab').classList.contains('active')) {
          const nutrs = getNutrientesPercentuais();
          let pbMin = document.getElementById('pb-min');
          let ndtMin = document.getElementById('ndt-min');
          let caMin = document.getElementById('ca-min');
          let pMin = document.getElementById('p-min');
          if (pbMin && nutrs.pb) { pbMin.value = nutrs.pb; pbMin.style.background="#e7f9ee"; }
          if (ndtMin && nutrs.ndt) { ndtMin.value = nutrs.ndt; ndtMin.style.background="#e7f9ee"; }
          if (caMin && nutrs.ca) { caMin.value = nutrs.ca; caMin.style.background="#e7f9ee"; }
          if (pMin && nutrs.p) { pMin.value = nutrs.p; pMin.style.background="#e7f9ee"; }
        }
      }, 300);
    });
  }
});
