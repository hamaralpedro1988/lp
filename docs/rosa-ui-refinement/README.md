# Rosa V5.6 — refinamento visual do fluxo

O **Live Assessment é a referência** para tipografia, escala, ritmo, materiais,
cores e estados. O refinamento abrange Assignments, Overview, Live, Review,
Sign-off, navegação, drawers e evidências. Usa os mesmos componentes e tokens do
Spatial Design System; não há um segundo tema nem mudança na lógica do checklist.

## Comparação antes / depois — 390px

| Tela | Antes | Depois | Detalhes após rolagem |
| --- | --- | --- | --- |
| Assignments | [Antes](before/list-390.png) | [Depois](after/list-390.png) | |
| Overview | [Antes](before/overview-390.png) | [Depois](after/overview-390.png) | [Goals e seções](after/overview-details-390.png) |
| Live Assessment | [Referência](before/assessment-390.png) | [Depois](after/assessment-390.png) | |
| Review | [Antes](before/review-390.png) | [Depois](after/review-390.png) | [Critérios](after/review-details-390.png) |
| Sign-off | [Antes](before/signoff-390.png) | [Depois](after/signoff-390.png) | [Aprovações](after/signoff-details-390.png) |

As imagens usam dados de teste para comparação visual. Pass/Fail e conclusão do
checklist não representam uma certificação ou aprovação global.

## Refinamentos aplicados

- Títulos de página seguem o tamanho responsivo, peso 790, tracking e line-height
  da pergunta principal. Títulos internos têm um papel único de 18px / 740.
- Descrições seguem a instrução do Live: 15px e line-height 1.5. Dados de apoio e
  rótulos têm papéis explícitos; campos continuam em 16px. Nomes e linhas de lista
  usam a mesma escala de 15px, peso 650 e espaçamento consistente.
- Gutters e margens internas seguem os tokens reais do Live. Ícones, avatares,
  chevrons, separadores, metadados e alinhamento de texto foram revisados.
- A tarefa principal mantém a elevação do Live. Cards de apoio usam a variante
  compartilhada `quiet`, com a mesma superfície, raio e borda, e sombra mais leve.
- Feedback necessário usa a cor semântica de alerta; estados positivos usam o
  papel de sucesso. Heranças antigas não sobrepõem esses estados.
- CTAs principais seguem a altura mínima de 55px. Back usa o mesmo tratamento
  do Live; cabeçalho e rodapé continuam transparentes no canvas lavanda.
- Aprovações têm uma grade estável para nome, função, orientação e estado,
  evitando colunas estreitas e quebras arbitrárias em telas pequenas.
- Cabeçalho/rodapé têm uma camada de pintura própria para evitar recorte visual
  ao rolar conteúdo longo. O cartão Live mantém sua própria rolagem.
- A seleção por setas do Radio Group compartilhado é explícita, evitando uma
  corrida entre foco e keydown na montagem. O indicador continua sendo radio.
  Captures personalizados, itens desabilitados, direção e loop são respeitados.

## Medidas reais de tipografia — viewport de 390px

| Papel | Antes | Depois |
| --- | --- | --- |
| Título de página | 28px / 780 | 25.35px / 790, igual à pergunta do Live |
| Título de card | 18px / 720, com exceções herdadas | 18px / 740 |
| Descrição | 16px / 400 | 15px / 400, igual à instrução do Live |
| Critério no Review | 14px / 500 | 15px / 650 |
| Nome em aprovação | 16px / 550 | 15px / 650 |
| Campo de texto | 16px | 16px |

Auditoria de estilos computados: [antes](before/type-audit.json) e
[depois](after/type-audit.json). A escala principal é responsiva, não um valor
fixo de 25.35px em todos os dispositivos.

## Responsividade e estados

| Largura | Assignments | Overview | Live | Review | Sign-off |
| --- | --- | --- | --- | --- | --- |
| 320px | [Ver](after/list-320.png) | [Ver](after/overview-320.png) | [Ver](after/assessment-320.png) | [Ver](after/review-320.png) | [Ver](after/signoff-320.png) |
| 375px | [Ver](after/list-375.png) | [Ver](after/overview-375.png) | [Ver](after/assessment-375.png) | [Ver](after/review-375.png) | [Ver](after/signoff-375.png) |
| 390px | [Ver](after/list-390.png) | [Ver](after/overview-390.png) | [Ver](after/assessment-390.png) | [Ver](after/review-390.png) | [Ver](after/signoff-390.png) |
| 419px | [Ver](after/list-419.png) | [Ver](after/overview-419.png) | [Ver](after/assessment-419.png) | [Ver](after/review-419.png) | [Ver](after/signoff-419.png) |
| Desktop | [Ver](after/list-1440.png) | [Ver](after/overview-1440.png) | [Ver](after/assessment-1440.png) | [Ver](after/review-1440.png) | [Ver](after/signoff-1440.png) |

Overlays: [Sections](overlays/06-sections-sheet.png),
[câmera](overlays/06-camera-sheet.png), [prévia de imagem](overlays/06-photo-preview.png),
[confirmação local](overlays/06-confirmation-sheet.png).

## Validação

Build, lint e testes passam. Lint mantém os três avisos Fast Refresh já existentes.
As suítes de navegador usam o build de produção e verificam as cinco telas,
320/375/390/419px e desktop, respostas/evidência obrigatória, arquivos reais,
comentários, Review, sign-off, teclado/foco, reduced motion, texto ampliado,
offline/erro, V2–V4, Explorer e edição/exportação do Theme Studio.

[Resultado das verificações](VERIFICATION.txt) ·
[Decisões de UX em inglês e português](UX_DECISIONS.md).
