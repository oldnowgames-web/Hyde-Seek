"use strict";
/* Conteúdo do jogo: provas, cenas com pontos clicáveis, diálogos e o quadro de dedução. */

const ITEMS = {
  telegrama: { n: "Telegrama da Yard", d: "“Sir Danvers Carew, deputado, achado morto à 01h na Rua Soho. Espancado com bastão. Criada diz ter visto o assassino. Corpo no necrotério. Compareça. — Comissário Newcomen”" },
  casaco: { n: "Meu casaco cinza", d: "Barra dura de lama seca: cal e carvão. Falta o terceiro botão, arrancado com força." },
  suporte: { n: "Suporte de bengalas vazio", d: "Falta a bengala de ébano com anel de prata que o Dr. Lanyon me deu em 1884. Sumiu há dias." },
  relatorio: { n: "Meu último relatório", d: "Assinado de punho. Letra inclinada para trás, o “S” em laço, o “y” com cauda longa." },
  bilhete_hyde: { n: "Bilhete de Hyde", d: "“Não tenho pena nenhuma. — E. Hyde.” Letra inclinada para trás, laços generosos." },
  bengala_metade: { n: "Metade da bengala de ébano", d: "Parte inferior, com sangue seco. No anel de prata da fratura, letras gastas: “…H. Lanyon, 1884”." },
  depoimento_criada: { n: "Depoimento da Srta. Hobbs", d: "Homem pequeno e pálido, riso que gela. Algo deformado que ninguém sabe explicar. Roupas largas demais, mangas cobrindo as mãos." },
  laudo: { n: "Laudo do legista", d: "Hora da morte: 00h40. Quatorze golpes de bastão duro, de baixo para cima: o agressor era bem mais baixo que a vítima. Força desproporcional ao corpo." },
  botao: { n: "Botão de lã cinza", d: "Arrancado da mão fechada de Carew. Botão de casaco, de boa alfaiataria." },
  carta_lacrada: { n: "Carta lacrada de Lanyon", d: "Lacre vermelho. “Ao Inspetor H. Seek — somente em mãos próprias.” Do Dr. H. Lanyon, morto há três semanas. Ainda não tive coragem de abri-la." },
  depoimento_tom: { n: "Depoimento de Tom", d: "“Toda noite entra um cavalheiro alto, de chapéu. Sai sempre um baixinho, de roupa folgada. Nunca vi os dois juntos. Nunca.”" },
  chave_marrom: { n: "Chave da Porta Marrom", d: "Chave de latão, nova, bem cuidada. O baixinho a derrubou na fuga." },
  registro_guarda: { n: "Livro de registro da Prisão", d: "“Saída 23h10 — Insp. H. Seek (ronda). Entrada 05h02 — desconhecido, com chave e distintivo do Insp. Seek. Saída 06h40, pela escada dos fundos.”" },
  depoimento_enfield: { n: "Depoimento de Enfield", d: "Há três anos viu um homenzinho pisotear uma menina com a calma de quem pisa na grama. Ódio imediato, sem razão: algo disforme que ninguém descreve. Pagou a família com o cheque de um doutor respeitável." },
  recibo: { n: "Pedido ao boticário", d: "Encomenda mensal de “sal cristalino, primeira remessa”. Papel de receituário sem timbre, assinado “Dr. H.”, letra inclinada para trás." },
  diario: { n: "Caderno do laboratório", d: "Página rasgada: “O sal novo não funciona; sem a impureza do primeiro lote, nada acontece. Quando bebo, o corpo encolhe e o mundo fica leve. Ele ri. É mais jovem que eu. É livre. Esse é o pior.”" },
  chave_gaveta: { n: "Chavinha de latão", d: "Etiqueta: “Gaveta — escritório, Yard.” Uma cópia." },
  frasco: { n: "Frasco com a última dose", d: "Líquido escuro, quase nada. Rótulo à mão: “Última. Beba só se não houver outro caminho.” Pesa mais do que devia: talvez seja uma saída que a Yard não conhece, e que muda o fim do caso." }
};

const REQUIRED = ["depoimento_criada", "depoimento_enfield", "depoimento_tom", "registro_guarda", "bilhete_hyde", "relatorio", "bengala_metade", "suporte", "botao", "casaco", "recibo", "diario", "carta_lacrada"];

