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
    
    </div>
      <div class="col-12 col-sm-6">
        <div class="result-card bg-mineral mb-2">
            ${tabelaMinerais(minerais)}
          </div>
       </div>
       <div class="col-12 col-sm-6">
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
