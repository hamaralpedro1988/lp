import json,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
OUT=Path('docs/rosa-accessibility-13');rows=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 p=b.new_page(viewport={'width':390,'height':844})
 def audit(theme,brand,state):
  p.evaluate('()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))');p.add_script_tag(path='node_modules/axe-core/axe.min.js')
  r=p.evaluate('''async()=>{let r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return {violations:r.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),incomplete:r.incomplete.length}}''')
  rows.append({'theme':theme,'brand':brand,'state':state,**r})
 for theme in ['spatial','fluid']:
  for brand in ['spatial','crimson','ocean']:
   url=f'http://localhost:5181/?version=5&brandDemo=1&visualTheme={theme}&brand={brand}'
   p.goto(url+'&flowPreview=live');p.get_by_role('radio',name='Pass',exact=True).check();p.wait_for_timeout(250)
   choice=p.locator('.spatial-choice[data-outcome=met]')
   assert choice.evaluate('(e)=>getComputedStyle(e).backgroundColor')=='rgb(237, 247, 241)', (theme,brand,choice.evaluate('(e)=>({bg:getComputedStyle(e).backgroundColor,selected:e.dataset.selected,hover:e.matches(":hover")})'))
   assert choice.evaluate('(e)=>getComputedStyle(e).borderTopColor')=='rgb(84, 132, 109)'
   audit(theme,brand,'selected-pass')
   p.get_by_role('radio',name='Fail',exact=True).check();p.locator('.spatial-choice[data-outcome=met]').hover();audit(theme,brand,'unselected-hover')
   p.keyboard.press('Tab');p.keyboard.press('Shift+Tab');audit(theme,brand,'keyboard-focus')
   p.context.set_offline(True);expect(p.locator('.spatial-status')).to_contain_text('Offline');audit(theme,brand,'offline');p.context.set_offline(False)
   p.goto(url+'&flowPreview=result');p.get_by_role('tab',name=re.compile('Failed')).click();audit(theme,brand,'active-failed-filter')
   selected=p.get_by_role('tab',name=re.compile('Failed'));assert selected.evaluate('(e)=>getComputedStyle(e).color')=='rgb(255, 255, 255)'
  p.goto(f'http://localhost:5181/?view=design-system&section=rosa&pattern=choices&visualTheme={theme}')
  p.get_by_role('combobox',name='Story state',exact=True).click();p.get_by_role('option',name='Disabled',exact=True).click();expect(p.get_by_role('radio',name='Pass',exact=True)).to_be_disabled();audit(theme,'spatial','disabled-choice')
 b.close()
(OUT/'interaction-state-results.json').write_text(json.dumps(rows,indent=2));assert not any(r['violations'] for r in rows),rows
print('PASS 32 interaction state audits: exact semantic Pass colors, selected/hover/focus/offline/active filters across six configurations; disabled radios in both themes. Disabled contrast is exempt, not claimed AA text compliance.')