const QUESTIONS = [
  { ask: "Como é Hyde, e o que ninguém consegue explicar nele?", need: ["depoimento_criada", "depoimento_enfield"], ok: "Hyde é pequeno e provoca uma repulsa sem explicação. Veste roupas largas demais, como se fossem de outro homem." },
  { ask: "Como Hyde vai e vem sem que ninguém o veja chegar?", need: ["depoimento_tom", "registro_guarda"], ok: "Um cavalheiro alto entra pela Porta Marrom; quem sai é o baixinho. E o baixinho entrou na Yard com a minha chave e o meu distintivo." },
  { ask: "De quem é a mão que escreve os bilhetes?", need: ["bilhete_hyde", "relatorio"], ok: "A letra de Hyde é a minha letra. Mesma inclinação, mesmos laços." },
  { ask: "De quem era a arma?", need: ["bengala_metade", "suporte"], ok: "A arma é a bengala de ébano que Lanyon me deu. Falta no meu suporte." },
  { ask: "De quem é o botão que Carew arrancou?", need: ["botao", "casaco"], ok: "O botão na mão da vítima é do meu casaco." },
  { ask: "De onde vem Hyde?", need: ["recibo", "diario"], ok: "Hyde nasce de um sal e de uma tintura, comprados por um médico e preparados no laboratório da minha antiga clínica." }
];

const look = (label, r, lines, more = {}) => Object.assign({ label, r, act() { G.say(lines); } }, more);
const exitHot = (label = "Sair (abrir o mapa)") => ({ label, r: [520, 570, 240, 70], act() { G.map(); } });

