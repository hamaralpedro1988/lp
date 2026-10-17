# Rosa V5.6 — UX design-decision changelog

## English — implemented

1. **One reusable theme across the journey.** Assignments, Overview, Live,
   Review and Sign-off share lavender canvas, near-white elevated surfaces,
   Inter typography, iris accents, radii, spacing and motion tokens. The same
   semantic roles apply to Radix portals and an interactive component catalog.
2. **V5.6 binary observation.** Pass and Fail have constant positions. No result
   is preselected and navigation never advances automatically. Earlier V5 coaching
   answers require explicit reselection; no pass/fail result is inferred and
   V2–V4 drafts keep their original model.
3. **Continuous spatial canvas.** The compact header carries Overview Back,
   Fryer Station, Dre and 11 thin iris progress segments. Header/footer are
   transparent. Progress means complete observations with required evidence,
   including Fail; it does not represent pass rate. Normal local saving is silent.
4. **Evidence in the reading flow.** The entire live card scrolls, including its
   always-visible comment composer and embedded camera. The card alone owns the
   scroll region. Its scrollbar is hidden without disabling keyboard/touch scroll.
   Camera targets remain 44px even on short devices. Photos use the existing real
   media flow, metadata, preview and removal; they never masquerade as uploads.
5. **Explicit navigation priority.** A wide labeled Back moves to the previous
   criterion; a narrow icon-only Sections opens the shadcn sheet; dark Next requires
   a response and required evidence. Top Back returns to Overview. Sections can
   jump to any criterion and returns focus appropriately.
6. **Review before confirmation.** Pass / Fail / Incomplete summaries and grouped
   edit links surface failures, critical checks and evidence. Incomplete work
   cannot reach sign-off. Local review is distinct from identity verification,
   employee acknowledgement, countersign and certification.
7. **Accessible states and motion.** Muted text and warning/outcome text are
   slightly darker than the HTML where necessary for AA contrast. Radio outlines
   and focus rings remain visible. Motion is tokenized and removed under reduced
   motion. Desktop rails scroll independently; mobile controls stay reachable.
8. **Functional boundaries retained.** Persistence failures and offline state are
   visible only when relevant. Existing validation, evidence hooks, local feedback,
   review and reset behavior remain. Version-scoped storage/CSS prevent comparison
   versions or Creator/Theme Studio from inheriting Spatial styles.

## English — proposed / not implemented

- Real upload/sync, server audit records, authenticated signatures, certification
  and client-specific approval/scoring rules require backend/product work. This PR
  does not claim to supply them.
- Native operating-system Focus / Do Not Disturb remains outside this theme scope.

## Português — implementado

1. **Um tema reutilizável em toda a jornada.** Assignments, Overview, Live,
   Review e Sign-off usam o mesmo fundo lavanda, superfícies elevadas quase
   brancas, tipografia Inter, acentos íris e tokens de raio, espaço e movimento.
   Os mesmos papéis semânticos abrangem os portais Radix e o catálogo interativo.
2. **Observação binária V5.6.** Pass e Fail permanecem em posições constantes.
   Nenhuma opção vem selecionada e não há avanço automático. Respostas antigas
   de coaching da V5 exigem nova seleção explícita; nenhum resultado é inferido.
   Os rascunhos V2–V4 preservam o modelo anterior.
3. **Canvas espacial contínuo.** O cabeçalho compacto reúne voltar ao Overview,
   Fryer Station, Dre e 11 segmentos finos de progresso íris. Cabeçalho e rodapé
   são transparentes. Progresso significa observação completa com evidência,
   incluindo Fail; não representa taxa de aprovação. O salvamento local é discreto.
4. **Evidência no fluxo de leitura.** O cartão inteiro rola, incluindo o comentário
   sempre visível e a câmera integrada. A barra fica oculta sem impedir rolagem
   por toque ou teclado. A câmera mantém alvo de 44px em telas baixas. Fotos usam
   o fluxo real existente, com metadados, prévia e remoção, sem simular upload.
5. **Prioridade de navegação explícita.** Back largo volta ao critério anterior;
   Sections compacto e com ícone abre o sheet shadcn; Next escuro exige resposta
   e evidência obrigatória. O Back superior retorna ao Overview. O sheet permite
   salto direto aos critérios e devolve o foco corretamente.
6. **Revisão antes da confirmação.** Resumos Pass / Fail / Incomplete e listas
   agrupadas destacam falhas, itens críticos e evidências. Itens incompletos
   bloqueiam o sign-off. Revisão local é diferente de identidade verificada,
   reconhecimento do colaborador, contrassinal e certificação.
7. **Estados e movimento acessíveis.** Textos secundários e de alerta/resultado
   são ligeiramente mais escuros que no HTML quando necessário para contraste AA.
   Contornos dos radios e anéis de foco ficam visíveis. Movimento usa tokens e é
   removido com reduced motion. As laterais do desktop rolam separadamente; os
   controles móveis continuam acessíveis.
8. **Limites funcionais preservados.** Erros de persistência e offline aparecem
   quando relevantes. Validação, hooks de evidência, feedback local, revisão e
   reset continuam funcionais. CSS e storage por versão isolam V2–V4 e o Creator.

## Português — proposto / não implementado

- Upload/sync reais, auditoria no servidor, assinaturas autenticadas, certificação
  e regras de aprovação/pontuação por cliente dependem de backend e produto.
- Focus / Não Perturbe do sistema operacional continua fora deste escopo.
