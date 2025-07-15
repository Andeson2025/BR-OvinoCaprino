// Modelo de cálculo de requerimentos nutricionais para ovinos e caprinos
// Referências principais: BR-OVINOS (2023), BR-CAPRINOS (2021), NRC (2007), meta-análises brasileiras

// --- RAÇAS ---
// Listas de raças para seleção em formulário
const racasOvinos = [
  { value: "santaInes", text: "Santa Inês" },
  { value: "moradaNova", text: "Morada Nova" },
  { value: "somalis", text: "Somalis Brasileira" },
  { value: "cruzado", text: "Cruzado" },
  { value: "dooper", text: "Dooper" },
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

// --- AJUSTES POR RAÇA ---
// Multiplicadores para ajustar exigências conforme raça (BR-OVINOS, BR-CAPRINOS)
function getAjustePorRaca(raca, especie) {
  if (especie === "caprino") {
    // Caprinos: raças leiteiras e de corte possuem ajustes específicos
    const ajustes = {
      saanen: 1.00, toggenburg: 1.00, alpina: 1.00, anglonubiana: 1.00, boer: 1.05,
      moxoto: 0.95, caninde: 0.95, pardo: 0.98, srd: 0.97
    };
    return ajustes[raca] || 1.00;
  } else {
    // Ovinos: raças deslanadas possuem coeficientes diferentes dos lanados
    const ajustes = {
      santaInes: 1.00, moradaNova: 0.95, somalis: 0.93, cruzado: 1.05, dooper: 1.07, srd: 0.97
    };
    return ajustes[raca] || 1.00;
  }
}

// --- FASES ---
// Atualiza as opções de fase conforme categoria selecionada
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
  while (fase.options.length > 0) fase.remove(0);
  let lista = opcoes[categoria] || opcoes['femea'];
  lista.forEach(o => {
    let opt = document.createElement('option');
    opt.value = o.value;
    opt.text = o.text;
    fase.add(opt);
  });

  // Exibe campos adicionais para lactação
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

// --- PREDIÇÃO DE PESO E GANHO ---
// Estimam peso em jejum (PCJ), peso de corpo vazio (PCVZ) e ganho de corpo vazio (GPCVZ)
// Fórmulas obtidas de meta-análises BR-OVINOS/BR-CAPRINOS
function estimarPCJOvino(pc, raca) {
  // Ovinos: PCJ = -0.5470 + 0.9313 * PC (BR-OVINOS 2023)
  return -0.5470 + 0.9313 * pc;
}
function estimarPCVZOvino(pcj, raca) {
  // PCVZ = -1.4944 + 0.8816 * PCJ
  return -1.4944 + 0.8816 * pcj;
}
function estimarGPCVZOvino(gmd, raca) {
  // GPCVZ = 0.906 * GMD
  return 0.906 * gmd;
}
function estimarPCJCaprino(pc) {
  // Caprinos: PCJ = 0.96 * PC
  return 0.96 * pc;
}
function estimarPCVZCaprino(pcj) {
  // PCVZ = 0.85 * PCJ
  return 0.85 * pcj;
}
function estimarGPCVZCaprino(gmd) {
  // GPCVZ = 0.90 * GMD
  return 0.90 * gmd;
}

// --- CMS ---
// Consumo de Matéria Seca (CMS) em gramas/dia
// Fórmulas específicas para espécie, fase e raça
function estimarCMS(pc, gmd, ajuste, categoria, fase, especie, raca) {
  if (especie === "caprino") {
    if (fase === 'mantença') {
      // Caprinos mantença: 70 * PC^0.75
      return (70 * Math.pow(pc, 0.75)) * ajuste;
    } else if (fase === 'crescimento' || fase === 'confinamento') {
      // Caprinos crescimento: 98 * PC^0.75 + 1.8 * GMD * 1000
      let fator = raca === "boer" ? 1.05 : ajuste;
      return (98 * Math.pow(pc, 0.75) + 1.8 * gmd * 1000) * fator;
    } else if (fase === 'terminacao') {
      let fator = raca === "boer" ? 1.05 : ajuste;
      return (92 * Math.pow(pc, 0.75) + 2.2 * gmd * 1000) * fator;
    } else if (fase === 'lactacao' || categoria === 'lactacao') {
      // Lactação: 110 * PC^0.75 + 350
      return (110 * Math.pow(pc, 0.75) + 350) * ajuste;
    } else if (fase === 'gestacao' || categoria === 'gestante') {
      return (75 * Math.pow(pc, 0.75) + 250) * ajuste;
    } else if (fase === 'reproducao') {
      return (75 * Math.pow(pc, 0.75)) * ajuste;
    }
    // Outros casos (default para caprinos)
    return (80 * Math.pow(pc, 0.75) + 1.7 * gmd * 1000) * ajuste;
  } else {
    // Ovinos
    if (raca === "dooper") {
      if (fase === 'crescimento' || fase === 'terminacao') {
        return (98 * Math.pow(pc, 0.75) + 1.8 * gmd * 1000);
      }
      if (fase === 'mantença') {
        return (68 * Math.pow(pc, 0.75));
      }
      if (fase === 'lactacao' || categoria === 'lactacao') {
        return (115 * Math.pow(pc, 0.75) + 350);
      }
      if (fase === 'gestacao' || categoria === 'gestante') {
        return (80 * Math.pow(pc, 0.75) + 250);
      }
      if (fase === 'reproducao') {
        return (68 * Math.pow(pc, 0.75));
      }
      return (90 * Math.pow(pc, 0.75) + 1.5 * gmd * 1000);
    }
    if (fase === 'mantença') {
      return (60 * Math.pow(pc, 0.75)) * ajuste;
    } else if (fase === 'crescimento') {
      return (82 * Math.pow(pc, 0.75) + 1.35 * gmd * 1000) * ajuste;
    } else if (fase === 'confinamento') {
      return (105 * Math.pow(pc, 0.75) + 2.2 * gmd * 1000) * ajuste;
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

// --- PB ---
// Proteína Bruta (PB) calculada como percentual da matéria seca (MS)
// Percentuais obtidos da literatura (BR-OVINOS, BR-CAPRINOS, NRC)
function getPBpercent(fase, categoria, especie, raca) {
  if (fase === 'lactacao' || categoria === 'lactacao')
    return 0.16;
  if (fase === 'crescimento' || fase === 'confinamento' || fase === 'terminacao')
    return especie === "caprino" ? 0.15 : 0.14;
  if (fase === 'gestacao' || categoria === 'gestante')
    return especie === "caprino" ? 0.135 : 0.13;
  if (fase === 'mantença' || fase === 'reproducao')
    return especie === "caprino" ? 0.115 : 0.11;
  return especie === "caprino" ? 0.13 : 0.12;
}
function estimarPB(cms, fase, categoria, especie, raca, pc, gmd) {
  // Lactação: inclui proteína para produção de leite
  const perc = getPBpercent(fase, categoria, especie, raca);
  if (fase === "lactacao") {
    const litrosLeite = parseFloat(document.getElementById('litrosLeite').value) || 0;
    const diasLactacao = parseInt(document.getElementById('diasLactacao')?.value || "0", 10);
    let fator = especie === "caprino" ? (diasLactacao < 90 ? 1.08 : 1.14) : (diasLactacao < 90 ? 1.05 : 1.10);
    const PBlact = litrosLeite * (especie === "caprino" ? 54 : 50) * fator;
    return cms * perc + PBlact;
  }
  // Gestação: acréscimo no último terço
  if (fase === "gestacao") {
    const diasGestacao = parseInt(document.getElementById('diasGestacao')?.value || "0", 10);
    let fator = 1.0;
    if (diasGestacao >= 100) fator = especie === "caprino" ? 1.12 : 1.10;
    return cms * perc * fator;
  }
  return cms * perc;
}

// --- ENERGIA ---
// Energia líquida de mantença e ganho, valores de BR-OVINOS/BR-CAPRINOS/NRC
function estimarELm(pcvz, fase, especie, raca) {
  if (especie === "caprino") {
    if (fase === 'mantença' || fase === 'reproducao') return 0.070 * Math.pow(pcvz, 0.75);
    if (fase === 'crescimento' || fase === 'confinamento') return 0.078 * Math.pow(pcvz, 0.75);
    if (fase === 'terminacao') return 0.083 * Math.pow(pcvz, 0.75);
    if (fase === 'lactacao') return 0.11 * Math.pow(pcvz, 0.75);
    if (fase === 'gestacao') return 0.09 * Math.pow(pcvz, 0.75);
    return 0.07 * Math.pow(pcvz, 0.75);
  } else {
    let fator = (raca === "dooper") ? 1.10 : 1.00;
    if (fase === 'mantença' || fase === 'reproducao') return 0.065 * Math.pow(pcvz, 0.75) * fator;
    if (fase === 'crescimento' || fase === 'confinamento') return 0.077 * Math.pow(pcvz, 0.75) * fator;
    if (fase === 'terminacao') return 0.081 * Math.pow(pcvz, 0.75) * fator;
    if (fase === 'lactacao') return 0.097 * Math.pow(pcvz, 0.75) * fator;
    if (fase === 'gestacao') return 0.089 * Math.pow(pcvz, 0.75) * fator;
    return 0.065 * Math.pow(pcvz, 0.75) * fator;
  }
}
function estimarEMm(elm) { return elm / 0.63; }
function estimarELg(pcvz, gpcvz, castrado, fase, especie, raca) {
  let expoente = castrado ? 0.830 : 0.877;
  let coef = especie === "caprino" ? 0.31 : 0.26;
  if (raca === "dooper") coef = 0.28;
  if (fase === 'terminacao' || fase === 'crescimento' || fase === 'confinamento') coef += 0.03;
  return coef * Math.pow(pcvz, 0.75) * Math.pow(gpcvz, expoente);
}
function estimarEMg(elg) { return elg / 0.29; }
function estimarEMT(emm, emg) { return emm + emg; }
function estimarNDT(emt, ajuste, fase, especie, raca) {
  let digest = 0.85;
  if (fase === 'lactacao') digest = especie === "caprino" ? 0.89 : 0.88;
  else if (fase === 'gestacao') digest = 0.84;
  if (raca === "dooper") digest = 0.87;
  const ed = emt / digest;
  return (ed / 4.409) * ajuste;
}

// --- MINERAIS ---
// Modelos BR-OVINOS, BR-CAPRINOS, NRC
function estimarMinerais(pc, pcvz, gpcvz, ajuste, fase, categoria, especie, raca, litrosLeite = 0, diasGestacao = 0) {
  // Mantém e ganho para cálcio e fósforo, mais ajustes para lactação/gestação
  let mantenCa, ganhoCa, mantenP, ganhoP;
  if (especie === "caprino") {
    mantenCa = 25.00 * pc / 1000;
    ganhoCa = gpcvz * (18.00 * Math.pow(pcvz, -0.15));
    mantenP = 28.00 * pc / 1000;
    ganhoP = gpcvz * (9.8 * Math.pow(pcvz, -0.20));
  } else {
    mantenCa = (raca === "dooper" ? 25.50 : 23.70) * pc / 1000;
    ganhoCa = gpcvz * ((raca === "dooper" ? 18.40 : 17.04) * Math.pow(pcvz, -0.1652));
    mantenP = (raca === "dooper" ? 27.80 : 25.33) * pc / 1000;
    ganhoP = gpcvz * ((raca === "dooper" ? 10.3 : 9.19) * Math.pow(pcvz, -0.2057));
  }
  let ca = ((mantenCa + ganhoCa) / 0.543) * ajuste;
  let p  = ((mantenP + ganhoP) / 0.798) * ajuste;
  if (fase === 'lactacao' || categoria === 'lactacao') {
    ca += litrosLeite * (especie === "caprino" ? 1.5 : 2.0);
    p  += litrosLeite * (especie === "caprino" ? 1.1 : 1.6);
  }
  if (fase === 'gestacao' || categoria === 'gestante') {
    ca *= especie === "caprino" ? 1.12 : 1.10;
    p  *= especie === "caprino" ? 1.18 : 1.12;
  }
  // Minerais secundários: valores típicos por kg peso vivo (NRC, BR-OVINOS)
  const mg = fase === 'mantença' ? 0.10 * pc : 0.13 * pc;
  const k  = 1.0 * pc;
  const s  = 0.18 * pc;
  const na = 0.20 * pc;
  const cl = 0.25 * pc;
  const zn = (fase === 'mantença' ? 0.06 : 0.08) * pc;
  const cu = 0.02 * pc;
  const se = 0.0003 * pc;
  const mn = 0.04 * pc;
  const i  = 0.0007 * pc;
  const co = 0.0001 * pc;
  return { ca, p, mg, k, s, na, cl, zn, cu, se, mn, i, co };
}

// --- VITAMINAS ---
// Vitaminas principais (BR-OVINOS, NRC)
function estimarVitaminas(pc, fase) {
  return {
    vitA: (fase === 'mantença' ? 40 : 60) * pc,
    vitD: 7.5 * pc,
    vitE: 1.5 * pc,
    vitB1: 0.2 * pc,
    vitB2: 0.3 * pc,
    vitB6: 0.15 * pc,
    vitB12: 0.0005 * pc,
    niacina: 0.5 * pc,
    acidoFolico: 0.02 * pc,
    biotina: 0.01 * pc,
    pantotenato: 0.10 * pc
  };
}

// --- FRAÇÕES FIBROSAS E EXTRATO ETERO (EE) ---
// Percentuais médios por categoria (BR-OVINOS/BR-CAPRINOS/NRC)
function estimarFracoesFibrosasEE(cms, pb) {
  const fdn = cms * 0.30; // Fibra em detergente neutro
  const fda = cms * 0.19; // Fibra em detergente ácido
  const ee  = cms * 0.04; // Extrato etéreo (lipídeos)
  const cnf = cms - (fdn + fda + pb + ee); // Carboidratos não fibrosos
  return { fdn, fda, ee, cnf };
}

// --- RECOMENDAÇÕES ---
// Sugestões baseadas em literatura e experiência prática
function getRecomendacoes(fase, especie, raca) {
  const dados = {
    confinamento: "Confinamento: controle de acidose, fibra efetiva, proteína acima de 15% da MS, minerais e vitaminas balanceados.",
    crescimento: especie === "caprino"
      ? "Acompanhe o GMD e ajuste a dieta para crescimento ósseo e muscular, com proteína e energia adequadas para caprinos."
      : (raca === "dooper"
          ? "Dieta de crescimento exige proteína e energia acima da média. Use volumoso de alta qualidade e ajuste a oferta conforme escore corporal."
          : "Acompanhar o GMD e ajustar a dieta para evitar déficit energético. Forneça proteína e energia adequadas para bom desenvolvimento ósseo e muscular."),
    terminacao: especie === "caprino"
      ? "Ofereça dieta de alta energia/proteína para caprinos, controle acidose e forneça fibra efetiva."
      : (raca === "dooper"
          ? "Dieta de terminação requer energia alta, proteína >15%. Controle acidose e forneça volumoso estruturado."
          : "Ofereça dieta de alta energia e proteína, controle de acidose ruminal, inclusão de buffers e fibras efetivas."),
    mantença: "Manter exigências mínimas sem excesso de energia, boa oferta de volumoso e monitorar escore corporal.",
    reproducao: "Aporte adequado de minerais (Ca, P, Se, Zn), vitaminas, energia e proteína moderadas. Corrigir escore corporal antes do acasalamento.",
    lactacao: especie === "caprino"
      ? "Caprinos leiteiros: proteína, cálcio e fósforo elevados. Monitorar produção leiteira, boa oferta de água e dieta palatável."
      : (raca === "dooper"
          ? "Dieta de lactação com proteína >16%, Ca/P ajustados. Monitorar produção, água e conforto térmico."
          : "Incrementar proteína, cálcio e fósforo. Monitorar produção leiteira, oferta de água e manter dieta palatável."),
    gestacao: especie === "caprino"
      ? "Caprinas gestantes: dieta com energia/proteína crescentes no último terço, corrigir minerais e evitar subnutrição fetal."
      : (raca === "dooper"
          ? "Dieta gestação com energia e proteína crescentes no último terço, corrigir minerais e evitar subnutrição fetal."
          : "Oferecer dieta com energia e proteína crescente no último terço. Corrigir minerais e vitaminas, evitar subnutrição fetal.")
  };
  return dados[fase] || dados[raca] || "";
}

// --- TABELAS DE REQUERIMENTOS ---
function tabelaMinerais(minerais) {
  // Retorna HTML com tabela de minerais
  return `
  <table class="table table-sm table-bordered">
    <caption>Requerimentos de Minerais (g/dia)</caption>
    <thead><tr>
      <th>Mineral</th>
      <th>Quantidade</th>
    </tr></thead>
    <tbody>
      <tr><td>Cálcio (Ca)</td><td>${minerais.ca.toFixed(2)}</td></tr>
      <tr><td>Fósforo (P)</td><td>${minerais.p.toFixed(2)}</td></tr>
      <tr><td>Magnésio (Mg)</td><td>${minerais.mg.toFixed(2)}</td></tr>
      <tr><td>Potássio (K)</td><td>${minerais.k.toFixed(2)}</td></tr>
      <tr><td>Enxofre (S)</td><td>${minerais.s.toFixed(2)}</td></tr>
      <tr><td>Sódio (Na)</td><td>${minerais.na.toFixed(2)}</td></tr>
      <tr><td>Cloro (Cl)</td><td>${minerais.cl.toFixed(2)}</td></tr>
      <tr><td>Zinco (Zn)</td><td>${minerais.zn.toFixed(2)}</td></tr>
      <tr><td>Cobre (Cu)</td><td>${minerais.cu.toFixed(2)}</td></tr>
      <tr><td>Selênio (Se)</td><td>${minerais.se.toFixed(4)}</td></tr>
      <tr><td>Manganês (Mn)</td><td>${minerais.mn.toFixed(2)}</td></tr>
      <tr><td>Iodo (I)</td><td>${minerais.i.toFixed(4)}</td></tr>
      <tr><td>Cobalto (Co)</td><td>${minerais.co.toFixed(4)}</td></tr>
    </tbody>
  </table>
  `;
}
function tabelaFracoes(frafibe) {
  // Retorna HTML com tabela de frações fibrosas e EE
  return `
  <table class="table table-sm table-bordered">
    <caption>Frações Fibrosas e Extrato Etéreo (g/dia)</caption>
    <thead><tr>
      <th>Fração</th>
      <th>Quantidade</th>
    </tr></thead>
    <tbody>
      <tr><td>FDN</td><td>${frafibe.fdn.toFixed(0)}</td></tr>
      <tr><td>FDA</td><td>${frafibe.fda.toFixed(0)}</td></tr>
      <tr><td>Extrato Etéreo (EE)</td><td>${frafibe.ee.toFixed(0)}</td></tr>
      <tr><td>Carboidratos Não Fibrosos (CNF)</td><td>${frafibe.cnf.toFixed(0)}</td></tr>
    </tbody>
  </table>
  `;
}
function tabelaVitaminas(vitaminas) {
  // Retorna HTML com tabela de vitaminas
  return `
  <table class="table table-sm table-bordered">
    <caption>Requerimentos de Vitaminas</caption>
    <thead><tr>
      <th>Vitamina</th>
      <th>Quantidade</th>
    </tr></thead>
    <tbody>
      <tr><td>Vitamina A (UI/dia)</td><td>${vitaminas.vitA.toFixed(0)}</td></tr>
      <tr><td>Vitamina D (UI/dia)</td><td>${vitaminas.vitD.toFixed(0)}</td></tr>
      <tr><td>Vitamina E (UI/dia)</td><td>${vitaminas.vitE.toFixed(0)}</td></tr>
      <tr><td>B1 (mg/dia)</td><td>${vitaminas.vitB1.toFixed(2)}</td></tr>
      <tr><td>B2 (mg/dia)</td><td>${vitaminas.vitB2.toFixed(2)}</td></tr>
      <tr><td>B6 (mg/dia)</td><td>${vitaminas.vitB6.toFixed(2)}</td></tr>
      <tr><td>B12 (mg/dia)</td><td>${vitaminas.vitB12.toFixed(4)}</td></tr>
      <tr><td>Niacina (mg/dia)</td><td>${vitaminas.niacina.toFixed(2)}</td></tr>
      <tr><td>Ácido Fólico (mg/dia)</td><td>${vitaminas.acidoFolico.toFixed(2)}</td></tr>
      <tr><td>Biotina (mg/dia)</td><td>${vitaminas.biotina.toFixed(2)}</td></tr>
      <tr><td>Pantotenato (mg/dia)</td><td>${vitaminas.pantotenato.toFixed(2)}</td></tr>
    </tbody>
  </table>
  `;
}

// --- CALCULAR REQUERIMENTOS ---
// Função principal que calcula e exibe os resultados
function calcularRequerimentos() {
  const especie = document.getElementById('especie').value;
  const raca = document.getElementById('raca').value;
  const pc = parseFloat(document.getElementById('peso').value);
  const gmd = parseFloat(document.getElementById('gmd').value);
  const categoria = document.getElementById('categoria').value;
  const fase = document.getElementById('fase').value;
  const ajuste = getAjustePorRaca(raca, especie);
  const castrado = categoria === 'castrado';
  const litrosLeite = parseFloat(document.getElementById('litrosLeite')?.value || "0");
  const diasLactacao = parseInt(document.getElementById('diasLactacao')?.value || "0", 10);
  const diasGestacao = parseInt(document.getElementById('diasGestacao')?.value || "0", 10);

  // Cálculos de peso e ganho
  let pcj, pcvz, gpcvz;
  if (especie === "caprino") {
    pcj = estimarPCJCaprino(pc);
    pcvz = estimarPCVZCaprino(pcj);
    gpcvz = estimarGPCVZCaprino(gmd);
  } else {
    pcj = estimarPCJOvino(pc, raca);
    pcvz = estimarPCVZOvino(pcj, raca);
    gpcvz = estimarGPCVZOvino(gmd, raca);
  }

  // Consumo de matéria seca
  const cms = estimarCMS(pc, gmd, ajuste, categoria, fase, especie, raca);

  // Proteína bruta
  const pb = estimarPB(cms, fase, categoria, especie, raca, pc, gmd);

  // Energia
  const elm = estimarELm(pcvz, fase, especie, raca);
  const emm = estimarEMm(elm);
  const elg = estimarELg(pcvz, gpcvz, castrado, fase, especie, raca);
  const emg = estimarEMg(elg);
  const emt = estimarEMT(emm, emg);
  const ndt = estimarNDT(emt, ajuste, fase, especie, raca);

  // Minerais, vitaminas, frações fibrosas
  const minerais = estimarMinerais(pc, pcvz, gpcvz, ajuste, fase, categoria, especie, raca, litrosLeite, diasGestacao);
  const vitaminas = estimarVitaminas(pc, fase);
  const frafibe = estimarFracoesFibrosasEE(cms, pb);

  const recomendacao = getRecomendacoes(fase, especie, raca);
  const ndtPercent = 100 * ndt * 1000 / cms;

  // Exibe os resultados, incluindo tabelas
  document.getElementById('resultados').innerHTML = `
    <div class="col-12">
      <div class="result-card bg-animal mb-2">
        <i class="bi bi-hexagon text-brand"></i>
        <div>
          <strong>Espécie:</strong> ${especie === "caprino" ? "Caprino" : "Ovino"}
          <br><strong>Raça:</strong> ${document.getElementById('raca').options[document.getElementById('raca').selectedIndex].text}
        </div>
      </div>
    </div>
    <div class="col-12 col-sm-6">
      <div class="result-card bg-animal mb-2">
        <span class="result-icon"><i class="bi bi-person-badge text-secondary"></i></span>
        <div>
          <strong>Categoria:</strong> ${document.getElementById('categoria').options[document.getElementById('categoria').selectedIndex].text}<br>
          <strong>Fase:</strong> ${document.getElementById('fase').options[document.getElementById('fase').selectedIndex].text}
        </div>
      </div>
      <div class="result-card bg-animal mb-2">
        <span class="result-icon"><i class="bi bi-bar-chart-line text-secondary"></i></span>
        <div>
          <strong>Peso:</strong> ${pc.toFixed(2)} kg<br>
          <strong>GMD:</strong> ${gmd.toFixed(3)} kg/dia
        </div>
      </div>
      <div class="result-card bg-animal mb-2">
        <span class="result-icon"><i class="bi bi-arrow-down-short text-info"></i></span>
        <div>
          <strong>Peso em jejum (PCJ):</strong> ${pcj.toFixed(2)} kg<br>
          <strong>Corpo vazio (PCVZ):</strong> ${pcvz.toFixed(2)} kg
        </div>
      </div>
      <div class="result-card bg-animal mb-2">
        <span class="result-icon"><i class="bi bi-arrow-up-short text-warning"></i></span>
        <div>
          <strong>Ganho corpo vazio:</strong> ${gpcvz.toFixed(3)} kg/dia
        </div>
      </div>
       <div class="result-card bg-mineral mb-2">
        ${tabelaMinerais(minerais)}
      </div>
    </div>
    <div class="col-12 col-sm-6">
      <div class="result-card bg-cms mb-2">
        <span class="result-icon"><i class="bi bi-droplet-half text-brand"></i></span>
        <div>
          <strong>Consumo Matéria Seca (CMS):</strong> ${cms.toFixed(0)} g/dia <br>
          <small>(${((100*(cms/1000))/pc).toFixed(1)}% do PV)</small>
        </div>
      </div>
      <div class="result-card bg-proteina mb-2">
        <span class="result-icon"><i class="bi bi-egg-fried text-warning"></i></span>
        <div>
          <strong>Proteína Bruta (PB):</strong> ${pb.toFixed(0)} g/dia <br>
          <small>(${(100*pb/cms).toFixed(1)}% da MS)</small>
        </div>
      </div>
      <div class="result-card bg-ndt mb-2">
        <span class="result-icon"><i class="bi bi-lightning-charge text-warning"></i></span>
        <div>
          <strong>NDT:</strong> ${(ndt*1000).toFixed(0)} g/dia <br>
          <small>(${ndtPercent.toFixed(1)}% da MS)</small>
        </div>
      </div>
     


      <div class="result-card bg-vitamina mb-2">
        ${tabelaVitaminas(vitaminas)}
      </div>
      <div class="result-card bg-fibra mb-2">
        ${tabelaFracoes(frafibe)}
      </div>
    </div>
    <div class="col-12">
      <div class="result-card bg-recomendacao mb-2">
        <span class="result-icon"><i class="bi bi-lightbulb text-brand"></i></span>
        <div>
          <strong>Recomendação:</strong> <br>
          <span>${recomendacao}</span>
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="mt-2"><small>
        <strong>Referências:</strong> BR-OVINOS (2023), BR-CAPRINOS (2021), NRC (2007), meta-análises nacionais.<br>
        Cálculos e percentuais ajustados conforme espécie, raça, categoria e fase fisiológica.
      </small></div>
    </div>
  `;
  document.getElementById('resultados').scrollIntoView({behavior:"smooth"});
}

// --- ATUALIZAR RAÇAS (INICIALIZAÇÃO) ---
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
// Mantenha os mesmos blocos de sincronização e inicialização dos percentuais da dieta, ingredientes, etc.
// ... (restante do script permanece igual, apenas as funções de cálculo foram refinadas)


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

// --- Ingredientes padrão (20 exemplos, valores fictícios didáticos) ---
const INGREDIENTES_PADRAO = [
  {nome:'Feno de Tifton', tipo:'Volumoso', custo:1.2, ms:87, pb:10, ndt:55, ca:0.45, p:0.25, pdr:7},
  {nome:'Feno de Coast-cross', tipo:'Volumoso', custo:1.1, ms:88, pb:8, ndt:52, ca:0.4, p:0.22, pdr:6},
  {nome:'Silagem de Milho', tipo:'Volumoso', custo:0.7, ms:31.2, pb:7.1, ndt:64.8, ca:0.25, p:0.22, pdr:5.1},
  {nome:'Silagem de Sorgo', tipo:'Volumoso', custo:0.68, ms:32, pb:6.5, ndt:58, ca:0.22, p:0.19, pdr:5},
  {nome:'Cana-de-açúcar', tipo:'Volumoso', custo:0.6, ms:30, pb:3, ndt:60, ca:0.15, p:0.09, pdr:5},
  {nome:'Casca de soja', tipo:'Volumoso', custo:1.7, ms:90, pb:12, ndt:74, ca:0.6, p:0.22, pdr:6},
  {nome:'Palha de arroz', tipo:'Volumoso', custo:0.8, ms:89, pb:4.5, ndt:40, ca:0.3, p:0.13, pdr:5},
  {nome:'Polpa cítrica', tipo:'Volumoso', custo:1.2, ms:88, pb:7, ndt:78, ca:1.1, p:0.12, pdr:5},
  {nome:'Capim Elefante', tipo:'Volumoso', custo:0.5, ms:22, pb:8, ndt:52, ca:0.33, p:0.16, pdr:6},
  {nome:'Alfafa', tipo:'Volumoso', custo:2.0, ms:87, pb:18, ndt:58, ca:1.5, p:0.3, pdr:7},
  {nome:'Milho moído', tipo:'Concentrado', custo:1.6, ms:88, pb:8.5, ndt:89, ca:0.03, p:0.32, pdr:5},
  {nome:'Farelo de soja', tipo:'Concentrado', custo:2.7, ms:89, pb:46, ndt:82, ca:0.29, p:0.65, pdr:6},
  {nome:'Farelo de algodão', tipo:'Concentrado', custo:2.5, ms:90, pb:28, ndt:77, ca:0.17, p:1.13, pdr:6},
  {nome:'Farelo de trigo', tipo:'Concentrado', custo:2.0, ms:89, pb:16, ndt:75, ca:0.15, p:1.17, pdr:6},
  {nome:'Farelo de arroz', tipo:'Concentrado', custo:1.9, ms:90, pb:13, ndt:73, ca:0.09, p:1.23, pdr:6},
  {nome:'Casca de algodão', tipo:'Concentrado', custo:1.3, ms:89, pb:12, ndt:45, ca:0.12, p:0.18, pdr:6},
  {nome:'Ureia pecuária', tipo:'Concentrado', custo:4.5, ms:100, pb:281, ndt:0, ca:0, p:0, pdr:100},
  {nome:'Torta de girassol', tipo:'Concentrado', custo:2.7, ms:90, pb:28, ndt:76, ca:0.38, p:1.2, pdr:4},
  {nome:'Grão de sorgo', tipo:'Concentrado', custo:1.5, ms:89, pb:10, ndt:85, ca:0.07, p:0.34, pdr:6},
  {nome:'Mineral Ovinos', tipo:'Concentrado', custo:4.0, ms:100, pb:0, ndt:0, ca:21, p:6, pdr:0},
  {nome:'Sal Comum', tipo:'Concentrado', custo:1.0, ms:99, pb:0, ndt:0, ca:0, p:0, pdr:0},
  {nome:'Calcário', tipo:'Concentrado', custo:0.6, ms:100, pb:0, ndt:0, ca:38, p:0, pdr:0},
  {nome:'Calcário Calcítico', tipo:'Concentrado', custo:1.0, ms:100, pb:0, ndt:0, ca:34, p:0, pdr:0},
  {nome:'Calcário Dolomítico', tipo:'Concentrado', custo:1.0, ms:100, pb:0, ndt:0, ca:20, p:0, pdr:0},
  {nome:'Fosfato bicálcico', tipo:'Concentrado', custo:1.0, ms:100, pb:0, ndt:0, ca:23, p:18, pdr:0},


  // Tabela 28 - Alimentos para ovinos (com PDR real ou estimado)

{nome:'Arroz farelo desengordurado', tipo:'Concentrado', custo:1.2, ms:88.2, pb:16.8, ndt:24.9, ca:0.09, p:1.8, pdr:5}, // PDR estimado
{nome:'Arroz farelo desfinitizado', tipo:'Concentrado', custo:1.2, ms:90.8, pb:18.0, ndt:0, ca:0.31, p:2.04, pdr:5}, // PDR estimado
{nome:'Arroz farelo integral', tipo:'Concentrado', custo:1.2, ms:88.9, pb:13.4, ndt:87.5, ca:0.11, p:1.73, pdr:5}, // PDR estimado
{nome:'Milho grão/fubá', tipo:'Concentrado', custo:1.6, ms:88, pb:9, ndt:87.7, ca:0.03, p:0.26, pdr:4.6}, // PDR estimado
{nome:'Farelo de soja', tipo:'Concentrado', custo:2.0, ms:87, pb:45, ndt:73, ca:0.3, p:0.61, pdr:78.5}, // PDR real
{nome:'Farelo de algodão 38 PB', tipo:'Concentrado', custo:1.8, ms:89.7, pb:38, ndt:65.6, ca:0.24, p:0.97, pdr:76}, // PDR real
{nome:'Farelo de amendoim', tipo:'Concentrado', custo:2.1, ms:89.4, pb:56, ndt:89.5, ca:0.18, p:0.62, pdr:27.8}, // PDR real
{nome:'Farelo de girassol', tipo:'Concentrado', custo:1.8, ms:90.2, pb:31.4, ndt:71.1, ca:0.3, p:0.9, pdr:45.6}, // PDR real
{nome:'Milho glúten farelo', tipo:'Concentrado', custo:2.4, ms:60, pb:90.6, ndt:83.9, ca:0.05, p:0.44, pdr:83}, // PDR real
{nome:'Milho silagem grão úmido', tipo:'Volumoso', custo:0.7, ms:66.7, pb:9.2, ndt:88.2, ca:0.03, p:0.25, pdr:25}, // PDR real
{nome:'Silagem de capim-elefante', tipo:'Volumoso', custo:0.4, ms:27.5, pb:5.5, ndt:50, ca:0.31, p:0.2, pdr:36}, // PDR real
{nome:'Cana-de-açúcar', tipo:'Volumoso', custo:0.3, ms:28.9, pb:2.8, ndt:64.5, ca:0.24, p:0.08, pdr:41}, // PDR real
{nome:'Alfafa feno', tipo:'Volumoso', custo:2.0, ms:85.8, pb:18.7, ndt:66.4, ca:1.17, p:0.33, pdr:4}, // PDR estimado
{nome:'Aveia feno', tipo:'Volumoso', custo:1.5, ms:90, pb:10, ndt:54, ca:0.4, p:0.27, pdr:4}, // PDR estimado
{nome:'Trevo feno', tipo:'Volumoso', custo:1.8, ms:89, pb:16, ndt:57, ca:1.73, p:0.24, pdr:4}, // PDR estimado
{nome:'Sorgo grão', tipo:'Concentrado', custo:1.4, ms:88, pb:9.3, ndt:84.4, ca:0.07, p:0.29, pdr:5}, // PDR estimado
{nome:'Polpa cítrica', tipo:'Concentrado', custo:1.3, ms:88.4, pb:6.9, ndt:78.3, ca:1.8, p:0.13, pdr:5}, // PDR estimado
{nome:'Capim tifton 85 feno', tipo:'Volumoso', custo:1.4, ms:88, pb:9.9, ndt:57.7, ca:0.33, p:0.27, pdr:4}, // PDR estimado
{nome:'Capim mombaça', tipo:'Volumoso', custo:1.2, ms:27, pb:11, ndt:53, ca:0.74, p:0.19, pdr:4}, // PDR estimado
{nome:'Capim elefante', tipo:'Volumoso', custo:1.1, ms:21.7, pb:7, ndt:50, ca:0.36, p:0.23, pdr:4}, // PDR estimado
{nome:'Aveia grão', tipo:'Concentrado', custo:1.6, ms:90.4, pb:14.6, ndt:83.3, ca:0.13, p:0.35, pdr:5}, // PDR estimado
{nome:'Cevada grão', tipo:'Concentrado', custo:1.5, ms:89.9, pb:12.4, ndt:76.8, ca:0.05, p:0.37, pdr:5}, // PDR estimado
{nome:'Trigo farelo', tipo:'Concentrado', custo:1.6, ms:87.6, pb:16.7, ndt:77.3, ca:0.17, p:1.01, pdr:5}, // PDR estimado
{nome:'Cacau farelo', tipo:'Concentrado', custo:2.5, ms:88.8, pb:15.9, ndt:64.5, ca:0.74, p:0.5, pdr:5}, // PDR estimado
{nome:'Capim elefante colmo', tipo:'Volumoso', custo:0.7, ms:22, pb:5.8, ndt:55.9, ca:0, p:0, pdr:4}, // PDR estimado
{nome:'Capim coast cross feno', tipo:'Volumoso', custo:1.2, ms:87, pb:10.5, ndt:53, ca:0.27, p:0.38, pdr:4}, // PDR estimado
{nome:'Capim massai (61-90 dias)', tipo:'Volumoso', custo:1.1, ms:29.5, pb:8, ndt:51.6, ca:0, p:0, pdr:4}, // PDR estimado
{nome:'Capim tanzânia', tipo:'Volumoso', custo:1.3, ms:23.4, pb:9.5, ndt:51, ca:0.59, p:0.14, pdr:4}, // PDR estimado
{nome:'Leucena feno', tipo:'Volumoso', custo:2.0, ms:91, pb:21, ndt:55, ca:1.18, p:0.29, pdr:4}, // PDR estimado
{nome:'Maniçoba feno', tipo:'Volumoso', custo:1.5, ms:86, pb:12, ndt:56.2, ca:0, p:0, pdr:4}, // PDR estimado

// Tabela 28 - Concentrados proteicos

  { nome: 'Algodão caroço', tipo: 'Concentrado', custo: 1.87, ms: 90.6, pb: 23.1, ndt: 88.2, ca: 0.27, p: 0.75, pdr: 21.6 },
  { nome: 'Algodão farelo 28', tipo: 'Concentrado', custo: 1.87, ms: 89.8, pb: 28, ndt: 68.1, ca: 0.26, p: 0.77, pdr: 30 }, 
  { nome: 'Algodão farelo 38', tipo: 'Concentrado', custo: 2.20, ms: 89.7, pb: 38, ndt: 65.6, ca: 0.24, p: 0.97, pdr: 16 },
  { nome: 'Algodão farelo 42', tipo: 'Concentrado', custo: 2.20, ms: 90.5, pb: 42, ndt: 69.8, ca: 0.22, p: 0.96, pdr: 16 },
  { nome: 'Algodão torta', tipo: 'Concentrado', custo: 2.40, ms: 90.4, pb: 29.6, ndt: 81.9, ca: 0.28, p: 0.58, pdr: 23.7 },
  { nome: 'Amendoim farelo', tipo: 'Concentrado', custo: 0.3, ms: 89.4, pb: 56, ndt: 89.5, ca: 0.18, p: 0.62, pdr: 90 },
  { nome: 'Amiréia (ureia)', tipo: 'Concentrado', custo: 3.0, ms: 90.6, pb: 200, ndt: 22, ca: 0.12, p: 0.08, pdr: 90 },
  { nome: 'Babaçu farelo', tipo: 'Concentrado', custo: 0.7, ms: 90, pb: 20.6, ndt: 71.9, ca: 0.13, p: 0.36, pdr: 4 },
  { nome: 'Babaçu torta', tipo: 'Concentrado', custo: 1.2, ms: 90.8, pb: 19.3, ndt: 78, ca: 0.15, p: 0.69, pdr: 4 },
  { nome: 'Crambe farelo', tipo: 'Concentrado', custo: 0, ms: 89.1, pb: 35.9, ndt: 73.9, ca: 0.29, p: 0.47, pdr: 4 },
  { nome: 'Canola farelo', tipo: 'Concentrado', custo: 0, ms: 89.4, pb: 40.1, ndt: 83.4, ca: 0.62, p: 0.82, pdr: 4 },
  { nome: 'Colza farelo', tipo: 'Concentrado', custo: 0, ms: 91.2, pb: 40, ndt: 0, ca: 0.65, p: 1.34, pdr: 50 },
  { nome: 'Feijão moído', tipo: 'Concentrado', custo: 0, ms: 89.6, pb: 24.2, ndt: 80.8, ca: 0.54, p: 0.43, pdr: 3 },
  { nome: 'Girassol farelo', tipo: 'Concentrado', custo: 0, ms: 90.2, pb: 31.4, ndt: 71.1, ca: 0.3, p: 0.9, pdr: 4},
  { nome: 'Linhaça farelo', tipo: 'Concentrado', custo: 0, ms: 92, pb: 34, ndt: 0, ca: 0.6, p: 0.6, pdr: 4 },
  { nome: 'Mamona farelo detoxificado', tipo: 'Concentrado', custo: 0.9, ms: 89.2, pb: 38.1, ndt: 69.3, ca: 1.46, p: 0.65, pdr: 3 },
  { nome: 'Milho glúten 60', tipo: 'Concentrado', custo: 1, ms: 90.6, pb: 60, ndt: 83.9, ca: 0.05, p: 0.44, pdr: 3 },
  { nome: 'Milho (DDGS)', tipo: 'Concentrado', custo: 2.4, ms: 91.2, pb: 31.8, ndt: 89, ca: 0.05, p: 0.86, pdr: 3 },
  { nome: 'Resíduo de cervejaria', tipo: 'Concentrado', custo: 2.5, ms: 22.3, pb: 25.6, ndt: 92.2, ca: 0.33, p: 0.78, pdr: 4 },
  { nome: 'Soja farelo', tipo: 'Concentrado', custo: 3.5, ms: 87, pb: 45, ndt: 73, ca: 0.3, p: 0.61, pdr: 4 },
  { nome: 'Soja grão tostado', tipo: 'Concentrado', custo: 3.4, ms: 91.7, pb: 39.1, ndt: 94.2, ca: 0.25, p: 0.49, pdr: 40.2 },

// Tabela 28 - Alimentos para ovinos (com PDR real ou estimado)

// Forragens verdes
{nome:'Amendoim forrageiro', tipo:'Volumoso', custo:0.8, ms:22.8, pb:18.4, ndt:54.5, ca:2.1, p:0.22, pdr:4}, // PDR estimado
{nome:'Cana-de-açúcar', tipo:'Volumoso', custo:0.3, ms:28.9, pb:2.8, ndt:64.5, ca:0.24, p:0.08, pdr:41}, // PDR real
{nome:'Capim braquiária brizantha', tipo:'Volumoso', custo:0.6, ms:34, pb:6.9, ndt:52, ca:0.31, p:0.11, pdr:4}, // PDR estimado
{nome:'Capim bb (46-60 dias)', tipo:'Volumoso', custo:0.6, ms:20.8, pb:9.5, ndt:55.7, ca:0.71, p:0.47, pdr:4}, // PDR estimado
{nome:'Capim bb (61-90 dias)', tipo:'Volumoso', custo:0.6, ms:24.9, pb:6.5, ndt:58, ca:0.46, p:0.38, pdr:4}, // PDR estimado
{nome:'Capim bb (91-120 dias)', tipo:'Volumoso', custo:0.6, ms:27.7, pb:4.8, ndt:54, ca:0.58, p:0.17, pdr:4}, // PDR estimado
{nome:'Capim braquiária marandu', tipo:'Volumoso', custo:0.6, ms:33.2, pb:7.7, ndt:51.5, ca:0.28, p:0.09, pdr:4}, // PDR estimado
{nome:'Capim bm (61-90 dias)', tipo:'Volumoso', custo:0.6, ms:37.8, pb:5.5, ndt:53, ca:0.08, p:0.05, pdr:4}, // PDR estimado
{nome:'Capim braq. marandu outono', tipo:'Volumoso', custo:0.6, ms:31, pb:11.8, ndt:55, ca:0, p:0, pdr:4}, // PDR estimado
{nome:'Capim bm primavera', tipo:'Volumoso', custo:0.6, ms:27, pb:11.3, ndt:58.7, ca:0, p:0, pdr:4}, // PDR estimado
{nome:'Capim bm verão', tipo:'Volumoso', custo:0.6, ms:29, pb:12.3, ndt:54, ca:0, p:0, pdr:4}, // PDR estimado
{nome:'Capim bb MG4', tipo:'Volumoso', custo:0.6, ms:23, pb:9.2, ndt:52.6, ca:0, p:0, pdr:4}, // PDR estimado
{nome:'Capim bb MG4 (61-90 dias)', tipo:'Volumoso', custo:0.6, ms:29, pb:6.4, ndt:53, ca:0, p:0, pdr:4}, // PDR estimado
{nome:'Capim bb piatã (61-90 dias)', tipo:'Volumoso', custo:0.6, ms:34, pb:4.7, ndt:55.8, ca:0, p:0, pdr:4}, // PDR estimado
{nome:'Capim bb xaraés', tipo:'Volumoso', custo:0.6, ms:23, pb:9.3, ndt:56, ca:0.6, p:0.09, pdr:4}, // PDR estimado
{nome:'Capim braquiária decumbens', tipo:'Volumoso', custo:0.6, ms:28.5, pb:6.7, ndt:51.5, ca:0.4, p:0.1, pdr:4}, // PDR estimado
{nome:'Capim bd (61-90 dias)', tipo:'Volumoso', custo:0.6, ms:27.8, pb:7.2, ndt:49.3, ca:0.3, p:0.19, pdr:4}, // PDR estimado
{nome:'Capim bb (91-120 dias)', tipo:'Volumoso', custo:0.6, ms:30, pb:5.7, ndt:55.2, ca:0.3, p:0.2, pdr:4}, // PDR estimado
{nome:'Capim bd (121-150 dias)', tipo:'Volumoso', custo:0.6, ms:43.7, pb:5.1, ndt:56.7, ca:0.72, p:0.28, pdr:4}, // PDR estimado
{nome:'Capim braquiária humidícola', tipo:'Volumoso', custo:0.6, ms:28, pb:7.4, ndt:54.8, ca:0.38, p:0.12, pdr:4}, // PDR estimado
{nome:'Capim buffel (61-90 dias)', tipo:'Volumoso', custo:0.6, ms:34.6, pb:7.8, ndt:52.3, ca:0, p:0, pdr:4}, // PDR estimado

];

let ingredientes = INGREDIENTES_PADRAO.map(x=>({...x}));
let ingredientesSelecionados = [];
let limites = {
  pb: {min: null, max: null},
  ndt: {min: null, max: null},
  ca: {min: null, max: null},
  p: {min: null, max: null}
};
let limitesIngrSelecionados = [];

// ---- UI geral ----
function atualizarTabelaIngredientes() {
  const tbody = document.querySelector('#ingredientes-table tbody');
  tbody.innerHTML = '';
  ingredientesSelecionados.forEach(idx => {
    const ing = ingredientes[idx];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${ing.nome}</td>
      <td>${ing.tipo}</td>
      <td>R$ ${ing.custo.toFixed(2)}</td>
      <td>${ing.ms.toFixed(1)}</td>
      <td>${ing.pb.toFixed(1)}</td>
      <td>${ing.ndt.toFixed(1)}</td>
      <td>${ing.ca.toFixed(2)}</td>
      <td>${ing.p.toFixed(2)}</td>
      <td>${ing.pdr.toFixed(1)}</td>
      <td><button onclick="removerIngredienteSelecionado(${idx})" title="Remover">✖</button></td>
    `;
    tbody.appendChild(tr);
  });
  atualizarSelecaoIngredientes();
}

function removerIngredienteSelecionado(idx) {
  ingredientesSelecionados = ingredientesSelecionados.filter(i => i !== idx);
  limitesIngrSelecionados = limitesIngrSelecionados.filter(x => x.idx !== idx);
  atualizarTabelaIngredientes();
  atualizarSelecaoIngredientes();
}

function limparCamposIngrediente() {
  ['nome','tipo','custo','ms','pb','ndt','ca','p','pdr'].forEach(id => document.getElementById(id).value = '');
}

function preencherLimitesUI() {
  document.getElementById('pb-min').value = limites.pb.min ?? '';
  document.getElementById('pb-max').value = limites.pb.max ?? '';
  document.getElementById('ndt-min').value = limites.ndt.min ?? '';
  document.getElementById('ndt-max').value = limites.ndt.max ?? '';
  document.getElementById('ca-min').value = limites.ca.min ?? '';
  document.getElementById('ca-max').value = limites.ca.max ?? '';
  document.getElementById('p-min').value = limites.p.min ?? '';
  document.getElementById('p-max').value = limites.p.max ?? '';
}

// ---- Seleção de Ingredientes ----
function atualizarSelecaoIngredientes() {
  const div = document.getElementById('ingredientes-selecao-list');
  div.innerHTML = '';
  ingredientesSelecionados.forEach(idx => {
    const ing = ingredientes[idx];
    let limMin = 0, limMax = 100;
    const lim = limitesIngrSelecionados.find(obj=>obj.idx===idx);
    if (lim) { limMin = lim.min; limMax = lim.max; }
    const card = document.createElement('div');
    card.className = "ingrediente-selecao-card";
    card.innerHTML = `
      <label>
    ${ing.nome} 
    <span class="tipo-${ing.tipo.toLowerCase()}">[${ing.tipo}]</span>
  </label>
  <div class="limite-group">
   <!-- <label>Limite:</label> -->
    <div class="limite-inputs">
      <input type="number" id="limite-min-${idx}" value="${limMin}" min="0" max="100" step="0.1">
      <span style="font-size:90%;">a</span>
      <input type="number" id="limite-max-${idx}" value="${limMax}" min="0" max="100" step="0.1">
    </div>
    <span style="font-size:90%;">%MS</span>
  </div>
    `;
    div.appendChild(card);
    setTimeout(()=>{
      document.getElementById(`limite-min-${idx}`).oninput = e => {
        let obj = limitesIngrSelecionados.find(x=>x.idx===idx);
        if (obj) obj.min = parseFloat(e.target.value)||0;
      }
      document.getElementById(`limite-max-${idx}`).oninput = e => {
        let obj = limitesIngrSelecionados.find(x=>x.idx===idx);
        if (obj) obj.max = parseFloat(e.target.value)||100;
      }
    }, 10);
  });
}

// ---- Modal de ingredientes ----
const modalBg = document.getElementById('modal-ingredientes');
const abrirModalBtn = document.getElementById('abrir-modal-btn');
const fecharModalBtn = document.getElementById('fechar-modal-btn');
const modalIngredientesList = document.getElementById('modal-ingredientes-list');
const modalIngredientesForm = document.getElementById('modal-ingredientes-form');

abrirModalBtn.onclick = () => {
  renderModalIngredientes();
  modalBg.classList.add('active');
}
fecharModalBtn.onclick = ()=> modalBg.classList.remove('active');
modalBg.onclick = e => { if (e.target===modalBg) modalBg.classList.remove('active'); }

function renderModalIngredientes() {
  let header = `<div class="modal-ingrediente-row" style="background:#e0e5ea;font-weight:600;">
    <span></span>
    <span>Nome</span>
    <span>Tipo</span>
    <span>Custo</span>
    <span>%MS</span>
    <span>PB</span>
    <span>NDT</span>
    <span>Ca</span>
    <span>P</span>
    <span>PDR</span>
    <span></span>
  </div>`;
  let linhas = ingredientes.map((ing, idx) => {
    const checked = ingredientesSelecionados.includes(idx) ? 'checked' : '';
    return `<div class="modal-ingrediente-row" data-idx="${idx}">
      <input type="checkbox" name="select-ing" value="${idx}" ${checked}>
      <input type="text" name="nome-${idx}" value="${ing.nome}" required>
      <select name="tipo-${idx}">
        <option value="Volumoso"${ing.tipo==='Volumoso'?' selected':''}>Volumoso</option>
        <option value="Concentrado"${ing.tipo==='Concentrado'?' selected':''}>Concentrado</option>
      </select>
      <input type="number" name="custo-${idx}" value="${ing.custo}" step="0.01" min="0" required>
      <input type="number" name="ms-${idx}" value="${ing.ms}" step="0.1" min="0" required>
      <input type="number" name="pb-${idx}" value="${ing.pb}" step="0.1" min="0" required>
      <input type="number" name="ndt-${idx}" value="${ing.ndt}" step="0.1" min="0" max="100" required>
      <input type="number" name="ca-${idx}" value="${ing.ca}" step="0.01" min="0" max="100" required>
      <input type="number" name="p-${idx}" value="${ing.p}" step="0.01" min="0" max="100" required>
      <input type="number" name="pdr-${idx}" value="${ing.pdr}" step="0.1" min="0" required>
      <button type="button" onclick="removerIngredienteModal(${idx})" title="Remover" style="background:var(--danger);color:#fff;padding:0 0.6em;">✖</button>
    </div>`;
  }).join('');
  modalIngredientesList.innerHTML = header + linhas;
}
window.removerIngredienteModal = function(idx) {
  ingredientes.splice(idx,1);
  ingredientesSelecionados = ingredientesSelecionados.filter(i=>i!==idx);
  limitesIngrSelecionados = limitesIngrSelecionados.filter(x=>x.idx!==idx);
  ingredientesSelecionados = ingredientesSelecionados.map(i=>i>idx ? i-1 : i);
  limitesIngrSelecionados = limitesIngrSelecionados.map(obj=>({idx: obj.idx>idx?obj.idx-1:obj.idx, min: obj.min, max: obj.max}));
  renderModalIngredientes();
}

modalIngredientesForm.onsubmit = function(e){
  e.preventDefault();
  for (let i=0; i<ingredientes.length; ++i) {
    if (!modalIngredientesForm[`nome-${i}`]) continue;
    ingredientes[i].nome = modalIngredientesForm[`nome-${i}`].value;
    ingredientes[i].tipo = modalIngredientesForm[`tipo-${i}`].value;
    ingredientes[i].custo = parseFloat(modalIngredientesForm[`custo-${i}`].value);
    ingredientes[i].ms = parseFloat(modalIngredientesForm[`ms-${i}`].value);
    ingredientes[i].pb = parseFloat(modalIngredientesForm[`pb-${i}`].value);
    ingredientes[i].ndt = parseFloat(modalIngredientesForm[`ndt-${i}`].value);
    ingredientes[i].ca = parseFloat(modalIngredientesForm[`ca-${i}`].value);
    ingredientes[i].p = parseFloat(modalIngredientesForm[`p-${i}`].value);
    ingredientes[i].pdr = parseFloat(modalIngredientesForm[`pdr-${i}`].value);
  }
  let novasSelecoes = [];
  let novaLimiteObjs = [];
  let cbs = Array.from(modalIngredientesForm.querySelectorAll('input[type="checkbox"][name="select-ing"]'));
  cbs.forEach(cb=>{
    if(cb.checked) {
      let idx = parseInt(cb.value);
      novasSelecoes.push(idx);
      let lim = limitesIngrSelecionados.find(x=>x.idx===idx);
      novaLimiteObjs.push(lim?{...lim}:{idx,min:0,max:100});
    }
  });
  ingredientesSelecionados = novasSelecoes;
  limitesIngrSelecionados = novaLimiteObjs;
  atualizarTabelaIngredientes();
  setTimeout(atualizarSelecaoIngredientes, 0);
  modalBg.classList.remove('active');
}

// ---- Cadastro novo ingrediente ----
/*document.getElementById('ingrediente-form').onsubmit = e => {
  e.preventDefault();
  const nome = document.getElementById('nome').value.trim();
  const tipo = document.getElementById('tipo').value;
  const custo = parseFloat(document.getElementById('custo').value);
  const ms = parseFloat(document.getElementById('ms').value);
  const pb = parseFloat(document.getElementById('pb').value);
  const ndt = parseFloat(document.getElementById('ndt').value);
  const ca = parseFloat(document.getElementById('ca').value);
  const p = parseFloat(document.getElementById('p').value);
  const pdr = parseFloat(document.getElementById('pdr').value);

  if (!nome || !tipo || isNaN(custo) || isNaN(ms) || isNaN(pb) || isNaN(ndt) || isNaN(ca) || isNaN(p) || isNaN(pdr)) {
    alert('Preencha todos os campos corretamente.');
    return;
  }
  ingredientes.push({nome, tipo, custo, ms, pb, ndt, ca, p, pdr});
  atualizarTabelaIngredientes();
  limparCamposIngrediente();
} */

// ---- Limites gerais ----
document.getElementById('limites-form').oninput = () => {
  limites.pb.min = parseFloat(document.getElementById('pb-min').value) || null;
  limites.pb.max = parseFloat(document.getElementById('pb-max').value) || null;
  limites.ndt.min = parseFloat(document.getElementById('ndt-min').value) || null;
  limites.ndt.max = parseFloat(document.getElementById('ndt-max').value) || null;
  limites.ca.min = parseFloat(document.getElementById('ca-min').value) || null;
  limites.ca.max = parseFloat(document.getElementById('ca-max').value) || null;
  limites.p.min = parseFloat(document.getElementById('p-min').value) || null;
  limites.p.max = parseFloat(document.getElementById('p-max').value) || null;
}

// ---- Botões principais ----
document.getElementById('calcular-btn').onclick = calcularDieta;
document.getElementById('limpar-btn').onclick = limparTudo;
document.getElementById('exportar-btn').onclick = exportarPDF;

// ---- Spinner ----
function mostrarSpinner(flag) {
  document.getElementById('spinner-busca').style.display = flag ? 'flex' : 'none';
}

// ---- Lógica de cálculo de dieta (busca aleatória, precisa e rápida) ----
function calcularDieta() {
  if (ingredientesSelecionados.length < 2) {
    alert('Selecione pelo menos dois ingredientes.');
    return;
  }
  const ingredientesUsar = ingredientesSelecionados.map(idx => ingredientes[idx]);
  const limitesIndiv = ingredientesSelecionados.map(idx => {
    const obj = limitesIngrSelecionados.find(x=>x.idx===idx);
    return {min: obj?obj.min:0, max: obj?obj.max:100};
  });

  // Mostra o spinner de carregamento
  mostrarSpinner(true);

  // Parâmetros para busca aleatória
  const tentativas = 100000; // Aumente para mais precisão, diminua se ficar lento
  const step = 0.1; // precisão em %, igual à anterior

  setTimeout(() => {
    let melhor = null;
    let melhorCusto = Infinity;

    for (let t = 0; t < tentativas; t++) {
      // Gera proporções aleatórias, mas que somem 100%
      let props = [];
      let soma = 0;
      let ok = true;
      for (let i = 0; i < ingredientesUsar.length; i++) {
        let min = limitesIndiv[i].min;
        let max = limitesIndiv[i].max;
        if (i === ingredientesUsar.length - 1) {
          let ult = 100 - soma;
          if (ult < min || ult > max) { ok = false; break; }
          props.push(ult / 100);
        } else {
          let restMax = 100 - soma - (ingredientesUsar.length - i - 1) * step;
          let localMax = Math.min(max, restMax);
          let localMin = Math.max(min, 0, 100 - soma - (ingredientesUsar.length - i - 1) * max);
          if(localMax < localMin) { ok = false; break; }
          let val = Math.round((Math.random() * (localMax - localMin) + localMin) / step) * step;
          soma += val;
          props.push(val / 100);
        }
      }
      if (!ok) continue;
      if (Math.abs(props.reduce((a, b) => a + b, 0) - 1) > 0.0001) continue;
      let totalPB = 0, totalNDT = 0, totalCa = 0, totalP = 0, totalMS = 0, totalPDR = 0, custo = 0;
      let volMS = 0, concMS = 0;
      ingredientesUsar.forEach((ing, idx) => {
        let prop = props[idx];
        totalPB += prop * ing.pb;
        totalNDT += prop * ing.ndt;
        totalCa += prop * ing.ca;
        totalP += prop * ing.p;
        totalMS += prop * 100;
        totalPDR += prop * ing.pb * (ing.pdr / 100);
        custo += prop * (100 / ing.ms) * ing.custo;
        if (ing.tipo === 'Volumoso') volMS += prop * 100;
        else concMS += prop * 100;
      });
      if (
        (limites.pb.min === null || totalPB >= limites.pb.min) &&
        (limites.pb.max === null || totalPB <= limites.pb.max) &&
        (limites.ndt.min === null || totalNDT >= limites.ndt.min) &&
        (limites.ndt.max === null || totalNDT <= limites.ndt.max) &&
        (limites.ca.min === null || totalCa >= limites.ca.min) &&
        (limites.ca.max === null || totalCa <= limites.ca.max) &&
        (limites.p.min === null || totalP >= limites.p.min) &&
        (limites.p.max === null || totalP <= limites.p.max)
      ) {
        if (custo < melhorCusto) {
          melhorCusto = custo;
          melhor = {props, totalPB, totalNDT, totalCa, totalP, totalMS, totalPDR, volMS, concMS, custo, ingredientesUsar};
        }
      }
    }

    mostrarSpinner(false);

    if (!melhor) {
      mostrarResultados(null, ingredientesUsar);
      alert('Não foi encontrada uma combinação de ingredientes que respeite os limites definidos.');
      return;
    }
    mostrarResultados(melhor, ingredientesUsar);

  }, 100); // timeout para garantir renderização do spinner
}

function mostrarResultados(res, ingredientesUsar) {
  const sec = document.getElementById('resultado-section');
  const out = document.getElementById('resultados-formulacao');
  const exportBtns = document.getElementById('botoes-exportar');
  if (!out) return;

  if (!res) {
    sec.style.display='block';
    out.innerHTML = '<p style="color:var(--danger)">Alerta: Não encontramos nenhuma combinação que atenda às restrições impostas!</p>';
    desenharGrafico(null);
    if (exportBtns) exportBtns.style.display = 'none';
    return;
  }
  
  // Tabela de proporções dos ingredientes
  let t = `<h3 class="mb-2" style="font-size:1.22em;letter-spacing:1px;color:#157347;">Tabela de Ingredientes e Proporções da Mistura</h3>
  <table class="result-table mb-3">
    <thead>
      <tr>
        <th>Ingrediente</th>
        <th>Tipo</th>
        <th>Kg Matéria Natural</th>
        
        <th>Proporção (%MS)</th>
      </tr>
    </thead>
    <tbody>`;
  let totalNatural=0, totalMS=0;
  res.ingredientesUsar.forEach((ing,idx) => {
    let kgMS = res.props[idx];
    let kgNatural = kgMS * 100 / ing.ms;
    t += `<tr>
      <td>${ing.nome}</td>
      <td>${ing.tipo}</td>
      <td>${(kgNatural*100).toFixed(2)}</td>
      
      <td>${(kgMS*100).toFixed(2)}%</td>
    </tr>`;
    totalNatural += kgNatural;
    totalMS += kgMS;
  });
  t += `<tr style="font-weight:bold;">
    <td colspan="2">Total</td>
    <td>${(totalNatural*100).toFixed(2)}</td>
   
    <td>100%</td>
  </tr>`;
  t += '</tbody></table>';

  // Nutrientes/resumo logo abaixo da tabela
  t += `<h3 style="font-size:1.25rem;letter-spacing:1px;">Resumo Nutricional</h3>
  <ul>
    <li><strong>PB:</strong> ${res.totalPB.toFixed(2)} %MS</li>
    <li><strong>NDT:</strong> ${res.totalNDT.toFixed(2)} %MS</li>
    <li><strong>Ca:</strong> ${res.totalCa.toFixed(3)} %MS</li>
    <li><strong>P:</strong> ${res.totalP.toFixed(3)} %MS</li>
    
    <li><strong>Relação Ca/P:</strong> ${(res.totalCa/res.totalP).toFixed(2)}</li>
    <li><strong>Relação Volumoso/Concentrado:</strong> ${((res.volMS/res.totalMS)*100).toFixed(1)}% / ${((res.concMS/res.totalMS)*100).toFixed(1)}%</li>
    <li><strong>Custo por Kg:</strong> R$ ${res.custo.toFixed(2)} </li>
  </ul>`;

  // Exibe gráfico após a tabela+resumo
  out.innerHTML = t + `
    <div class="w-100 mt-3">
      <div class="d-flex flex-column align-items-center">
        <canvas id="grafico" width="350" height="220"></canvas>
      </div>
    </div>`;

  sec.style.display = 'block';
  desenharGrafico(res);

  // Exibe botões de exportação
  if (exportBtns) exportBtns.style.display = res ? 'flex' : 'none';
  
}

// Os botões de exportação só funcionam se houver resultados
document.getElementById('exportar-btn').onclick = function() {
  if(document.getElementById('resultado-section').style.display === "none" || !document.getElementById('resultados-formulacao').innerHTML) {
    alert("Calcule uma dieta antes de exportar.");
    return;
  }
  exportarPDF();
};

document.getElementById('mistura-btn').onclick = function() {
  if(document.getElementById('resultado-section').style.display === "none" || !document.getElementById('resultados-formulacao').innerHTML) {
    alert("Calcule uma dieta antes de exportar.");
    return;
  }
  exportarMisturaPDF();
};


// --- Ajuste: inicialização e limparTudo limpam apenas a parte correta ---
function limparTudo() {
  if (!confirm('Deseja limpar todos os dados e resultados?')) return;
  ingredientes = INGREDIENTES_PADRAO.map(x=>({...x}));
  ingredientesSelecionados = [];
  limitesIngrSelecionados = [];
  atualizarTabelaIngredientes();
  document.getElementById('resultado-section').style.display='none';
  // Limpar apenas resultados da formulação:
  let out = document.getElementById('resultados-formulacao');
  if (out) out.innerHTML = '';
  atualizarSelecaoIngredientes();
  // Oculta botões de exportação
  const exportBtns = document.getElementById('botoes-exportar');
  if (exportBtns) exportBtns.style.display = 'none';
}

// --- Inicialização: oculta botões de exportação e limpa resultados formulação ---
document.addEventListener("DOMContentLoaded", function() {
  atualizarRacas();
  atualizarTabelaIngredientes();
  preencherLimitesUI();
  const exportBtns = document.getElementById('botoes-exportar');
  if (exportBtns) exportBtns.style.display = 'none';
  let out = document.getElementById('resultados-formulacao');
  if (out) out.innerHTML = '';
});

// --- Ajuste ícones cálcio e fósforo para ícones melhores (exemplo: Ca = cubo/químico, P = elixir/gota) ---
const icons = {
  // ... outros ícones ...
  ca: '<i class="bi bi-cube text-primary"></i>',      // melhor ícone para Cálcio
  p: '<i class="bi bi-droplet-half text-info"></i>',  // melhor ícone para Fósforo
  // ... outros ícones ...
};


// --- Oculta botões de exportação ao limpar tudo ---
function limparTudo() {
  if (!confirm('Deseja limpar todos os dados e resultados?')) return;
  ingredientes = INGREDIENTES_PADRAO.map(x=>({...x}));
  ingredientesSelecionados = [];
  limitesIngrSelecionados = [];
  atualizarTabelaIngredientes();
  document.getElementById('resultado-section').style.display='none';
  atualizarSelecaoIngredientes();
  // Oculta botões de exportação
  const exportBtns = document.getElementById('botoes-exportar');
  if (exportBtns) exportBtns.style.display = 'none';
}

// --- Inicialização: oculta botões de exportação ---
document.addEventListener("DOMContentLoaded", function() {
  atualizarRacas();
  atualizarTabelaIngredientes();
  preencherLimitesUI();
  const exportBtns = document.getElementById('botoes-exportar');
  if (exportBtns) exportBtns.style.display = 'none';
});

// ---- Limpar ----
function limparTudo() {
  if (!confirm('Deseja limpar todos os dados e resultados?')) return;
  ingredientes = INGREDIENTES_PADRAO.map(x=>({...x}));
  ingredientesSelecionados = [];
  limitesIngrSelecionados = [];
  atualizarTabelaIngredientes();
  document.getElementById('resultado-section').style.display='none';
  atualizarSelecaoIngredientes();
}


// ---- Gráfico ajustado para não sobrepor textos ----
function desenharGrafico(res) {
  const cv = document.getElementById('grafico');
  const ctx = cv.getContext('2d');
  ctx.clearRect(0,0,cv.width,cv.height);
  if (!res) return;

  // Ajuste dinâmico para até 20 barras
  let n = res.ingredientesUsar.length;
  let margin = 35;
  let bararea = cv.width - margin * 2;
  let barWidth = Math.min(32, Math.floor(bararea / n * 0.7));
  let gap = (bararea - n * barWidth) / (n - 1 >= 1 ? n - 1 : 1);

  let x0 = margin, y0 = 40, h = 110;
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Participação dos ingredientes (%MS)", cv.width / 2, y0-15);
 
  let max = Math.max(...res.props.map(v=>v*100), 10);
  res.ingredientesUsar.forEach((ing,idx) => {
    let v = res.props[idx]*100;
    let barh = v/max*h;
    let x = x0 + idx * (barWidth + gap);

    ctx.fillStyle = ing.tipo==='Volumoso' ? "#2d9c72" : "#daa520";
    ctx.fillRect(x, y0+h-barh, barWidth, barh);

    // Valor no topo da barra
    ctx.save();
    ctx.font = "11px Arial";
    ctx.fillStyle = "#222";
    ctx.textAlign = "center";
    ctx.fillText(v.toFixed(1)+'%', x + barWidth/2, y0+h-barh-7);

    // Nome vertical (se muitos ingredientes, rotaciona)
    ctx.save();
    ctx.translate(x + barWidth/2, y0+h+15);
    if (n > 12) {
      ctx.rotate(-Math.PI/2.5);
      ctx.textAlign = "right";
      ctx.font = "10px Arial";
      ctx.fillText(ing.nome.slice(0,12), 0, 0);
    } else {
      ctx.rotate(0);
      ctx.font = "11px Arial";
      ctx.fillText(ing.nome.slice(0,14), 0, 0);
    }
    ctx.restore();
    ctx.restore();
  });
}

// ---- Calculo da MS para cordeiros 

 /*document.getElementById('calcular').addEventListener('click', function () {
        const pvInput = document.getElementById('pv');
        const gpdInput = document.getElementById('gpd');
        const resultadoDiv = document.getElementById('resultado');
        
        const pv = parseFloat(pvInput.value);
        const gpd = parseFloat(gpdInput.value);

        if (isNaN(pv) || isNaN(gpd) || pv <= 0) {
          resultadoDiv.textContent = 'Por favor, preencha ambos os campos com valores válidos (PV deve ser maior que zero).';
          return;
        }

        // CMS (kg/animal/dia) = 0,311 + ((0,0197 x PV) + (0,682 x GPD))
        const cms = 0.311 + ((0.0197 * pv) + (0.682 * gpd));
        const cmsPercentual = (cms / pv) * 100;

        resultadoDiv.innerHTML = `
          Consumo de Matéria Seca (CMS): <b>${cms.toFixed(3)} kg/animal/dia</b><br>
          CMS em relação ao PV: <b>${cmsPercentual.toFixed(2)}% PV</b>
        `;
      }); */



      // --- Tabelas de referência para cordeiros (energia e proteína) ---
const tabelaEnergia = [
  { pv: 20, gmd: 0.15, elm: 0.54, elg: 0.43, emm: 0.82, em: 1.03, ndt: 0.51 },
  { pv: 20, gmd: 0.20, elm: 0.54, elg: 0.58, emm: 0.82, em: 1.38, ndt: 0.61 },
  { pv: 20, gmd: 0.25, elm: 0.54, elg: 0.72, emm: 0.82, em: 1.72, ndt: 0.70 },
  { pv: 20, gmd: 0.30, elm: 0.54, elg: 0.87, emm: 0.82, em: 2.07, ndt: 0.80 },
  { pv: 20, gmd: 0.35, elm: 0.54, elg: 1.01, emm: 0.82, em: 2.41, ndt: 0.89 },
  { pv: 25, gmd: 0.15, elm: 0.64, elg: 0.47, emm: 0.97, em: 1.11, ndt: 0.57 },
  { pv: 25, gmd: 0.20, elm: 0.64, elg: 0.62, emm: 0.97, em: 1.48, ndt: 0.68 },
  { pv: 25, gmd: 0.25, elm: 0.64, elg: 0.78, emm: 0.97, em: 1.85, ndt: 0.78 },
  { pv: 25, gmd: 0.30, elm: 0.64, elg: 0.93, emm: 0.97, em: 2.22, ndt: 0.88 },
  { pv: 25, gmd: 0.35, elm: 0.64, elg: 1.09, emm: 0.97, em: 2.59, ndt: 0.98 },
  { pv: 30, gmd: 0.15, elm: 0.73, elg: 0.50, emm: 1.11, em: 1.19, ndt: 0.63 },
  { pv: 30, gmd: 0.20, elm: 0.73, elg: 0.66, emm: 1.11, em: 1.58, ndt: 0.74 },
  { pv: 30, gmd: 0.25, elm: 0.73, elg: 0.83, emm: 1.11, em: 1.98, ndt: 0.85 },
  { pv: 30, gmd: 0.30, elm: 0.73, elg: 1.00, emm: 1.11, em: 2.37, ndt: 0.96 },
  { pv: 30, gmd: 0.35, elm: 0.73, elg: 1.16, emm: 1.11, em: 2.77, ndt: 1.07 },
  { pv: 35, gmd: 0.15, elm: 0.82, elg: 0.53, emm: 1.24, em: 1.26, ndt: 0.69 },
  { pv: 35, gmd: 0.20, elm: 0.82, elg: 0.71, emm: 1.24, em: 1.68, ndt: 0.81 },
  { pv: 35, gmd: 0.25, elm: 0.82, elg: 0.88, emm: 1.24, em: 2.10, ndt: 0.93 },
  { pv: 35, gmd: 0.30, elm: 0.82, elg: 1.06, emm: 1.24, em: 2.53, ndt: 1.04 },
  { pv: 35, gmd: 0.35, elm: 0.82, elg: 1.24, emm: 1.24, em: 2.95, ndt: 1.16 }
];

const tabelaProteina = [
  { pv: 20, gmd: 0.15, pmm: 37.83, plg: 27.30, pb: 99.99 },
  { pv: 20, gmd: 0.20, pmm: 37.83, plg: 36.39, pb: 118.3 },
  { pv: 20, gmd: 0.25, pmm: 37.83, plg: 45.49, pb: 136.7 },
  { pv: 20, gmd: 0.30, pmm: 37.83, plg: 54.59, pb: 155.0 },
  { pv: 20, gmd: 0.35, pmm: 37.83, plg: 63.69, pb: 173.4 },
  { pv: 25, gmd: 0.15, pmm: 44.72, plg: 27.10, pb: 107.5 },
  { pv: 25, gmd: 0.20, pmm: 44.72, plg: 36.13, pb: 125.6 },
  { pv: 25, gmd: 0.25, pmm: 44.72, plg: 45.16, pb: 143.8 },
  { pv: 25, gmd: 0.30, pmm: 44.72, plg: 54.20, pb: 162.0 },
  { pv: 25, gmd: 0.35, pmm: 44.72, plg: 63.23, pb: 180.1 },
  { pv: 30, gmd: 0.15, pmm: 51.27, plg: 26.91, pb: 114.7 },
  { pv: 30, gmd: 0.20, pmm: 51.27, plg: 35.88, pb: 132.6 },
  { pv: 30, gmd: 0.25, pmm: 51.27, plg: 44.85, pb: 150.6 },
  { pv: 30, gmd: 0.30, pmm: 51.27, plg: 53.82, pb: 168.5 },
  { pv: 30, gmd: 0.35, pmm: 51.27, plg: 62.79, pb: 186.5 },
  { pv: 35, gmd: 0.15, pmm: 57.56, plg: 26.73, pb: 121.5 },
  { pv: 35, gmd: 0.20, pmm: 57.56, plg: 35.64, pb: 139.3 },
  { pv: 35, gmd: 0.25, pmm: 57.56, plg: 44.55, pb: 157.0 },
  { pv: 35, gmd: 0.30, pmm: 57.56, plg: 53.46, pb: 174.8 },
  { pv: 35, gmd: 0.35, pmm: 57.56, plg: 62.37, pb: 192.6 }
];

// --- Tabela de exigências por categoria (todas as categorias da tabela fornecida) ---
const tabelaCategorias = [
  { categoria: "Mantença", cms: 1.2, pb: 9.5, ndt: 55, em: 2.0, ca: 0.4, p: 0.2 },
  { categoria: "Flushing", cms: 1.8, pb: 9.0, ndt: 60, em: 2.1, ca: 0.5, p: 0.2 },
  { categoria: "Gestantes (1ªs 15 semanas)", cms: 1.4, pb: 9.5, ndt: 55, em: 2.0, ca: 0.5, p: 0.2 },
  { categoria: "Gestantes últimas-semanas (-40% CMS)", cms: 1.8, pb: 11, ndt: 60, em: 2.1, ca: 0.6, p: 0.25 },
  { categoria: "Gestantes últimas semanas (-60% CMS)", cms: 2.0, pb: 11.5, ndt: 65, em: 2.3, ca: 0.65, p: 0.3 },
  { categoria: "Início gestação (1 feto)", cms: 1.3, pb: 8, ndt: 55, em: 1.9, ca: 0.45, p: 0.32 },
  { categoria: "Final gestação (1 feto)", cms: 1.5, pb: 7, ndt: 65, em: 2.0, ca: 0.55, p: 0.4 },
  { categoria: "Início gestação (2 fetos)", cms: 1.5, pb: 8.5, ndt: 55, em: 1.9, ca: 0.4, p: 0.28 },
  { categoria: "Final gestação (2 fetos)", cms: 1.5, pb: 11, ndt: 75, em: 2.6, ca: 0.55, p: 0.35 },
  { categoria: "Lactação (1 cria)", cms: 2.5, pb: 13.5, ndt: 65, em: 2.3, ca: 0.65, p: 0.3 },
  { categoria: "Lactação (2 crias)", cms: 2.8, pb: 15, ndt: 65, em: 2.5, ca: 0.75, p: 0.35 },
  { categoria: "Creep-feeding cordeiros", cms: 0.6, pb: 26.5, ndt: 80, em: 2.9, ca: 0.95, p: 0.4 },
  { categoria: "Cordeiros crescimento (270 g/dia)", cms: 1.18, pb: 16.5, ndt: 78, em: 2.8, ca: 0.6, p: 0.25 },
  { categoria: "Cordeiros terminação (360 g/dia)", cms: 1.5, pb: 14.5, ndt: 78, em: 2.7, ca: 0.7, p: 0.3 },
  { categoria: "Cordeiros terminação (270 g/dia)", cms: 1.6, pb: 12, ndt: 75, em: 2.7, ca: 0.55, p: 0.22 },
  { categoria: "Borregas reposição", cms: 1.4, pb: 10, ndt: 65, em: 2.4, ca: 0.45, p: 0.18 },
  { categoria: "Borregos reposição", cms: 2.4, pb: 11, ndt: 65, em: 2.3, ca: 0.45, p: 0.18 },
  { categoria: "Reprodutores em serviço", cms: 3.0, pb: 10, ndt: 65, em: 2.3, ca: 0.4, p: 0.15 },
  { categoria: "Confinamento de ovinos", cms: "-", pb: 14, ndt: 65, em: "-", ca: "0.8%", p: "0.4%" }
];

// Funções de busca
function encontrarEnergiaTabulada(pv, gmd) {
  const PVs = [...new Set(tabelaEnergia.map(e => e.pv))];
  const GMDs = [...new Set(tabelaEnergia.map(e => e.gmd))];
  let pvMaisProx = PVs.reduce((prev, curr) =>
    Math.abs(curr - pv) < Math.abs(prev - pv) ? curr : prev
  );
  let gmdMaisProx = GMDs.reduce((prev, curr) =>
    Math.abs(curr - gmd) < Math.abs(prev - gmd) ? curr : prev
  );
  let linha = tabelaEnergia.find(e => e.pv === pvMaisProx && e.gmd === gmdMaisProx);
  return linha || null;
}

function encontrarProteinaTabulada(pv, gmd) {
  const PVs = [...new Set(tabelaProteina.map(e => e.pv))];
  const GMDs = [...new Set(tabelaProteina.map(e => e.gmd))];
  let pvMaisProx = PVs.reduce((prev, curr) =>
    Math.abs(curr - pv) < Math.abs(prev - pv) ? curr : prev
  );
  let gmdMaisProx = GMDs.reduce((prev, curr) =>
    Math.abs(curr - gmd) < Math.abs(prev - gmd) ? curr : prev
  );
  let linha = tabelaProteina.find(e => e.pv === pvMaisProx && e.gmd === gmdMaisProx);
  return linha || null;
}

// Preenche o select com todas as categorias automaticamente
function popularSelectCategorias() {
  const select = document.getElementById('categoriaCal');
  if (!select) return;
  // Adiciona a opção padrão "Cordeiro (crescimento)" (usa cálculo especial)
  select.innerHTML = `<option value="cordeiro">Cordeiro (crescimento)</option>`;
  tabelaCategorias.forEach(cat => {
    select.innerHTML += `<option value="${cat.categoria}">${cat.categoria}</option>`;
  });
}
document.addEventListener("DOMContentLoaded", popularSelectCategorias);

// Função principal
function calcular() {
  const categoria = document.getElementById('categoriaCal').value;
  const PV = parseFloat(document.getElementById('peso').value);
  const GMDg = parseFloat(document.getElementById('gmd').value);
  const GPD = GMDg / 1000;
  const divResultados = document.getElementById('resultadosCal');

  // Para cordeiro, usar tabelas e cálculos específicos
  if (categoria === "cordeiro") {
    if (isNaN(PV) || isNaN(GMDg) || PV < 10 || GMDg < 0) {
      divResultados.innerHTML = `<div style="color:red;">Preencha os campos corretamente.</div>`;
      return;
    }
    // Consumo de Matéria Seca (CMS)
    const CMS = 0.311 + ((0.0197 * PV) + (0.682 * GPD));
    // Busca valores tabulados
    const energia = encontrarEnergiaTabulada(PV, GPD);
    const proteina = encontrarProteinaTabulada(PV, GPD);

    divResultados.innerHTML = `
      <div class="result-section">
        <h2>Consumo de Matéria Seca</h2>
        <table class="result-table">
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Valor</th>
              <th>Unidade</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Consumo de Matéria Seca (CMS)</td>
              <td>${CMS.toFixed(3)}</td>
              <td>kg/animal/dia</td>
            </tr>
            <tr>
              <td>% (CMS) com base no PV</td>
              <td>${((CMS*100)/PV).toFixed(2)}</td>
              <td>%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="result-section">
        <h2>Energia</h2>
        <table class="result-table">
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Valor</th>
              <th>Unidade</th>
            </tr>
          </thead>
          <tbody>
            ${energia ? `
            <tr><td>Energia Líquida de Mantença (ELm)</td><td>${energia.elm.toFixed(2)}</td><td>Mcal/animal/dia</td></tr>
            <tr><td>Energia Líquida para Ganho (ELg)</td><td>${energia.elg.toFixed(2)}</td><td>Mcal/animal/dia</td></tr>
            <tr><td>Energia Metabolizável de Mantença (EMm)</td><td>${energia.emm.toFixed(2)}</td><td>Mcal/animal/dia</td></tr>
            <tr><td>Energia Metabolizável Total (EM)</td><td>${energia.em.toFixed(2)}</td><td>Mcal/animal/dia</td></tr>
            <tr><td>Nutrientes Digestíveis Totais (NDT)</td><td>${energia.ndt.toFixed(2)}</td><td>Kg/animal/dia</td></tr>
            <tr><td>Nutrientes Digestíveis Totais (NDT)</td><td>${(energia.ndt*100/CMS).toFixed(2)}</td><td>%</td></tr>
            ` : `
            <tr>
              <td colspan="3">PV e GMD fora da faixa da tabela. Os valores de energia não estão disponíveis.</td>
            </tr>
            `}
          </tbody>
        </table>
      </div>
      <div class="result-section">
        <h2>Proteína</h2>
        <table class="result-table">
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Valor</th>
              <th>Unidade</th>
            </tr>
          </thead>
          <tbody>
            ${proteina ? `
            <tr><td>Proteína Metabolizável de Mantença (PMm)</td><td>${proteina.pmm.toFixed(2)}</td><td>g/animal/dia</td></tr>
            <tr><td>Proteína Líquida para Ganho (PLg)</td><td>${proteina.plg.toFixed(2)}</td><td>g/animal/dia</td></tr>
            <tr><td>Proteína Bruta (PB)</td><td>${proteina.pb.toFixed(2)}</td><td>g/animal/dia</td></tr>
            <tr><td>Proteína Bruta (PB)</td><td>${((proteina.pb)*100/(CMS*1000)).toFixed(2)}</td><td>%</td></tr>
            ` : `
            <tr>
              <td colspan="3">PV e GMD fora da faixa da tabela. Os valores de proteína não estão disponíveis.</td>
            </tr>
            `}
          </tbody>
        </table>
      </div>
      <div class="result-section">
        <h2>Cálcio (Ca)</h2>
        <table class="result-table">
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Valor</th>
              <th>Unidade</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cálcio (Ca)</td>
              <td>${(CMS*1000*0.0045).toFixed(1)} a ${(CMS*1000*0.0055).toFixed(1)}</td>
              <td>g/animal/dia</td>
            </tr>
            <tr>
              <td>Cálcio (Ca)</td>
              <td>${((CMS*1000*0.0045*100)/(CMS*1000)).toFixed(2)} a ${((CMS*1000*0.0055*100)/(CMS*1000)).toFixed(2)}</td>
              <td>%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="result-section">
        <h2>Fósforo (P)</h2>
        <table class="result-table">
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Valor</th>
              <th>Unidade</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Fósforo (P)</td>
              <td>${(CMS*1000*0.0022).toFixed(1)} a ${(CMS*1000*0.003).toFixed(1)}</td>
              <td>g/animal/dia</td>
            </tr>
            <tr>
              <td>Fósforo (P)</td>
              <td>${((CMS*1000*0.0022*100)/(CMS*1000)).toFixed(2)} a ${((CMS*1000*0.003*100)/(CMS*1000)).toFixed(2)}</td>
              <td>%</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    return;
  }

  // Para qualquer outra categoria, buscar na tabelaCategorias
  const cat = tabelaCategorias.find(c => c.categoria === categoria);
  if (!cat) {
    divResultados.innerHTML = `<div style="color:red;">Categoria não encontrada.</div>`;
    return;
  }

  divResultados.innerHTML = `
    <div class="result-section">
      <h2>Requerimentos Nutricionais (${cat.categoria})</h2>
      <table class="result-table">
        <thead>
          <tr>
            <th>Indicador</th>
            <th>Valor</th>
            <th>Unidade</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Consumo de Matéria Seca (CMS)</td>
            <td>${cat.cms !== null && cat.cms !== "-" ? cat.cms : "-"}</td>
            <td>kg/animal/dia</td>
          </tr>
          <tr>
            <td>Proteína Bruta (PB)</td>
            <td>${cat.pb}</td>
            <td>%MS</td>
          </tr>
          <tr>
            <td>NDT</td>
            <td>${cat.ndt}</td>
            <td>%MS</td>
          </tr>
          <tr>
            <td>Energia Metabolizável (EM)</td>
            <td>${cat.em !== null && cat.em !== "-" ? cat.em : "-"}</td>
            <td>Mcal/kg</td>
          </tr>
          <tr>
            <td>Cálcio (Ca)</td>
            <td>${cat.ca}</td>
            <td>g/kg</td>
          </tr>
          <tr>
            <td>Fósforo (P)</td>
            <td>${cat.p}</td>
            <td>g/kg</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

// -- Final calculo da MS para cordeiros 



// --- Exportar PDF (em nova página, formato organizado) ---
// --- Exportar Dieta Otimizada PDF ---
function exportarPDF() {
  const resultadoSection = document.getElementById('resultado-section');
  const resultadosFormulacao = document.getElementById('resultados-formulacao');
  if (resultadoSection.style.display === "none" || !resultadosFormulacao.innerHTML) {
    alert("Calcule uma dieta antes de exportar.");
    return;
  }

  // Busca a tabela da dieta já formulada
  let sec = resultadosFormulacao.querySelector('.result-table');
  if (!sec) {
    alert("Calcule uma dieta antes de exportar.");
    return;
  }

  // --- Dados do animal e da dieta ---
  const especie = document.getElementById('especie')?.value || '';
  const especieLabel = especie === "caprino" ? "Caprino" : "Ovino";
  const racaEl = document.getElementById('raca');
  const raca = racaEl ? racaEl.value : '';
  const racaLabel = racaEl ? racaEl.options[racaEl.selectedIndex].text : '';
  const categoriaEl = document.getElementById('categoria');
  const categoria = categoriaEl ? categoriaEl.value : '';
  const categoriaLabel = categoriaEl ? categoriaEl.options[categoriaEl.selectedIndex].text : '';
  const faseEl = document.getElementById('fase');
  const fase = faseEl ? faseEl.value : '';
  const faseLabel = faseEl ? faseEl.options[faseEl.selectedIndex].text : '';
  const pv = parseFloat(document.getElementById('peso')?.value) || 0;
  const gmd = parseFloat(document.getElementById('gmd')?.value) || 0;
  // Consumo de MS por animal em Kg/dia (preferencialmente já convertido)
  let consumoMSAnimal = 0;
  // Tenta pegar do card de resultados
  const cardCMS = document.querySelector('#resultados .result-card.bg-cms');
  if (cardCMS) {
    const m = cardCMS.innerHTML.match(/Consumo Matéria Seca \(CMS\):<\/strong> ([\d\.,]+) g\/dia/i);
    if (m) consumoMSAnimal = parseFloat(m[1].replace(",", ".")) / 1000;
  }
  // Se não encontrar, pega do input
  if (!consumoMSAnimal) {
    consumoMSAnimal = parseFloat(document.getElementById('ms-animal')?.value) || 0;
  }
  // Número de animais
  const numAnimais = parseInt(document.getElementById('num-animais')?.value, 10) || 1;
  const consumoMSLote = consumoMSAnimal * numAnimais; // Kg/dia

  // --- Ingredientes da mistura ---
  let nomesIngredientes = [];
  let proporcoesMS = [];
  let totalMS = 0;
  sec.querySelectorAll("tbody tr").forEach(tr => {
    let tds = tr.querySelectorAll("td");
    if (tds.length === 4) {
      let nome = tds[0].innerText;
      let pctMS = parseFloat(tds[3].innerText.replace(",", "."));
      nomesIngredientes.push(nome);
      proporcoesMS.push(pctMS / 100);
      totalMS += pctMS / 100;
    }
  });
  // Normaliza proporções (garante soma = 1)
  const propsMS = proporcoesMS.map(x => x / totalMS);

  // --- Cálculo do Consumo total de Matéria Natural no lote ---
  let consumoMNTotalLote = 0;
  let proporcoesMNIngredientes = [];
  for (let i = 0; i < nomesIngredientes.length; i++) {
    let nome = nomesIngredientes[i];
    let prop = propsMS[i];
    let ing = ingredientes.find(x => x.nome === nome);
    if (ing && ing.ms > 0) {
      let msIngredienteLote = consumoMSLote * prop; // Kg MS
      let mnIngredienteLote = msIngredienteLote / (ing.ms / 100); // Kg MN
      consumoMNTotalLote += mnIngredienteLote;
      proporcoesMNIngredientes.push({ nome, mnIngredienteLote, prop });
    }
  }
  proporcoesMNIngredientes = proporcoesMNIngredientes.map(row => ({
    ...row,
    pctMN: consumoMNTotalLote > 0 ? (row.mnIngredienteLote / consumoMNTotalLote) * 100 : 0
  }));

  // --- Tabela de ingredientes para 100kg MS ---
  let linhas = [];
  let totalKgNat = 0, totalKgMS = 0, totalCustoMS = 0;
  sec.querySelectorAll("tbody tr").forEach(tr => {
    let tds = tr.querySelectorAll("td");
    if (tds.length === 4) {
      let nome = tds[0].innerText;
      let kgNat = parseFloat(tds[2].innerText.replace(",", "."));
      let kgMS = parseFloat(tds[3].innerText.replace(",", "."));
      totalKgNat += kgNat;
      totalKgMS += kgMS;
      let ing = ingredientes.find(i => i.nome === nome);
      let custoMS = ing ? ((100 / ing.ms) * ing.custo) : 0;
      let custoPropMS = custoMS * kgMS;
      totalCustoMS += custoPropMS;
      linhas.push({
        ingrediente: nome,
        kgNat, kgMS, custoUnitMS: custoMS, custoPropMS
      });
    }
  });
  let fatorMS = totalKgMS > 0 ? 100 / totalKgMS : 1;
  let linhas100 = linhas.map(l => ({
    ingrediente: l.ingrediente,
    kgMS: l.kgMS * fatorMS,
    kgNat: l.kgNat * fatorMS,
    custoUnitMS: l.custoUnitMS,
    custoPropMS: l.custoUnitMS * l.kgMS * fatorMS
  }));
  let totalKgNat100 = linhas100.reduce((a, b) => a + b.kgNat, 0);
  let totalCustoMS100 = linhas100.reduce((a, b) => a + b.custoPropMS, 0);

  // --- Resumo Nutricional
  let resumo = {};
  resultadosFormulacao.querySelectorAll("ul li").forEach(li => {
    let key = li.innerText.split(":")[0].replace("Relação ","relacao_").replace(" ", "_").replace("/", "_").toLowerCase();
    let val = li.innerText.split(":")[1] ? li.innerText.split(":")[1].trim() : "";
    resumo[key] = val;
  });

  // --- HTML do PDF ---
  let html = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Relatório da Dieta Otimizada</title>
  <style>
    :root {
      --brand-green: #16a34a;
      --brand-green-dark: #157347;
      --brand-green-light: #f7faf5;
      --brand-gold: #ffe066;
      --brand-blue: #2f6476;
      --text-main: #253c4a;
      --header-bg: #e1ede1;
      --footer-bg: #f6f6fa;
      --table-head: #d6f2e2;
      --accent: #2d9c72;
      --danger: #e74c3c;
      --info: #5c76f6;
      --shadow: 0 2px 8px #e0f6e7;
    }
    body {
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      margin: 0;
      background: var(--brand-green-light);
      color: var(--text-main);
      font-size: 16px;
    }
    .container {
      margin: 0 auto;
      max-width: 900px;
      background: #fff;
      box-shadow: var(--shadow);
      border-radius: 1.2em;
      padding: 2.5em 2.2em 1.5em 2.2em;
    }
    header {
      background: var(--header-bg);
      border-radius: 1.2em 1.2em 0 0;
      padding: 1em 2em;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 1px 6px #d6e6d6;
      margin-bottom: 2em;
    }
    .logo {
      font-size: 2.1em;
      font-weight: 700;
      color: var(--accent);
      letter-spacing: 1.5px;
      display: flex;
      align-items: center;
      gap: 0.6em;
    }
    .title-main {
      font-weight: 600;
      font-size: 1.15em;
      color: var(--brand-green-dark);
      letter-spacing: 0.6px;
    }
    h1 {
      font-size: 2.1em;
      font-weight: 700;
      color: var(--brand-green-dark);
      margin-bottom: 0.25em;
      letter-spacing: 1px;
    }
    h2 {
      color: var(--accent);
      font-size: 1.25em;
      font-weight: 600;
      margin-top: 1.7em;
      margin-bottom: 0.3em;
      letter-spacing: 0.3px;
      border-bottom: 1.5px solid var(--brand-green);
      padding-bottom: 0.1em;
    }
      h3 {
      color: var(--accent);
      font-size: 1.25em;
      font-weight: 600;
      margin-top: 1.7em;
      margin-bottom: 0.3em;
      letter-spacing: 0.3px;
      border-bottom: 1.5px solid var(--brand-green);
      padding-bottom: 0.1em;
    }
    .animal-table, .nutr-table {
      margin: 1.3em auto 1.3em auto;
      border-radius: 0.7em;
      box-shadow: 0 1px 6px #e0f6e7;
      background: #fcfdfb;
    }
    .animal-table th, .nutr-table th {
      background: var(--table-head);
      color: var(--brand-green-dark);
      font-weight: 600;
      font-size: 1em;
    }
    .animal-table td, .nutr-table td {
      text-align: left;
      padding: 9px 13px;
      font-size: 1em;
    }
    .animal-table td.label {
      font-weight: 600;
      color: var(--brand-blue);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 22px 0;
      font-size: 1.01em;
      background: #fff;
      border-radius: 0.7em;
      overflow: hidden;
      box-shadow: 0 1px 8px #e0f6e7;
    }
    th, td {
      border: 1px solid #e1ede1;
      padding: 10px 8px;
      text-align: center;
      font-size: 1em;
    }
    th {
      background: var(--table-head);
      color: var(--brand-green-dark);
      font-weight: 600;
      letter-spacing: 0.2px;
    }
    tr.bold {
      font-weight: 700;
      background: #f7faf5;
      color: var(--accent);
    }
    .nutr-label {
      color: var(--info);
      font-weight: 600;
    }
    .highlight {
      color: var(--brand-green);
      font-weight: bold;
      font-size: 1.06em;
    }
    .footer {
      margin-top: 2.9em;
      background: var(--footer-bg);
      border-radius: 0 0 1.2em 1.2em;
      padding: 1.2em 2em;
      color: #7a869a;
      font-size: 1em;
      text-align: right;
      border-top: 1.5px solid #e1ede1;
      box-shadow: 0 -1px 6px #e0f6e7;
      font-style: italic;
      letter-spacing: 0.7px;
    }
    .brand {
      color: var(--accent);
      font-weight: 700;
      font-size: 1.09em;
    }
    .stamp {
      font-size: 0.97em;
      color: #aaa;
      margin-top: 0.5em;
    }
    @media (max-width: 650px) {
      .container { padding: 0.6em 0.2em 0.9em 0.2em; }
      header { padding: 0.9em 0.7em; }
      h1 { font-size: 1.25em; }
      h2 { font-size: 1.07em; }
      table { font-size: 0.92em; }
    }
    @media print {
      body { background: #fff !important; }
      .container { box-shadow: none !important; }
      header, .footer { box-shadow: none !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">
        <img src="logo.png" alt="Logo NutriSheep BR" class="" style="width: 4em; border-radius:4em; ">
       
        <span>Nutrição Animal</span>
      </div>
      <span class="title-main">Relatório de Dieta Otimizada</span>
    </header>

    <h1>Ficha Técnica da Dieta</h1>

    <h2>Dados do Animal e Rebanho</h2>
    <table class="animal-table">
      <tbody>
        <tr><td class="label">Espécie:</td><td>${especieLabel}</td></tr>
        <tr><td class="label">Raça:</td><td>${racaLabel || '-'}</td></tr>
        <tr><td class="label">Categoria:</td><td>${categoriaLabel || '-'}</td></tr>
        <tr><td class="label">Fase:</td><td>${faseLabel || '-'}</td></tr>
        <tr><td class="label">Peso Vivo (PV):</td><td>${pv ? pv + " kg" : '-'}</td></tr>
        <tr><td class="label">Ganho de Peso Diário (GMD):</td><td>${gmd ? gmd + " kg/dia" : '-'}</td></tr>
        <tr><td class="label">Consumo de Matéria Seca (por animal):</td><td>${consumoMSAnimal ? consumoMSAnimal.toFixed(2) + " kg/dia" : '-'}</td></tr>
        <tr><td class="label">Animais no rebanho:</td><td>${numAnimais || '-'}</td></tr>
        <tr><td class="label">Consumo total de MS no lote:</td><td>${(consumoMSLote ? consumoMSLote.toFixed(2) : '-')} kg/dia</td></tr>
        <tr><td class="label">Consumo total de Matéria Natural no lote (estimado):</td><td>${(consumoMNTotalLote ? consumoMNTotalLote.toFixed(2) : '-')} kg/dia</td></tr>
      </tbody>
    </table>

    <h2>Composição da Mistura (proporção para 100 kg de Matéria Seca)</h2>
    <table>
      <thead>
        <tr>
          <th>Ingrediente</th>
          <th>kg<br>(Matéria Seca)</th>
          <th>kg<br>(Matéria Natural)</th>
          <th>Custo por ingrediente<br>(R$ na MS)</th>
        </tr>
      </thead>
      <tbody>
        ${linhas100.map(l=>`
          <tr>
            <td>${l.ingrediente}</td>
            <td>${l.kgMS.toFixed(2)}</td>
            <td>${l.kgNat.toFixed(2)}</td>
            <td>R$ ${l.custoPropMS.toFixed(2)}</td>
          </tr>`).join("")}
        <tr class="bold">
          <td>Total</td>
          <td>${(linhas100.reduce((a, b) => a + b.kgMS, 0)).toFixed(2)}</td>
          <td>${totalKgNat100.toFixed(2)}</td>
          <td>R$ ${totalCustoMS100.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <h2>Proporção dos Ingredientes no Consumo Total de Matéria Natural do Lote</h2>
    <table>
      <thead>
        <tr>
          <th>Ingrediente</th>
          <th>kg (MN no lote/dia)</th>
          <th>% no total de MN</th>
        </tr>
      </thead>
      <tbody>
        ${proporcoesMNIngredientes.map(row => `
          <tr>
            <td>${row.nome}</td>
            <td>${row.mnIngredienteLote.toFixed(2)}</td>
            <td>${row.pctMN.toFixed(2)}%</td>
          </tr>
        `).join("")}
        <tr class="bold">
          <td>Total</td>
          <td>${consumoMNTotalLote.toFixed(2)}</td>
          <td>100.00%</td>
        </tr>
      </tbody>
    </table>

    <h2>Resumo Nutricional e Custos da Dieta</h2>
    <table class="nutr-table" style="width:70%;margin:auto;">
      <tbody>
        <tr><td class="nutr-label">PB (%MS):</td><td>${resumo.pb || ''}</td></tr>
        <tr><td class="nutr-label">NDT (%MS):</td><td>${resumo.ndt || ''}</td></tr>
        <tr><td class="nutr-label">Ca (%MS):</td><td>${resumo.ca || ''}</td></tr>
        <tr><td class="nutr-label">P (%MS):</td><td>${resumo.p || ''}</td></tr>
        <tr><td class="nutr-label">Relação Ca/P:</td><td>${resumo.relacao_ca_p || ''}</td></tr>
        <tr><td class="nutr-label">Custo total da dieta (R$/Kg):</td><td> R$ ${((totalCustoMS100)/100).toFixed(2) || ''}</td></tr>
      </tbody>
    </table>

    <div class="stamp">
      <span class="brand">AgroCrat Nutrição Animal</span> &mdash; Relatório gerado em: ${new Date().toLocaleString('pt-BR')}
    </div>

    <div class="footer">
      <span>
        Relatório profissional gerado por AgroCrat LTDA | Soluções em Nutrição Animal <br>
        Contato: agrocrat.ltda@gmail.com &nbsp;|&nbsp; www.agrocrat.com.br
      </span>
    </div>
  </div>
  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>
  `.trim();

  let win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
}


// ---- Botões de exportar  ----
document.getElementById('exportar-btn').onclick = exportarPDF;
document.getElementById('mistura-btn').onclick = exportarMisturaPDF;

// ---- Inicialização ----
atualizarTabelaIngredientes();
preencherLimitesUI();