const SCENES = {
  escritorio: {
    name: "Escritório — Scotland Yard", outdoor: false,
    intro: [
      "Quinta-feira, 7 de outubro de 1886. Seis da manhã. Acordei na poltrona do escritório, com a cabeça latejando, um gosto amargo na boca e as mangas da camisa enroladas.",
      "A noite de ontem é uma mancha em branco. Tem sido assim ultimamente. O trabalho, penso. O trabalho consome a gente.",
      "Há um telegrama sobre a mesa."
    ],
    again: "Meu escritório. O cheiro de tabaco velho e papel úmido.",
    hot: [
      { label: "Casaco", r: [25, 175, 115, 430], act() {
        if (!G.has("casaco")) { G.give("casaco"); G.say(["Meu casaco cinza. A barra está dura de lama seca: cal e carvão, pelo cheiro. E falta o terceiro botão, arrancado com força.", "Da ronda de ontem, suponho. Só que não me lembro de ter saído depois das dez."]); }
        else G.say("O casaco cinza, ainda úmido. Falta o terceiro botão.");
      } },
      look("Janela", [145, 85, 260, 320], "A névoa amarela de Londres cola nos vidros. Lá embaixo passa uma carroça. Ninguém olha para cima. Ninguém nunca olha para cima."),
      { label: "Quadro do caso", r: [440, 90, 270, 210], act() { G.board(); } },
      look("Diploma", [730, 120, 120, 86], "“Universidade de Edimburgo — Henry Seek, Doutor em Medicina.” Larguei a medicina pela polícia há seis anos. Dizem que um médico faz um bom detetive: aprende a olhar o que as pessoas escondem."),
      { label: "Porta para a rua", r: [880, 110, 130, 380], act() { G.map(); } },
      { label: "Espelho", r: [1050, 110, 160, 480], act() {
        G.say(G.f("final") ? "O espelho. Dois homens me olham. Um deles sorri." : "O espelho de corpo inteiro que veio com a sala. Tenho evitado olhá-lo. O homem que me devolve o olhar tem cansaço demais nos olhos.");
      } },
      { label: "Telegrama", r: [470, 380, 90, 34], show: () => !G.has("telegrama"), act() {
        G.give("telegrama"); G.unlock("soho"); G.unlock("necro");
        G.say(["“Sir Danvers Carew, deputado, achado morto à 01h na Rua Soho. Espancado com bastão.”", "Carew. Um homem decente. Outra vez Hyde: três mortes em onze semanas, e a imprensa já deu um nome ao fantasma, por causa dos bilhetes que ele deixa assinados: E. Hyde.", "O corpo está no necrotério, aqui no porão. A cena do crime, na Rua Soho. Abro o mapa quando estiver pronto."]);
      } },
      { label: "Relatórios", r: [590, 376, 100, 36], show: () => !G.has("relatorio"), act() {
        G.give("relatorio"); G.say("Meu último relatório, assinado de punho. Guardo sempre uma cópia, por hábito. Hoje ela serve de prova de comparação.");
      } },
      { label: "Gaveta trancada", r: [655, 448, 160, 56], act() {
        if (G.f("gaveta_aberta")) G.say("A gaveta aberta. Vazia agora.");
        else if (G.has("chave_gaveta")) { G.set("gaveta_aberta"); G.give("frasco"); G.say(["A chavinha gira sem resistência.", "Dentro, sozinho no fundo da gaveta, um frasco com um resto de líquido escuro. No rótulo, à mão: “Última. Beba só se não houver outro caminho.”", "Quem trancou isto aqui? Quem teve acesso à minha mesa?", "O frasco pesa mais do que devia. Parece uma saída que a Yard não conhece: algo que muda o fim do caso."]); }
        else G.say("A gaveta de baixo está trancada. Não encontro a chave há meses. Eu mesmo a tranquei, creio.");
      }, use: { chave_gaveta() { G.set("gaveta_aberta"); G.give("frasco"); G.say(["A chavinha gira sem resistência.", "Dentro, um frasco com um resto de líquido escuro. “Última. Beba só se não houver outro caminho.”", "Quem trancou isto aqui?", "O frasco pesa mais do que devia. Parece uma saída que muda o fim do caso."]); } } },
      { label: "Suporte de bengalas", r: [320, 430, 80, 170], act() {
        if (!G.has("suporte")) { G.give("suporte"); G.say(["O suporte de bengalas. Dois guarda-chuvas e um vão vazio: falta a bengala de ébano com anel de prata, presente do Dr. Lanyon em 1884.", "Sumiu há dias. Ou roubaram, ou perdi. Qualquer das duas coisas me incomoda."]); }
        else G.say("O vão vazio onde ficava a bengala de Lanyon.");
      } }
    ]
  },

  soho: {
    name: "Rua Soho — Local do crime", outdoor: true,
    intro: ["A Rua Soho às sete da manhã tem cara de quem não dormiu. A polícia isolou o lugar com cordas. O sangue ainda está fresco entre os paralelepípedos.", "Alguém acendeu uma vela na janela de cima. Alguém viu."],
    again: "A Rua Soho. O sangue já escureceu.",
    hot: [
      look("Contorno de giz", [480, 450, 380, 160], "O contorno de Sir Danvers Carew. Quatorze golpes, segundo o guarda de ronda. Quem faz isso não quer matar. Quer destruir."),
      look("Lampião quebrado", [296, 140, 70, 330], "O vidro do lampião está estilhaçado. Quem fez isso queria escuridão. Ou se incomodava com a luz sobre o rosto."),
      look("Pegadas", [900, 540, 170, 60], "Pegadas na lama de carvão: pequenas, afundadas só na ponta, com um arrasto de pano. Roupas largas demais, andar apressado. O assassino é menor do que o morto, muito menor."),
      { label: "Metade da bengala", r: [780, 560, 190, 40], show: () => !G.has("bengala_metade"), act() {
        G.give("bengala_metade");
        G.say(["Metade de uma bengala de ébano, partida ao meio pela violência dos golpes. Sangue seco na madeira. No anel de prata da fratura, letras gastas: “…H. Lanyon, 1884”.", "Lanyon. Meu amigo morreu há três semanas. A bengala se parece com a minha, mas há centenas iguais em Londres. Não há?"]);
      } },
      { label: "Bilhete amassado", r: [410, 584, 60, 40], show: () => !G.has("bilhete_hyde"), act() {
        G.give("bilhete_hyde");
        G.say(["Um bilhete amassado entre as pedras: “Não tenho pena nenhuma. — E. Hyde.”", "A letra inclinada para trás, os laços generosos... Alguma coisa nela me incomoda. Estou cansado."]);
      } },
      { label: "Janela da criada", r: [1040, 130, 110, 130], act() { G.talk("criada"); } },
      { label: "Beco escuro", r: [860, 120, 120, 350], act() {
        if (G.f("u_beco")) G.go("beco"); else G.say("Um beco escuro entre dois prédios. Não sei aonde leva. Talvez a testemunha saiba.");
      } },
      exitHot()
    ]
  },

  beco: {
    name: "Beco da Porta Marrom — Rua 2", outdoor: true,
    intro: ["Um beco estreito entre fachadas respeitáveis e uma construção sinistra: janelas sujas, nenhuma campainha, nenhuma aldrava.", "Uma só porta, sem pintura, de um marrom morto. Alguém a usa. A fechadura é nova, e cara."],
    again: "O beco. O mesmo cheiro de ferrugem e fuligem.",
    hot: [
      { label: "Porta marrom", r: [570, 240, 140, 232], act() {
        if (G.f("porta_aberta")) { G.go("lab"); return; }
        if (G.has("chave_marrom")) { G.say("Tento a chave de latão.", { done: () => G.openDoor() }); return; }
        G.say("A porta marrom. Sem campainha, sem aldrava. Trancada com uma fechadura nova, num prédio que parece cair aos pedaços.");
      }, use: { chave_marrom() { G.openDoor(); } } },
      { label: "Tom, o menino", r: [140, 500, 160, 130], act() { G.talk("tom"); } },
      look("Janelas altas", [440, 170, 420, 90], "Janelas altas, sujas de fuligem. Uma está entreaberta, alta demais para alcançar. Dentro, só escuridão."),
      { label: "Lata de lixo", r: [950, 500, 170, 130], act() {
        G.unlock("boticario");
        G.say(["Cacos de vidro: frascos pequenos, de farmacêutico. No rótulo rasgado: “MAW & FILHOS — Boticários — Old Compton St.”", "Quem joga fora tantos frascos vazios? Alguém que bebe o que há neles."]);
      } },
      { label: "Voltar à Rua Soho", r: [520, 570, 240, 70], act() { G.go("soho"); } }
    ]
  },

  lab: {
    name: "Laboratório — antiga clínica", outdoor: false,
    intro: [
      "Atravesso um pátio de pedra e entro num anfiteatro de dissecção abandonado. Bancadas, tubos, queimadores. Poeira por toda parte, exceto numa bancada. Essa foi usada ontem.",
      "Conheço este lugar. É a minha antiga clínica, onde eu trabalhava antes da Yard. Hyde trabalha na minha antiga clínica. Coincidência, digo a mim mesmo; é a palavra mais usada na Yard."
    ],
    again: "O laboratório. A poeira continua intacta, menos na bancada.",
    hot: [
      look("Bancada", [380, 330, 520, 100], "Tubos, queimador, uma balança de precisão. Um pó branco, cristalino, num prato. Cheira a amêndoa e ferrugem: sais que eu mesmo estudei na faculdade. Alguém sabia o que fazia."),
      { label: "Caderno", r: [420, 400, 90, 30], show: () => !G.has("diario"), act() {
        G.give("diario");
        G.say(["Um caderno encadernado em couro. Uma página rasgada, escrita às pressas:", "“O sal novo não funciona. Sem a impureza do primeiro lote, nada acontece. Quando bebo, o corpo encolhe e o mundo fica leve. Ele ri. É mais jovem que eu. É livre. Esse é o pior.”", "Um médico por trás de Hyde. Alguém que estudou onde eu estudei."]);
      } },
      { label: "Espelho", r: [1050, 110, 160, 480], act() { G.say("Um espelho de corpo inteiro, idêntico ao do meu escritório. Alguém comprou o par. Na moldura, marcas de unha."); } },
      look("Roupas dobradas", [120, 360, 120, 70], "Uma muda de roupas sobre a cadeira: calça, camisa, casaco, tudo grande demais para um homem pequeno. Mangas enroladas. Cheiro de fumaça e de lavanda. Um cheiro que conheço, e não sei de onde."),
      { label: "Gaveta da bancada", r: [780, 462, 110, 40], show: () => !G.has("chave_gaveta"), act() {
        G.give("chave_gaveta");
        G.say(["Dentro da gaveta, uma chavinha de latão com uma etiqueta: “Gaveta — escritório, Yard.”", "Serve a uma gaveta da Yard. A minha: a única que mantenho trancada. Alguém copiou a chave. Quem entrou no meu escritório?"]);
      } },
      { label: "Sair para o beco", r: [520, 570, 240, 70], act() { G.go("beco"); } }
    ]
  },

  necro: {
    name: "Necrotério — porão da Yard", outdoor: false,
    intro: ["O necrotério fica no porão da Yard. Luz de gás cinzenta, azulejos frios, cheiro de formol.", "Passei meus melhores anos de estudante aqui embaixo, de certo modo. E os piores de policial."],
    again: "O necrotério. O frio de sempre.",
    hot: [
      look("Armários de aço", [920, 110, 350, 360], "Gavetas de aço com etiquetas. Reconheço três nomes. A última, na letra de Poole: “Dr. H. Lanyon — arquivado”. Não me demoro nela."),
      { label: "Corpo de Carew", r: [350, 380, 260, 70], act() { G.say("Sir Danvers Carew, sessenta e sete anos. O rosto conserva uma polidez intacta, como se pedisse desculpas aos golpes. A mão direita está fechada em punho."); } },
      { label: "Mão direita", r: [570, 400, 70, 50], show: () => !G.has("botao"), act() {
        G.give("botao");
        G.say(["Abro os dedos de Carew, devagar. Na palma, um botão de casaco, de lã cinza, ainda com um fio de linha preta.", "Ele o arrancou do assassino na luta. Um botão de boa alfaiataria."]);
      } },
      { label: "Prancheta do legista", r: [70, 240, 100, 130], act() {
        if (!G.has("laudo")) { G.give("laudo"); G.say("Hora da morte: 00h40. Quatorze golpes de bastão duro, de baixo para cima: o agressor era bem mais baixo que a vítima. A força não bate com o corpo que a empregou."); }
        else G.say("A prancheta do legista. Já copiei o laudo.");
      } },
      { label: "Prateleira de pertences", r: [40, 110, 220, 80], act() {
        G.say(G.has("carta_lacrada") ? "A caixa de pertences de Carew. Vazia agora." : "A caixa de pertences. Poole zela por ela como um cão. Melhor perguntar a ele.");
      } },
      { label: "Poole", r: [150, 300, 150, 230], act() { G.talk("poole"); } },
      exitHot()
    ]
  },

  prisao: {
    name: "Prisão — celas da Yard", outdoor: false,
    intro: ["Celas de pedra, grades, o pingar constante de uma goteira. O ar tem gosto de ferro e de bebida velha."],
    again: "As celas. A goteira continua a contar o tempo.",
    hot: [
      { label: "Sargento Bullstrode", r: [120, 230, 200, 200], act() { G.talk("sargento"); } },
      { label: "Livro de registro", r: [120, 398, 100, 28], show: () => !G.has("registro_guarda"), act() {
        G.give("registro_guarda");
        G.say(["O livro de registro. A letra do sargento, firme:", "“Saída 23h10 — Insp. H. Seek (ronda). Entrada 05h02 — desconhecido, com chave e distintivo do Insp. Seek. Saída 06h40, pela escada dos fundos.”", "Saí às onze, com certeza. Às cinco eu dormia na poltrona do escritório. Dormia."]);
      } },
      { label: "Porta do interrogatório", r: [520, 190, 180, 300], act() {
        if (G.f("u_interrog")) G.go("interrog"); else G.say("A porta de ferro do interrogatório. Primeiro preciso saber quem interrogar. O sargento deve saber.");
      } },
      look("Cela 2", [790, 200, 230, 300], "Cela vazia. Alguém riscou a pedra com a unha: “DOIS DENTRO DE UM”, e, mais fraco, abaixo: “O ESPELHO NÃO MENTE”."),
      { label: "Cela 3", r: [1040, 200, 230, 300], act() {
        G.say(G.f("u_interrog") ? "Enfield dorme sentado. Melhor interrogá-lo na sala própria." : "Um homem magro dorme sentado, o rosto contra as grades. Preciso saber quem ele é antes de acordá-lo.");
      } },
      exitHot()
    ]
  },

  interrog: {
    name: "Sala de Interrogatório", outdoor: false,
    intro: ["Uma mesa de carvalho, duas cadeiras, um lampião que balança. Na parede, um relógio parado há anos às 3h17.", "Enfield já está sentado, de mãos algemadas. A luz mostra cada ruga do rosto dele."],
    again: "A sala de interrogatório. O relógio continua parado às 3h17.",
    hot: [
      { label: "Richard Enfield", r: [760, 200, 200, 260], act() { G.talk("enfield"); } },
      look("Relógio", [590, 70, 100, 100], "Parado às 3h17. Dizem que o último prisioneiro enlouqueceu aqui dentro olhando para ele."),
      look("Mesa", [300, 390, 680, 60], "Marcas de unha na madeira. Alguém riscou, muitas vezes, a mesma letra: H. H. H."),
      look("Minha sombra", [330, 40, 220, 300], "Minha sombra na parede. Por um instante parece ter duas cabeças. O lampião balança; é só isso."),
      { label: "Voltar às celas", r: [40, 180, 130, 300], act() { G.go("prisao"); } }
    ]
  },

  boticario: {
    name: "Boticário Maw & Filhos", outdoor: false,
    intro: ["Frascos alinhados em prateleiras até o teto. Cheiro de cânfora, éter e coisas piores. O gosto amargo da manhã volta à minha boca.", "Atrás do balcão, um homem gordo de óculos minúsculos limpa um almofariz que já está limpo."],
    again: "Maw & Filhos. O mesmo cheiro de éter.",
    hot: [
      look("Prateleiras", [140, 50, 960, 330], "Rótulos em latim: muriato, nitrato, fosfato de sódio. A “impureza” de que Hyde precisa não está em nenhum rótulo."),
      { label: "Livro de vendas", r: [240, 396, 150, 30], act() { G.say("O livro de vendas. Maw o protege com a mão, como quem esconde cartas. Melhor perguntar a ele."); } },
      { label: "Sr. Maw", r: [440, 250, 160, 200], act() { G.talk("maw"); } },
      look("Janela", [1120, 90, 140, 260], "Old Compton Street, quase vazia. Um homem de chapéu atravessa a rua depressa; some na névoa antes de eu ver o rosto."),
      exitHot()
    ]
  }
};

