// Gera a apostila em PDF a partir de src/data.js.
// Uso: node scripts/gerar-pdf.js  (requer Playwright com Chromium)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const ctx = {};
new Function('ctx', fs.readFileSync(path.join(root, 'src/data.js'), 'utf8') +
  ';ctx.DISC=DISC;ctx.CYCLE=CYCLE;ctx.GUIDES=GUIDES;ctx.QB=QB;ctx.UPDATES=UPDATES;ctx.ESSAYS=ESSAYS;ctx.ESSAY_GUIDE=ESSAY_GUIDE;ctx.PHASE_GOALS=PHASE_GOALS;')(ctx);
const { DISC, CYCLE, GUIDES, QB, UPDATES, ESSAYS, ESSAY_GUIDE, PHASE_GOALS } = ctx;

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const L = 'ABCDE';
const ORDER = ['lgpd', 'anpd', 'digital', 'reg', 'ti', 'adm', 'const', 'etica', 'port', 'ing'];
const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

// numeração global das questões, na ordem das disciplinas
const qs = [];
ORDER.forEach(d => QB.filter(q => q.d === d).forEach(q => qs.push(q)));
qs.forEach((q, i) => q.n = i + 1);

const css = `

.links { font-size: 9pt; background: #EEF1F7; padding: 2.5mm 3.5mm; border-radius: 1.5mm; margin-bottom: 4mm; break-inside: avoid; }
.links ul { margin: 1mm 0 0; } .links .url { font-family: "JetBrains Mono", monospace; font-size: 7.5pt; color: #1C3AA9; word-break: break-all; }
.essay { border-top: 0.5pt solid #CBD2DE; padding-top: 2mm; }
.lines div { border-bottom: 0.5pt solid #CBD2DE; height: 7.5mm; position: relative; }
.lines span { position: absolute; left: -6mm; bottom: 1mm; font-family: "JetBrains Mono", monospace; font-size: 7pt; color: #8A93A6; }
.lines { margin-left: 6mm; }
.sheet td { height: 9mm; }
@page { size: A4; margin: 18mm 17mm 20mm 17mm; }
* { box-sizing: border-box; }
body { font-family: "Bitstream Charter", "Caladea", Georgia, serif; font-size: 10.5pt; line-height: 1.5; color: #141C2B; margin: 0; }
h1, h2, h3, h4, .sans { font-family: "Inter", "DejaVu Sans", sans-serif; }
h1 { font-size: 22pt; margin: 0 0 4mm; letter-spacing: -0.01em; color: #1C3AA9; }
h2 { font-size: 14pt; margin: 7mm 0 2mm; color: #141C2B; break-after: avoid; }
h3 { font-size: 11.5pt; margin: 5mm 0 1.5mm; break-after: avoid; }
p { margin: 0 0 2.5mm; }
ul, ol { margin: 0 0 3mm; padding-left: 5.5mm; }
li { margin-bottom: 1mm; }
.mono, .ref { font-family: "JetBrains Mono", "DejaVu Sans Mono", monospace; }
.ref { font-size: 8pt; background: #EEF1F7; padding: 0.3mm 1.5mm; border-radius: 1mm; white-space: nowrap; }
.eyebrow { font-family: "Inter", sans-serif; font-size: 8pt; letter-spacing: .12em; text-transform: uppercase; color: #5A6478; }
.chapter { break-before: page; }
.chapter-head { border-bottom: 1.5pt solid #1C3AA9; padding-bottom: 3mm; margin-bottom: 4mm; }
.lead { font-size: 11pt; color: #3A4458; }
.topic { break-inside: avoid; margin-bottom: 4mm; }
.trap { font-size: 9.5pt; border-left: 2.5pt solid #B7791F; background: #FBF3E4; padding: 1.5mm 3mm; margin-top: 1.5mm; }
.trap b { font-family: "Inter", sans-serif; color: #8A5A10; }
table { border-collapse: collapse; width: 100%; font-size: 9.5pt; margin-bottom: 4mm; }
th, td { text-align: left; padding: 1.6mm 2mm; border-bottom: 0.5pt solid #CBD2DE; vertical-align: top; }
th { font-family: "Inter", sans-serif; font-size: 7.5pt; letter-spacing: .08em; text-transform: uppercase; color: #5A6478; }
.check { display: inline-block; width: 3.2mm; height: 3.2mm; border: 0.8pt solid #5A6478; margin-right: 2mm; vertical-align: -0.4mm; }
/* capa */
.cover { height: 255mm; display: flex; flex-direction: column; justify-content: space-between; }
.cover .band { background: #1C3AA9; color: #fff; padding: 14mm 12mm; border-radius: 3mm; }
.cover .band h1 { color: #fff; font-size: 34pt; margin: 2mm 0 3mm; }
.cover .band .eyebrow { color: #C9D3F5; }
.cover .band p { font-family: "Inter", sans-serif; font-size: 12pt; color: #E3E8FA; margin: 0; }
.cover .meta { font-family: "Inter", sans-serif; font-size: 9.5pt; color: #3A4458; }
.toc { list-style: none; padding: 0; font-family: "Inter", sans-serif; font-size: 10pt; }
.toc li { display: flex; gap: 3mm; padding: 1.3mm 0; border-bottom: 0.5pt dotted #CBD2DE; }
.toc .num { font-family: "JetBrains Mono", monospace; color: #1C3AA9; width: 8mm; }
/* questões */
.q { break-inside: avoid; margin-bottom: 3.5mm; }
.q .head { font-family: "Inter", sans-serif; font-size: 8pt; color: #5A6478; margin-bottom: 0.6mm; }
.q .head b { color: #1C3AA9; font-size: 9pt; }
.q .stmt { margin: 0 0 1mm; }
.q .opts { list-style: none; padding-left: 4mm; margin: 0; }
.q .opts li { margin-bottom: 0.5mm; }
.q .ce { font-family: "Inter", sans-serif; font-size: 8.5pt; color: #3A4458; }
.ans { break-inside: avoid; font-size: 9.5pt; padding: 1.4mm 0; border-bottom: 0.5pt solid #E1E6EF; }
.ans b { font-family: "Inter", sans-serif; }
.ans .g { font-family: "Inter", sans-serif; font-weight: 700; color: #1D7F47; }
.grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 1mm; font-family: "JetBrains Mono", monospace; font-size: 8pt; margin-bottom: 5mm; }
.grid span { border: 0.5pt solid #CBD2DE; padding: 1mm; text-align: center; }
.note { font-size: 9pt; color: #5A6478; }
`;

