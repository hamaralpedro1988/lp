# Rosa UI refinement — UX decisions

## English — implemented

- Live Assessment remains the visual reference. Page headlines, instructional
  copy, labels, card headings, gutters and component spacing now share explicit
  roles rather than inherited version-specific values.
- Primary task surfaces retain Live elevation; supporting groups use the shared
  quiet variant. Materials, borders, radii and color roles remain common.
- Review rows and approval names have consistent typography. Approvals use a
  stable grid; metadata, icons, chevrons and actions align across screen sizes.
- Warning/success badges use their semantic colors. Primary actions have a 55px
  minimum target, fields remain 16px, and transparent chrome retains clear paint
  order during scrolling. Drawers use the same interaction hierarchy.
- A keyboard event-order race in the shared radio group is corrected; the radio
  indicator and existing assessment model stay intact.
- Production and Explorer import the same refined components/tokens. Drafts,
  binary outcomes, evidence validation and local-review boundaries are preserved.

## Português — implementado

- Live Assessment continua como referência visual. Títulos, instruções, rótulos,
  cabeçalhos de cards, gutters e espaços usam papéis explícitos, substituindo
  valores herdados das versões anteriores.
- A tarefa principal mantém a elevação do Live; grupos de apoio usam a variante
  quiet compartilhada. Materiais, bordas, raios e cores continuam comuns.
- Review e nomes nas aprovações têm tipografia consistente. Aprovações usam uma
  grade estável; metadados, ícones, chevrons e ações se alinham entre larguras.
- Badges de alerta/sucesso usam cores semânticas. Ações principais têm mínimo de
  55px, campos permanecem em 16px, e o chrome transparente mantém a pintura
  correta na rolagem. Drawers seguem a mesma hierarquia de interação.
- Foi corrigida uma corrida de eventos no teclado do Radio Group compartilhado,
  mantendo o indicador radio e o modelo de avaliação existente.
- Produto e Explorer importam os mesmos componentes/tokens refinados. Rascunhos,
  respostas binárias, validação de evidências e limites da revisão local permanecem.

## Unchanged scope / escopo preservado

No backend upload/sync, verified signature or certification was added. V2–V4 and
Theme Studio remain functional. No merge or production deployment is automatic.