const DIALOGS = {
  criada: {
    sp: "Srta. Hobbs, criada",
    start: { t: () => G.f("hobbs") ? ["“Mais alguma coisa, Inspetor?”"] : ["Uma moça pálida debruça-se na janela de cima. “Inspetor! Eu vi tudo daqui, juro por Deus. Estava acendendo a vela quando ouvi o velho cavalheiro cumprimentar alguém.”"],
      ch: [{ t: "Como era o homem?", next: "descr" }, { t: "Para onde ele foi?", next: "fuga" }, { t: "Obrigado, Srta. Hobbs." }] },
    descr: { do: () => { G.set("hobbs"); G.give("depoimento_criada"); },
      t: ["“Pequeno, Inspetor. Pequeno e pálido, com um riso que me gelou. Havia algo de errado nele, mas não sei dizer o quê. Parecia uma deformidade que não aparece.”", "“E as roupas! Largas demais, as mangas cobrindo as mãos, a bainha da calça varrendo o chão.”"],
      ch: [{ t: "Alguma coisa mais?", next: "lembra" }, { t: "Voltar", next: "start" }] },
    lembra: { t: ["“Quando ergueu o rosto para a minha janela, me lembrou alguém. Não consigo dizer quem. Foi como ver um parente que a gente não reconhece de tanto que mudou.”"], ch: [{ t: "Voltar", next: "start" }] },
    fuga: { do: () => { G.set("hobbs"); G.unlock("beco"); }, t: ["“Correu para o beco logo ali, o do fundo. A escuridão o engoliu. Não ouvi porta, nada. Só o riso, Inspetor. Só o riso.”"], ch: [{ t: "Voltar", next: "start" }] }
  },

  tom: {
    sp: "Tom, menino de rua",
    start: { t: () => G.f("tom_pago") ? ["“Diga, Inspetor.”"] : ["Um menino sentado num caixote ergue o queixo. “Ei, Inspetor! É o senhor da Yard, né? Dá um xelim pro Tom?”"],
      ch: [{ t: "Dar um xelim ao menino", next: "xelim", if: () => !G.f("tom_pago") },
        { t: "Perguntar o que ele viu", next: "viu", if: () => G.f("tom_pago") },
        { t: "Perguntar pelo cavalheiro alto", next: "alto", if: () => G.f("tom_pago") && G.has("depoimento_tom") },
        { t: "Perguntar da chave", next: "chave", if: () => G.f("tom_pago") && G.has("depoimento_tom") && !G.has("chave_marrom") },
        { t: "Deixá-lo em paz" }] },
    xelim: { do: () => G.set("tom_pago"), t: ["Tom morde a moeda por hábito e sorri sem um dente. “Valeu! Pergunta, pergunta.”"], ch: [{ t: "Perguntar o que ele viu", next: "viu" }] },
    viu: { do: () => G.give("depoimento_tom"), t: ["“Toda noite é igual: entra um cavalheiro alto, de chapéu, bem-educado, com pressa. Mas quem sai é sempre um baixinho, de roupa folgada, rindo sozinho.”", "“Nunca vi os dois juntos, Inspetor. Nunca. Fico olhando só pra isso, porque é tão esquisito.”"], ch: [{ t: "Voltar", next: "start" }] },
    alto: { t: ["“Não olhei a cara, não. Mas o chapéu...” Tom coça a cabeça. “Aba larga, de gente de respeito. Mas todo mundo em Londres tem chapéu, né?”"], ch: [{ t: "Voltar", next: "start" }] },
    chave: { do: () => G.give("chave_marrom"), t: ["“Ontem o baixinho saiu correndo e derrubou isto. Eu guardei pro senhor, que é a lei.”", "Tom me entrega uma chave de latão, ainda morna da mão dele."], ch: [{ t: "Voltar", next: "start" }] }
  },

  poole: {
    sp: "Poole, assistente do legista",
    start: { t: () => G.f("poole") ? ["“Em que mais posso ajudar, Inspetor?”"] : ["Poole quase derruba a prancheta. “Inspetor Seek! Graças a Deus. Não gosto de ficar sozinho aqui embaixo... O senhor também não me parece bem, se me permite.”"],
      ch: [{ t: "O que diz o legista?", next: "laudo" }, { t: "Havia algo com a vítima?", next: "pertences", if: () => !G.has("carta_lacrada") }, { t: "Alguém preso que tenha visto Hyde?", next: "preso" }, { t: "Obrigado, Poole." }] },
    laudo: { do: () => { G.set("poole"); G.give("laudo"); }, t: ["“Quatorze golpes, Inspetor. Olhe o ângulo: de baixo para cima, como se o agressor fosse bem mais baixo que a vítima. E a força... não combina com o corpo que a usou. Parece o braço de um homem grande preso num corpo pequeno.”"], ch: [{ t: "Voltar", next: "start" }] },
    pertences: { do: () => { G.set("poole"); G.give("carta_lacrada"); }, t: ["“Nos bolsos, só isto: uma carta lacrada com o seu nome. É do Dr. Lanyon, Inspetor. Do Lanyon morto.”", "“E a mão direita ficou fechada. Não consegui abri-la sem quebrar o dedo.” Poole faz uma careta. “O senhor mesmo pode tentar.”"], auto: "pertences2" },
    pertences2: { sp: "Seek", t: ["Uma carta de Lanyon, entregue por um morto. Meu velho amigo a escreveu antes de morrer. Há algo no peso do envelope que não me deixa rompê-lo. Ainda não."], ch: [{ t: "Voltar", next: "start" }] },
    preso: { do: () => G.unlock("prisao"), t: ["“O Enfield, Inspetor. Preso por briga de taverna. Viu Hyde pisar numa menina anos atrás e nunca mais foi o mesmo. Está nas celas. O sargento Bullstrode cuida dele.”"], ch: [{ t: "Voltar", next: "start" }] }
  },

  sargento: {
    sp: "Sargento Bullstrode",
    start: { t: () => G.f("sgt") ? ["“Diga, Inspetor.”"] : ["O sargento se levanta, ajeitando o cinto. “Inspetor! Pensei que estivesse em casa, repousando. O senhor tem cara de quem não dorme faz dias.”"],
      ch: [{ t: "Alguém passou por aqui esta madrugada?", next: "madrug" }, { t: "Alguém aqui viu Hyde?", next: "enfield" },
        { t: "Fechar o caso: acusar Enfield de ser Hyde", next: "acusar", if: () => G.has("depoimento_enfield") && G.has("bilhete_hyde") && G.has("depoimento_criada") },
        { t: "Obrigado, sargento." }] },
    madrug: { do: () => G.set("sgt"), t: ["“Às cinco e pouco, um sujeito pequeno, pálido, de capa enorme, subiu com o seu distintivo e a sua chave, Inspetor. Disse: ‘O tio me espera.’ Pensei que fosse seu sobrinho. Deixei subir. Saiu pelos fundos às seis e quarenta.”", "“Está tudo no livro de registro, aí na mesa.”"], auto: "madrug2" },
    madrug2: { sp: "Seek", t: ["Meu distintivo. Minha chave. Alguém me roubou, ou me copiou. Quando acordei no escritório, às seis, o distintivo estava no meu bolso, onde sempre fica."], ch: [{ t: "Voltar", next: "start" }] },
    acusar: { t: ["O sargento coça o queixo. “Enfield, Inspetor? Viu Hyde de perto, conhece a Porta Marrom, não tem álibi... Serve. Mas uma vez preso como Hyde, ninguém mais o procura.”", "“Tem certeza?”"],
      ch: [{ t: "Tenho. Formalize a acusação.", next: "acusar_ok" }, { t: "Ainda não.", next: "start" }] },
    acusar_ok: { stop: true, do: () => G.accuse() },
    enfield: { do: () => { G.set("sgt"); G.unlock("interrog"); }, t: ["“Richard Enfield, na cela três. Viu Hyde em ação anos atrás. Pode levá-lo à sala de interrogatório, é a porta de ferro ali.”"], ch: [{ t: "Voltar", next: "start" }] }
  },

  enfield: {
    sp: "Richard Enfield",
    start: { t: ["Enfield ergue os olhos avermelhados. “Se vai me bater, Inspetor, faça com educação. Já me bateram hoje.”"],
      ch: [{ t: "Fale-me de Hyde.", next: "h1" },
        { t: "[Mostrar] O bilhete de Hyde", needs: "bilhete_hyde", next: "bilhete", once: true },
        { t: "[Mostrar] A metade da bengala", needs: "bengala_metade", next: "bengala", once: true },
        { t: "Onde ele consegue o que o transforma?", if: () => G.f("enf1"), next: "botica", once: true },
        { t: "Chega por hoje." }] },
    h1: { do: () => { G.set("enf1"); G.give("depoimento_enfield"); }, t: ["“Eu o vi há três anos, às quatro da manhã. Um homenzinho andando depressa, e uma menina de oito anos correndo na esquina. Esbarraram. E ele passou por cima dela, Inspetor. Com calma. Como quem pisa em grama.”", "“Gritei. Cercamos o sujeito. Ele só olhava. Havia nele algo tão odioso que dava vontade de matá-lo ali mesmo, sem razão. Uma deformidade que ninguém consegue apontar.”", "“Ele pagou a família com um cheque, de um doutor respeitável. Entrou por uma porta marrom e voltou com ele.”"], ch: [{ t: "Voltar", next: "start" }] },
    bilhete: { t: ["Enfield franze a testa sobre o papel. “Essa letra... era assim no cheque. Inclinada para trás, laço no ‘y’. O doutor que assinou escrevia desse jeito.”", "“Eu disse: um nome respeitável. Respeitável demais pra eu dizer em voz alta.”"], ch: [{ t: "Voltar", next: "start" }] },
    bengala: { t: ["“Ébano, anel de prata. O baixinho carregava uma igual, pesada demais pro tamanho dele. Parecia que era a bengala que levava o homem.”"], ch: [{ t: "Voltar", next: "start" }] },
    botica: { do: () => G.unlock("boticario"), t: ["“Pós, Inspetor. Brancos. Eu o vi uma vez na Maw & Filhos, na Old Compton Street, trocando bilhetes por frascos. O boticário trata do assunto como quem protege a própria mãe.”"], ch: [{ t: "Voltar", next: "start" }] }
  },

  maw: {
    sp: "Sr. Maw, boticário",
    start: { t: () => G.f("maw") ? ["“Mais alguma coisa, Inspetor?”"] : ["O boticário ergue os olhos sobre os óculos minúsculos. “Inspetor Seek! O senhor de novo? Digo... o senhor e o seu, como é, sobrinho. O rapazote vive pedindo o mesmo sal.”"],
      ch: [{ t: "Quem compra o sal?", next: "quem" }, { t: "Que sal é esse?", next: "sal" }, { t: "Preciso do bilhete de encomenda.", next: "bilhete", if: () => G.f("maw_quem") && !G.has("recibo") }, { t: "Obrigado, Sr. Maw." }] },
    quem: { do: () => { G.set("maw"); G.set("maw_quem"); }, t: ["“Um rapazote pequeno, de maneiras esquisitas, sempre apressado. Traz um bilhete de médico, sempre o mesmo, assinado ‘Dr. H.’ Quer da primeira remessa; as novas devolve: ‘puras demais’. Veja a ironia: ele quer a impureza.”"], ch: [{ t: "Voltar", next: "start" }] },
    sal: { do: () => G.set("maw"), t: ["“Sal cristalino, branco. Sozinho não faz mal a ninguém. Misturado a uma tintura, faz o que o rapaz quer, pelo que ele diz. Se a primeira remessa acabar, ele fica... desesperado.”"], ch: [{ t: "Voltar", next: "start" }] },
    bilhete: { do: () => G.give("recibo"), t: ["“Guardo todos. Pode levar o último. Não quero problemas com a Yard.” Maw tira o papel da gaveta com dois dedos, como quem segura um rato morto."], auto: "bilhete2" },
    bilhete2: { sp: "Seek", t: ["“Dr. H.” Hastie Lanyon? Mas Lanyon está morto. Alguém usa o nome de um médico para comprar o que faz Hyde, e assim passa por respeitável. Quem sabe tanto?"], ch: [{ t: "Voltar", next: "start" }] }
  }
};