let h = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Apostila Rota ANPD</title><style>${css}</style></head><body>`;

// Capa
h += `<section class="cover">
  <div class="band"><div class="eyebrow">Concurso ANPD · Especialista em Regulação de Proteção de Dados</div>
    <h1>Apostila Rota ANPD</h1>
    <p>Guias de estudo, normas atualizadas, plano diário e ${qs.length} questões comentadas no padrão Cebraspe, FGV e IADES.</p></div>
  <div class="meta"><p><b>Preparado para:</b> Jullio</p><p><b>Atualizado em:</b> ${hoje}</p>
    <p class="note">Material de estudo pré-edital. O edital e a banca do concurso efetivo ainda não foram publicados. Confira sempre o texto oficial das normas em planalto.gov.br e gov.br/anpd. As questões foram elaboradas no estilo das bancas a partir dos temas mais cobrados; não são reproduções de provas.</p>
    <p class="note">App interativo: https://rota-anpd.vercel.app</p></div>
</section>`;

// Sumário
const chapters = [['1', 'Como usar esta apostila e plano diário'], ['2', 'Situação do concurso e novidades normativas']];
ORDER.forEach((d, i) => chapters.push([String(i + 3), 'Guia: ' + DISC[d].n]));
const qCh = ORDER.length + 3;
chapters.push([String(qCh), 'Caderno de questões'], [String(qCh + 1), 'Gabarito comentado'], [String(qCh + 2), 'Parte escrita: redação e repertório'], [String(qCh + 3), 'Medidor de evolução: metas e acompanhamento'], [String(qCh + 4), 'Checklist de revisão']);
h += `<section class="chapter"><div class="chapter-head"><div class="eyebrow">Sumário</div><h1>Conteúdo</h1></div><ul class="toc">${chapters.map(c => `<li><span class="num">${c[0]}</span><span>${esc(c[1])}</span></li>`).join('')}</ul></section>`;

// 1. Plano
h += `<section class="chapter"><div class="chapter-head"><div class="eyebrow">Capítulo 1</div><h1>Como usar esta apostila</h1></div>
<p class="lead">Estude pelo ciclo, não pelo calendário. Cada sessão cobre um tópico do guia; ao terminar, faça as questões da disciplina no caderno e confira no gabarito.</p>
<h2>Rotina diária (2 horas)</h2>
<table><tr><th>Etapa</th><th>Tempo</th><th>O que fazer</th></tr>
<tr><td>Bloco 1 do ciclo</td><td>40 min</td><td>Ler o tópico no guia, resumir em 5 linhas, marcar os artigos na lei seca.</td></tr>
<tr><td>Bloco 2 do ciclo</td><td>40 min</td><td>Próxima sessão do ciclo, mesma técnica.</td></tr>
<tr><td>Questões</td><td>20 min</td><td>10 questões do caderno, sem consulta. Leia o comentário de todas, inclusive das que acertou.</td></tr>
<tr><td>Revisão de erros</td><td>15 min</td><td>Refaça as questões erradas depois de 1, 3, 7 e 21 dias.</td></tr></table>
<p class="note">Dia difícil: versão mínima de 30 minutos (10 questões + 10 minutos de lei seca). Ela mantém a sequência.</p>
<h2>Ciclo de estudos (${CYCLE.length} sessões)</h2>
<table><tr><th>#</th><th>Disciplina</th><th>#</th><th>Disciplina</th><th>#</th><th>Disciplina</th></tr>
${Array.from({ length: 7 }, (_, r) => `<tr>${[0, 7, 14].map(o => { const i = r + o; return `<td class="mono">${String(i + 1).padStart(2, '0')}</td><td><span class="check"></span>${esc(DISC[CYCLE[i]].s)}</td>`; }).join('')}</tr>`).join('')}</table>
<h2>Fases da preparação</h2>
<table><tr><th>Semanas</th><th>Fase</th><th>Meta</th></tr>
<tr><td>1–6</td><td>Fundamentos</td><td>LGPD completa, base de Administrativo, Constitucional e Regulação. 70 questões por semana, acerto acima de 60%.</td></tr>
<tr><td>7–12</td><td>Aprofundamento</td><td>Resoluções da ANPD, ECA Digital, Marco Civil, TI. Uma redação por semana. 100 questões por semana, acerto acima de 70%.</td></tr>
<tr><td>13–20</td><td>Edital</td><td>Ajustar ao conteúdo oficial e ao estilo da banca. Simulado longo aos domingos.</td></tr>
<tr><td>Últimas 4–6</td><td>Reta final</td><td>Só revisão, lei seca e simulados cronometrados.</td></tr></table>
<h2>Regras para não desistir</h2>
<ol><li><b>Nunca zere o dia.</b> 30 minutos contam mais do que um sábado de 8 horas seguido de uma semana parada.</li>
<li><b>Siga o ciclo.</b> Faltou? Continue de onde parou.</li>
<li><b>Abaixo de 70% de acerto,</b> a prioridade é revisão, não conteúdo novo.</li>
<li><b>No Cebraspe, cada erro anula um acerto.</b> Em dúvida real, deixe em branco.</li>
<li><b>Lei seca é obrigatória.</b> LGPD, Lei 13.848 e resoluções da ANPD caem pela letra da lei.</li></ol>
</section>`;

// 2. Novidades
h += `<section class="chapter"><div class="chapter-head"><div class="eyebrow">Capítulo 2</div><h1>Situação do concurso e novidades</h1></div>
<table><tr><th>Quando</th><th>O quê</th></tr>${UPDATES.map(u => `<tr><td class="mono" style="white-space:nowrap">${esc(u.d)}</td><td><b class="sans">${esc(u.t)}</b><br>${esc(u.b)}<br><span class="note">Fontes: ${u.src.map(s => esc(s[0]) + ' (' + esc(s[1]) + ')').join('; ')}</span></td></tr>`).join('')}</table></section>`;

// 3+. Guias
ORDER.forEach((d, i) => {
  const g = GUIDES[d];
  h += `<section class="chapter"><div class="chapter-head"><div class="eyebrow">Capítulo ${i + 3} · ${QB.filter(q => q.d === d).length} questões no caderno</div><h1>${esc(DISC[d].n)}</h1></div>
  <p class="lead">${esc(g.cai)}</p>
  ${g.links ? `<div class="links"><b class="sans">Onde estudar (fontes oficiais)</b><ul>${g.links.map(l => `<li>${esc(l[0])}: <span class="url">${esc(l[1])}</span></li>`).join('')}</ul></div>` : ''}
  ${g.topics.map((t, j) => `<div class="topic"><h3><span class="check"></span>${i + 3}.${j + 1} ${esc(t.t)}</h3><ul>${t.b.map(b => `<li>${esc(b)}</li>`).join('')}</ul><div class="trap"><b>Pegadinha:</b> ${esc(t.p)}</div></div>`).join('')}
  </section>`;
});

// Caderno de questões
h += `<section class="chapter"><div class="chapter-head"><div class="eyebrow">Capítulo ${qCh}</div><h1>Caderno de questões</h1></div>
<p class="lead">${qs.length} questões organizadas por disciplina. Nas de certo/errado, julgue o item. Marque suas respostas na folha da página seguinte ao fim de cada bloco e confira no gabarito comentado.</p>`;
ORDER.forEach(d => {
  const list = qs.filter(q => q.d === d);
  h += `<h2>${esc(DISC[d].n)} · questões ${list[0].n}–${list[list.length - 1].n}</h2>`;
  list.forEach(q => {
    h += `<div class="q"><div class="head"><b>${q.n}.</b> Estilo ${esc(q.e)} · ${q.t === 'ce' ? 'Certo ou Errado' : 'Múltipla escolha'}</div><p class="stmt">${esc(q.q)}</p>${q.t === 'me' ? `<ul class="opts">${q.o.map((o, k) => `<li><b class="sans">${L[k]})</b> ${esc(o)}</li>`).join('')}</ul>` : `<div class="ce">( ) Certo&nbsp;&nbsp;&nbsp;( ) Errado</div>`}</div>`;
  });
});
h += `</section>`;

// Gabarito
const gab = q => q.t === 'ce' ? (q.a ? 'C' : 'E') : L[q.a];
h += `<section class="chapter"><div class="chapter-head"><div class="eyebrow">Capítulo ${qCh + 1}</div><h1>Gabarito comentado</h1></div>
<h2>Gabarito rápido</h2><div class="grid">${qs.map(q => `<span>${q.n}·${gab(q)}</span>`).join('')}</div>
<h2>Comentários</h2>${qs.map(q => `<div class="ans"><b>${q.n}.</b> <span class="g">${gab(q)}</span> · ${esc(q.c)} <span class="ref">${esc(q.r)}</span></div>`).join('')}</section>`;

// Parte escrita
const EG = ESSAY_GUIDE;
h += `<section class="chapter"><div class="chapter-head"><div class="eyebrow">Capítulo ${qCh + 2}</div><h1>Parte escrita: redação e repertório</h1></div>
<p class="lead">${esc(EG.aviso)}</p>
<h2>Estrutura do texto (20 a 30 linhas)</h2><ol>${EG.estrutura.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
<h2>Checklist de correção</h2><ul>${EG.criterios.map(x => `<li><span class="check"></span>${esc(x)}</li>`).join('')}</ul>
<h2>Banco de repertório</h2>
<table><tr><th>Tipo</th><th>Repertório</th></tr>${EG.repertorio.map(r => `<tr><td class="sans" style="white-space:nowrap">${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</table>
<h2>Temas prováveis com roteiro</h2>
${EG.temas.map((t, k) => `<div class="topic essay"><h3>Tema ${k + 1}. ${esc(t.t)}</h3>
<p><b class="sans">Tópicos:</b> ${t.topicos.map(esc).join('; ')}.</p>
<p><b class="sans">Normas para citar:</b> ${t.normas.map(n => `<span class="ref">${esc(n)}</span>`).join(' ')}</p>
<p><b class="sans">Argumentos:</b></p><ul>${t.args.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
<p><b class="sans">Proposta de conclusão:</b> ${esc(t.proposta)}</p>
<p class="note">Feito em: ____/____/______ · Nota de conteúdo: ____ · Nota de expressão: ____</p></div>`).join('')}
<h2>Folha de rascunho</h2><div class="lines">${Array.from({ length: 30 }, (_, k) => `<div><span>${k + 1}</span></div>`).join('')}</div>
</section>`;

// Medidor
const fases = ['Fundamentos (sem. 1–6)', 'Aprofundamento (sem. 7–12)', 'Edital (sem. 13–20)', 'Reta final'];
h += `<section class="chapter"><div class="chapter-head"><div class="eyebrow">Capítulo ${qCh + 3}</div><h1>Medidor de evolução</h1></div>
<p class="lead">O app calcula estes números sozinho na aba Relatório. Esta folha serve para acompanhar à mão, toda semana, no check-in de domingo.</p>
<h2>Índice de prontidão (0 a 100)</h2>
<table><tr><th>Componente</th><th>Peso</th><th>Como medir</th></tr>
<tr><td>Cobertura do conteúdo</td><td>30</td><td>Tópicos dominados ÷ total de tópicos dos guias</td></tr>
<tr><td>Acerto ponderado</td><td>40</td><td>Acerto de cada disciplina ÷ 80%, ponderado pelo peso no ciclo</td></tr>
<tr><td>Consistência</td><td>20</td><td>Dias com meta cumprida nos últimos 14 dias</td></tr>
<tr><td>Volume</td><td>10</td><td>Questões respondidas ÷ 1.000</td></tr></table>
<p>Faixas: 0–24 base em construção · 25–49 em desenvolvimento · 50–69 competitivo · 70–84 aprovável · 85+ pronto para a prova.</p>
<h2>Metas semanais por fase</h2>
<table><tr><th>Fase</th><th>Questões/semana</th><th>Dias com meta</th><th>Acerto mínimo</th><th>Redações</th></tr>
${PHASE_GOALS.map((g, k) => `<tr><td>${fases[k]}</td><td>${g.q}</td><td>${g.days} de 7</td><td>${Math.round(g.acc * 100)}%</td><td>${g.essays}</td></tr>`).join('')}</table>
<h2>Marcos</h2><ul>${['Primeiro simulado completo', '100 questões respondidas', '500 questões respondidas', '1.000 questões respondidas', '7 dias seguidos de meta', '30 dias seguidos de meta', 'Primeira volta completa do ciclo', 'Todos os tópicos de LGPD dominados', 'LGPD com 75% de acerto (mín. 30 questões)', 'Primeira redação concluída', 'Acerto geral de 70% (mín. 200 questões)'].map(m => `<li><span class="check"></span>${m}</li>`).join('')}</ul>
<h2>Planilha semanal (12 semanas)</h2>
<table class="sheet"><tr><th>Sem.</th><th>Início</th><th>Questões</th><th>Acerto</th><th>Dias com meta</th><th>Redações</th><th>Tópicos dominados</th><th>Índice</th><th>Disciplina mais fraca</th></tr>
${Array.from({ length: 12 }, (_, k) => `<tr><td class="mono">${k + 1}</td>${'<td></td>'.repeat(8)}</tr>`).join('')}</table>
<h2>Regras de ajuste</h2><ul>
<li>Acerto abaixo de 60% por 2 semanas: reduza teoria nova e dobre a revisão de erros.</li>
<li>Menos de 4 dias com meta: reduza o tempo diário para algo que você cumpra todo dia.</li>
<li>Uma disciplina abaixo de 55%: releia o guia dela e faça 2 treinos extras na semana.</li>
<li>Índice estagnado por 3 semanas: troque a técnica (resumo → questões comentadas, lei seca em voz alta).</li></ul>
</section>`;

// Checklist
h += `<section class="chapter"><div class="chapter-head"><div class="eyebrow">Capítulo ${qCh + 4}</div><h1>Checklist de revisão</h1></div>
<p class="lead">Marque o tópico quando acertar pelo menos 4 de 5 questões sobre ele.</p>
<table><tr><th>Disciplina</th><th>Tópico</th><th>1ª rev.</th><th>2ª rev.</th><th>3ª rev.</th></tr>${ORDER.map(d => GUIDES[d].topics.map((t, j) => `<tr><td>${j === 0 ? esc(DISC[d].s) : ''}</td><td>${esc(t.t)}</td><td><span class="check"></span></td><td><span class="check"></span></td><td><span class="check"></span></td></tr>`).join('')).join('')}</table></section>`;

h += `</body></html>`;

(async () => {
  const out = path.join(root, 'docs/apostila-rota-anpd.pdf');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent(h, { waitUntil: 'load' });
  await p.pdf({ path: out, format: 'A4', printBackground: true, displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: '<div style="font-family:Inter,sans-serif;font-size:7pt;color:#5A6478;width:100%;padding:0 17mm;display:flex;justify-content:space-between"><span>Apostila Rota ANPD · Jullio</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
    margin: { top: '18mm', bottom: '20mm', left: '17mm', right: '17mm' } });
  await b.close();
  console.log('PDF gerado:', out, qs.length, 'questões');
})();
