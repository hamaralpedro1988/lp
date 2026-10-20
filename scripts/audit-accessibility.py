"""Automated WCAG-target audit. Does not emulate actual TalkBack/VoiceOver testing."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
OUT=Path('docs/rosa-accessibility-13');OUT.mkdir(exist_ok=True)
results=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 p=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 def audit(theme,brand,state):
  p.evaluate('()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))')
  p.add_script_tag(path='node_modules/axe-core/axe.min.js')
  r=p.evaluate('''async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))}}''')
  results.append({'theme':theme,'brand':brand,'state':state,**r})
  print(theme,brand,state,[(v['id'],len(v['nodes'])) for v in r['violations']],flush=True)
 for theme in ['spatial','fluid']:
  for brand in ['spatial','crimson','ocean']:
   query=f'http://localhost:5181/?version=5&brandDemo=1&visualTheme={theme}&brand={brand}'
   for state in ['entry','overview','live','result','submission']:
    p.goto(query+('' if state=='entry' else '&flowPreview='+state));p.locator('.phone').wait_for();p.wait_for_timeout(200)
    audit(theme,brand,state)
    if brand=='spatial':p.locator('.phone').screenshot(path=str(OUT/f'{theme}-{state}.png'))
    if state=='live':
     p.get_by_role('button',name='Sections',exact=True).click();audit(theme,brand,'sections');p.get_by_role('dialog').locator('.spatial-section-list button').nth(8).click()
     p.get_by_role('radio',name='Fail',exact=True).check();audit(theme,brand,'required-fail')
     p.get_by_role('button',name='Open step guidance',exact=True).click();audit(theme,brand,'guidance');p.keyboard.press('Escape')
    if state=='result':
     p.locator('.review-item').first.click();audit(theme,brand,'task-detail');p.keyboard.press('Escape')
    if state=='submission':
     p.get_by_role('button',name='Collect acknowledgement',exact=True).click();audit(theme,brand,'typed-acknowledgement')
     p.get_by_role('tab',name='Draw signature',exact=True).click();audit(theme,brand,'drawn-acknowledgement');p.keyboard.press('Escape')
   p.goto(query+'&flowPreview=finish');p.get_by_role('button',name='Complete assessment',exact=True).click();audit(theme,brand,'completion-confirmation')
 b.close()
(OUT/'axe-results.json').write_text(json.dumps(results,indent=2))
failures=[(r['theme'],r['brand'],r['state'],v['id']) for r in results for v in r['violations']]
print('AUDIT',len(results),'states;',len(failures),'rule/state failures')
if failures:print(failures)

assert not failures, failures
