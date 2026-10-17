# Rosa V5 Spatial Flow — implementation decisions

## EN — proposed versus implemented

This is a V5 design exploration for issue #1, not an approved production design or a replacement for V4. The implementation branch is based on main commit `6ea6e0f`. The supplied [brief](https://github.com/hamaralpedro1988/lp/blob/design/rosa-v5-spatial-handoff/design/rosa-v5/CODEX_IMPLEMENTATION_BRIEF.md) and [approved standalone HTML](https://github.com/hamaralpedro1988/lp/blob/design/rosa-v5-spatial-handoff/design/rosa-v5/LearningPool_Rosa_V5_Spatial_Flow.html) were inspected from handoff commit `8eccd7d`. The HTML was opened locally and its response, sections and comment interactions inspected; it is not embedded or shipped as the application.

| Proposed in the handoff | Implemented |
| --- | --- |
| Calm lavender canvas, iris accents, layered cards and restrained translucency | Scoped V5 theme: canvas #f3f0fb, ink #242339, iris #7363bd, fine #e8e5f0 edges, opaque near-white reading cards, static ambient gradients and diffuse shadows. Only navigation, overlays and secondary materials use transparency/blur. |
| Tactile responses and directional continuity | CSS-only 360 ms forward/back card entry, 160 ms selection compression, 240 ms progress-color transition, 280 ms evidence drawer expansion and 360 ms summary entry. There is no animation loop, parallax, automatic advancement or new motion dependency. |
| One design language across the complete journey | Assignments, overview, live assessment, review and sign-off share card, type, status and action treatments. The same tokens apply to sections, note/photo sheets, previews, discard confirmation, version chooser and loading/offline/save-error feedback. |
| Living progress without implying a pass | Eleven iris segments use the shared rules: a Pass, Needs coaching or Fail response counts only when its required comment OR current-session photo is also present. Legacy notObserved is incomplete. This is completion progress, not a score. |
| Functional evidence, not simulated demo uploads | Reused the real EvidencePanel, camera/library file inputs, note save/discard, preview, deletion, photo counts, object URL cleanup and focus return. Photos disappear on reload and cannot retain evidence eligibility. Notes remain in V5 local storage. |
| Review and role-specific sign-off | Missing responses/evidence block sign-off. Review explicitly distinguishes completion from an overall pass. Assessor confirmation stays a local demo; Dre acknowledgement is not represented as collected. Manager approval is not invented when no template configuration exists. |
| Accessibility and responsive behavior | Kept 16px main copy, 14px supporting copy, large native radio controls, 44px+ main action targets, keyboard arrows/Home/End, question focus and sheet focus return. Secondary text is darker than the illustrative HTML to meet AA contrast. Layouts were checked at 320/375/390/430/1440px and reduced height. |
| Shared-element/morphing evidence impression | Implemented a contextual expanding drawer with a gently receding background rather than a fragile shared-element geometry animation. Main content stays readable; the existing Radix focus trap, Escape and browser-back behavior remain in control. |
| Reduced motion and rest | Reduced-motion mode removes V5 animations, transitions and background recession. Motion stops at rest, and all state information remains in text, radio state and color-independent status markers. |

### Component inventory and isolation

- `src/data/spatial-flow.ts`: scoped palette, independent `lp-rosa-flow-v5-v01` draft normalization, evidence-aware completion.
- `src/components/assessment/spatial-primitives.tsx`: segmented progress and criterion-level section drawer.
- `src/styles/spatial.css`: V5 materials, typography, responsive composition, portal styles and motion.
- `src/pages/assessment-flow.tsx`: reuses the existing flow engine and shadcn controls; conditional V5 presentation, local status and draft lifecycle.
- `src/App.tsx` and VersionSwitcher: new `?version=5` route and comparison entry.
- `tests/spatial.test.ts`: draft normalization/isolation, progress/evidence rules and AA text contrast.
- `scripts/check-spatial.py`: end-to-end V5 checks plus V2/V3/V4 regressions and reproducible screenshots.

The V2–V4 stylesheet, criterion data, validation functions and EvidencePanel were not modified. V5 starts at Assignments; previous versions keep their existing entry screens and storage keys. Desktop prototype controls stay outside Rosa’s mobile interface.

### Honest boundaries

No server submission, synchronization, identity verification, real employee/manager signatures or certification was added. There is therefore no valid final production completion to timestamp; the implementation does not invent a completion timestamp or describe a local confirmation as certification. Notes are local; photos are page-session-only. No Word decision document was changed.

## PT — proposto versus implementado

Esta é uma exploração de design da V5 para a issue #1, não uma decisão de produção aprovada nem uma substituição da V4. A implementação parte da main `6ea6e0f` e do handoff `8eccd7d`.

| Proposto no handoff | Implementado |
| --- | --- |
| Fundo lavanda, acentos iris e cartões em camadas | Tema exclusivo da V5 com superfícies de leitura opacas, sombras difusas, bordas delicadas e gradientes estáticos. A transparência fica limitada à navegação, sobreposições e superfícies secundárias. |
| Respostas tácteis e continuidade entre perguntas | Entrada direcional de 360 ms, compressão de seleção de 160 ms, progresso de 240 ms e painéis de 280 ms, em CSS. Sem animação contínua, avanço automático ou nova dependência de motion. |
| Consistência em todo o percurso | Assignments, Overview, Live assessment, Review e Sign-off, incluindo secções, comentário/fotografia, pré-visualização, confirmação de descarte e estados de carregamento/offline/erro. |
| Progresso independente da aprovação | Onze segmentos iris contam critérios com resposta e evidência obrigatória válidas. Pass, Needs coaching e Fail contam como observações completas; não representam uma nota final. |
| Evidências reais | Mantidos os fluxos de ficheiros, fotografia, notas, edição, descarte, pré-visualização, remoção, contagem e retorno de foco. As fotografias deixam de satisfazer a validação após recarregar a página. |
| Revisão e sign-off por função | Respostas/evidências em falta bloqueiam o sign-off. A confirmação do assessor é local e demonstrativa; não se afirma que Dre assinou nem se inventa um requisito universal de assinatura do manager. |
| Acessibilidade e adaptação | Texto principal de 16px, apoio de 14px, radios semânticos, alvos principais de pelo menos 44px, teclado e gestão de foco. Texto secundário ajustado para contraste AA. Verificação entre 320 e 1440px, incluindo altura reduzida. |
| Painel contextual com sensação espacial | Expansão do painel e recuo suave do fundo, mantendo a gestão de foco, Escape e botão de voltar do Radix e do fluxo existente. |
| Movimento reduzido | Animações, transições e recuo do fundo são removidos com prefers-reduced-motion. Os estados continuam compreensíveis sem movimento nem dependência exclusiva da cor. |

A V5 usa o rascunho separado `lp-rosa-flow-v5-v01`. A V2, V3 e V4 mantêm o comportamento, os dados e os estilos anteriores. Não foi alterado qualquer documento Word. Não foram adicionados backend, sincronização, certificação, assinaturas reais ou uma data fictícia de conclusão final.
