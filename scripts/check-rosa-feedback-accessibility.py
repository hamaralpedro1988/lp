"""Targeted WCAG automated smoke and keyboard/back interactions, not a compliance claim."""
import json,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path('docs/rosa-feedback-refinement');BASE='http://127.0.0.1:5181/';KEY='lp-rosa-flow-v5-v01'
reports=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 p=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce')
 def audit(theme,brand,state):
  p.add_script_tag(path='node_modules/axe-core/axe.min.js')
  report=p.evaluate('''async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return {violations:r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),incomplete:r.incomplete.length}}''')
  reports.append(dict(theme=theme,brand=brand,state=state,**report));assert not report['violations'],reports[-1]
 def open_task():
  p.locator('.review-item').first.click()
  sheet=p.get_by_role('dialog',name='Task details');expect(sheet).to_be_visible();return sheet
 for theme in ['spatial','fluid']:
  for brand in ['spatial','crimson','ocean']:
   query=f'?version=5&brandDemo=1&visualTheme={theme}&brand={brand}'
   for screen in ['overview','live','submission']:
    p.goto(BASE+query+'&flowPreview='+screen);p.locator('.screen').wait_for();audit(theme,brand,screen)
   p.goto(BASE+query+'&flowPreview=result');sheet=open_task();field=sheet.get_by_role('textbox',name=re.compile('Rosa’s observation'))
   expect(sheet.get_by_role('heading',name='Task details')).to_be_focused()
   field.focus();p.keyboard.type('Keyboard observation');audit(theme,brand,'unsaved')
   # Tab from field reaches Cancel then Save; no editing mode toggle.
   p.keyboard.press('Tab');expect(sheet.get_by_role('button',name='Cancel',exact=True)).to_be_focused()
   p.keyboard.press('Tab');expect(sheet.get_by_role('button',name='Save changes')).to_be_focused()
   p.keyboard.press('Enter');expect(field).to_be_focused()
   field.fill('Unsaved replacement');sheet.get_by_role('button',name='Close',exact=True).last.click()
   confirm=p.get_by_role('alertdialog',name='Discard comment changes?');expect(confirm).to_be_visible();audit(theme,brand,'discard')
   expect(confirm.get_by_role('button',name='Keep editing')).to_be_focused()
   p.keyboard.press('Enter');expect(field).to_have_value('Unsaved replacement')
   # Browser Back offers the same protection rather than leaving the page.
   p.go_back();expect(confirm).to_be_visible();confirm.get_by_role('button',name='Keep editing').click()
   expect(sheet).to_be_visible();expect(field).to_have_value('Unsaved replacement')
   sheet.get_by_role('button',name='Cancel',exact=True).click();sheet.get_by_role('button',name='Close',exact=True).first.click()
   expect(p.locator('.review-item').first).to_be_focused()
   # Outside click follows the same save/discard path.
   sheet=open_task();field=sheet.get_by_role('textbox',name=re.compile('Rosa’s observation'));field.fill('Outside dismissal')
   p.locator('[data-slot=sheet-overlay]').click(position={'x':5,'y':5},force=True)
   expect(confirm).to_be_visible();confirm.get_by_role('button',name='Discard changes').click()
   expect(p.get_by_role('dialog',name='Task details')).to_have_count(0)
 # Horizontal gesture remains available; only answer/evidence validation can block it.
 p.goto(BASE+'?version=5&flowPreview=live&brandDemo=1');p.get_by_role('radio',name='Pass',exact=True).check()
 card=p.locator('.spatial-question-title').bounding_box();x=card['x']+card['width']*.8;y=card['y']+20
 cdp=p.context.new_cdp_session(p);cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
 for i in range(1,9):cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x-180*i/8,'y':y}]})
 cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
 expect(p.locator('.spatial-position')).to_have_text('Task 2 of 11')
 p.get_by_role('button',name='Open step guidance').click();expect(p.get_by_role('dialog',name='Step guidance')).to_be_visible()
 p.keyboard.press('Escape');expect(p.get_by_role('button',name='Open step guidance')).to_be_focused()
 (ROOT/'accessibility-results.json').write_text(json.dumps({'reports':reports,'manualDeviceValidation':'Physical keyboard/IME, TalkBack and VoiceOver not available; no compliance claim.'},indent=2))
 print(f'PASS {len(reports)} axe states, Spatial/Fluid x three brands, keyboard save, X/outside/Back discard protection, return focus, touch swipe and Guidance')
 b.close()