const HINTS = [
  [() => !G.has("telegrama"), "Há um telegrama sobre a minha mesa, no escritório."],
  [() => !G.f("v_soho"), "O crime foi na Rua Soho. Abra o mapa e vá até lá."],
  [() => !(G.has("bengala_metade") && G.has("bilhete_hyde") && G.has("depoimento_criada")), "Na Rua Soho: examine o chão e converse com a criada, na janela de cima."],
  [() => !(G.has("botao") && G.has("carta_lacrada")), "O necrotério guarda o que o corpo trazia na mão e nos bolsos. Fale com Poole."],
  [() => !G.has("depoimento_tom"), "A criada falou de um beco. Procure o menino que vive nele."],
  [() => !G.has("registro_guarda"), "A Prisão tem um livro de registro à vista, na mesa do sargento."],
  [() => !G.has("depoimento_enfield"), "O sargento pode liberar Enfield para o interrogatório."],
  [() => !G.has("recibo"), "O boticário Maw & Filhos aparece nos cacos do beco e na boca de Enfield."],
  [() => !G.has("diario"), "A Porta Marrom abre com uma chave. O menino Tom pode tê-la."],
  [() => !(G.has("casaco") && G.has("suporte") && G.has("relatorio")), "O meu próprio escritório ainda tem o que examinar: casaco, suporte de bengalas, relatórios."],
  [() => !G.has("frasco"), "A gaveta trancada do escritório e a chavinha do laboratório guardam algo que muda o fim do caso."],
  [() => true, "Tudo à mão. Reúna as peças no quadro do caso, no escritório."]
];