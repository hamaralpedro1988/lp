import json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
reports=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 p=b.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
 for theme in ['spatial','fluid']:
  for brand in ['spatial','crimson','ocean']:
   p.goto(f'http://127.0.0.1:5181/?version=5&brandDemo=1&flowPreview=live&visualTheme={theme}&brand={brand}')
   control=p.get_by_role('region',name='Connection scenario')
   for state in ['online','offline','recovered']:
    if state=='offline':control.get_by_role('button',name='Simulate connection loss',exact=True).click()
    if state=='recovered':control.get_by_role('button',name='Restore connection',exact=True).click()
    p.add_script_tag(path='node_modules/axe-core/axe.min.js')
    r=p.evaluate('''async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return {violations:r.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),incomplete:r.incomplete.length}}''')
    reports.append({'theme':theme,'brand':brand,'state':state,**r});assert not r['violations'],reports[-1]
 # A real save failure takes priority over simulated recovery feedback.
 p.goto('http://127.0.0.1:5181/?version=5&brandDemo=1&flowPreview=live')
 control=p.get_by_role('region',name='Connection scenario');control.get_by_role('button',name='Simulate connection loss',exact=True).click()
 p.evaluate('()=>{Storage.prototype.setItem=()=>{throw new Error("test save failure")}}')
 p.get_by_role('radio',name='Pass',exact=True).check();expect(p.get_by_text('Unable to save on this device. Keep this page open.',exact=True)).to_be_visible()
 control.get_by_role('button',name='Restore connection',exact=True).click();expect(p.get_by_text('You’re back online. Your progress is synced.',exact=True)).to_have_count(0)
 Path('docs/rosa-connection-scenario/accessibility.json').write_text(json.dumps(reports,indent=2));print('PASS 18 axe states; save error retains priority over connection recovery')
 b.close()
