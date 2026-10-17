# Spatial Design System Explorer — UX decisions

## English — implemented / approved foundation

1. **One system, shared product code.** Foundations read the actual V5.6 stylesheet;
   Core renders the installed shadcn inventory. Rosa Flow Components import the same
   exports used in Assignments, Overview, Live, Review and Sign-off. Entry, review
   and sign-off patterns were extracted rather than restyled as separate examples.
2. **A reference rather than a second editor.** The dedicated route has quick
   navigation, search/grouping, live previews, tokens, code and concise usage.
   Existing Theme Studio remains the editing/export surface. Local Neutral/Original
   comparison does not persist theme preferences or change V2–V4.
3. **Discoverable product patterns.** The dedicated Rosa section documents purpose,
   anatomy, states, rationale, screen usage and source for each reusable pattern.
   Mobile-sized previews make behavior and shared components reviewable together.
4. **Safe isolated stories.** Responses, evidence, review and approval examples use
   in-memory fixtures and the actual validation helpers. Camera/attachment and
   sign-off effects are explicitly preview-only. No real capture, upload, signature,
   submission or certification is invoked. Existing assessment drafts stay intact.
5. **Truthful completion and system language.** Pass/Fail remain binary. A Fail can
   be assessed; a Pass missing required evidence is incomplete. Local saving,
   offline, error and required-evidence states use actual shared components.
   Pending server sync is documented as a boundary, not shown as a fabricated success.
6. **Approved theme and accessible interaction.** Spatial V5.6 Light is the visual
   foundation. Real controls preserve labels, focus, keyboard and reduced motion.
   Token roles expose responsive type, precise component spacing, shape, elevation
   and motion, including future customer-brand aliases.

## English — exploratory / not approved

- Dark Spatial, backend sync, authenticated signatures and client-specific scoring
  or approval policies require separate design and validation. No Dark theme is
  represented as approved; illustrative manager configuration is preview-only.
- No new upstream shadcn inventory is claimed or installed. The manifest is checked
  against the components actually present in this repository.

## Português — implementado / base aprovada

1. **Um sistema com código de produto compartilhado.** Foundations lê o CSS real da
   V5.6 e Core renderiza o inventário shadcn instalado. Rosa Flow Components importa
   os mesmos componentes usados em Assignments, Overview, Live, Review e Sign-off.
   Entrada, revisão e aprovação foram extraídas, sem criar versões visuais separadas.
2. **Referência, não um segundo editor.** A rota dedicada oferece navegação rápida,
   busca/grupos, previews, tokens, código e orientações. O Theme Studio continua
   responsável por edição/exportação. A comparação local Neutral/Original não
   persiste preferências nem altera V2–V4.
3. **Padrões de produto fáceis de explorar.** A seção Rosa documenta propósito,
   anatomia, estados, justificativa, telas e fonte de cada padrão reutilizável.
   Previews em tamanho móvel permitem avaliar comportamento e componentes juntos.
4. **Exemplos isolados e seguros.** Respostas, evidências, revisão e aprovação usam
   fixtures em memória com a validação real. Câmera/anexos e sign-off são claramente
   demonstrativos, sem captura real, upload, assinatura, envio ou certificação.
   Os rascunhos existentes permanecem intactos.
5. **Conclusão e linguagem de sistema honestas.** Pass/Fail seguem binários. Fail
   pode estar observado; Pass sem evidência obrigatória segue incompleto. Salvamento
   local, offline, erro e evidência usam os componentes compartilhados. Sincronização
   pendente é documentada como limite, sem simular sucesso de servidor.
6. **Tema aprovado e interação acessível.** Spatial V5.6 Light é a base visual.
   Controles reais preservam rótulos, foco, teclado e reduced motion. Tokens expõem
   tipografia responsiva, espaços reais, forma, elevação, movimento e aliases de marca.

## Português — exploratório / não aprovado

- Spatial Dark, sincronização, assinaturas autenticadas e políticas de aprovação ou
  pontuação por cliente dependem de design e validação próprios. A configuração de
  gestor nos exemplos é demonstrativa; nenhum tema Dark é apresentado como aprovado.
- Nenhum componente shadcn upstream adicional é reivindicado ou instalado. O
  manifesto é validado contra o inventário real do repositório.
