"""Targeted automated checks; not a WCAG compliance declaration."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
results=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 p=b.new_page(viewport={'width':390,'height':844},reduced_motion='reduce')
 for theme in ['spatial','fluid']:
  for brand in ['spatial','crimson','ocean']:
   p.goto(f'http://127.0.0.1:5181/?version=5&brandDemo=1&flowPreview=live&visualTheme={theme}&brand={brand}')
   p.get_by_role('button',name='All tasks',exact=True).click();sheet=p.get_by_role('dialog',name='All tasks')
   for state in ['list','preview']:
    if state=='preview':sheet.locator('[data-task-index="8"]').click()
    p.add_script_tag(path='node_modules/axe-core/axe.min.js')
    r=p.evaluate('''async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return {violations:r.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),incomplete:r.incomplete.length}}''')
    results.append({'theme':theme,'brand':brand,'state':state,**r});assert not r['violations'],results[-1]
 # Shared Explorer uses same preview contract and Escape behavior.
 p.goto('http://127.0.0.1:5181/?view=design-system&section=rosa&pattern=sections')
 p.get_by_role('button',name='All tasks',exact=True).click();s=p.get_by_role('dialog',name='All tasks')
 s.locator('[data-task-index="8"]').click();expect(s.get_by_role('region',name='Task preview')).to_be_visible()
 p.keyboard.press('Escape');expect(s.locator('[data-task-index="8"]')).to_be_focused()
 Path('docs/rosa-checklist-overview/accessibility.json').write_text(json.dumps(results,indent=2))
 print('PASS 12 axe states, both themes/three brands, shared Explorer read-only preview and Escape')
 b.close()
