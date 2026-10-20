import json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
OUT=Path('docs/rosa-accessibility-13');reports=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 p=b.new_page(viewport={'width':1440,'height':1000})
 for theme in ['spatial','fluid']:
  for pattern in ['assignment','completion','choices','signoff']:
   p.goto(f'http://localhost:5181/?view=design-system&section=rosa&pattern={pattern}&visualTheme={theme}');p.locator('.ds-device').wait_for()
   if pattern=='completion':
    p.get_by_role('combobox',name='Story state',exact=True).click();p.get_by_role('option',name='Complete',exact=True).click()
    p.get_by_role('button',name='Complete assessment',exact=True).click();expect(p.get_by_role('alertdialog',name='Complete assessment?',exact=True)).to_be_visible();p.keyboard.press('Escape')
    expect(p.get_by_role('button',name='Complete assessment',exact=True)).to_be_focused()
    p.get_by_role('combobox',name='Story state',exact=True).click();p.get_by_role('option',name='Save error',exact=True).click()
    p.get_by_role('button',name='Complete assessment',exact=True).click();p.get_by_role('button',name='Confirm completion',exact=True).click()
    expect(p.get_by_role('alert')).to_contain_text('Unable to complete.')
   if pattern=='signoff':p.get_by_role('button',name='Collect acknowledgement',exact=True).click()
   p.evaluate('()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))')
   p.add_script_tag(path='node_modules/axe-core/axe.min.js')
   r=p.evaluate('''async()=>{let r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return r.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))}''')
   reports.append({'theme':theme,'pattern':pattern,'violations':r})
   if pattern=='completion':p.screenshot(path=str(OUT/f'{theme}-explorer-completion.png'),full_page=True)
 # Bounds/semantics in actual short mobile viewport; keyboard-like focus scrolls into view.
 p.set_viewport_size({'width':390,'height':520})
 for theme in ['spatial','fluid']:
  p.goto(f'http://localhost:5181/?version=5&brandDemo=1&flowPreview=live&visualTheme={theme}');p.locator('.spatial-live-card').wait_for()
  p.get_by_role('button',name='Sections',exact=True).click();p.get_by_role('dialog').locator('.spatial-section-list button').nth(8).click()
  p.get_by_role('radio',name='Fail',exact=True).check()
  live=p.locator('.phone').aria_snapshot();(OUT/f'{theme}-live-aria.yml').write_text(live)
  p.locator('.spatial-question-title').evaluate('(e)=>e.textContent="Observe safe working practices and discuss an unusually long assessment task description with the employee before continuing"')
  p.get_by_role('radio',name='Pass',exact=True).focus()
  radio=p.get_by_role('radio',name='Pass',exact=True).bounding_box();card=p.locator('.spatial-live-card').bounding_box()
  assert radio['y']>=card['y'] and radio['y']+radio['height']<=card['y']+card['height']+1,(theme,'long title focus',radio,card)
  p.get_by_role('button',name='Add photo',exact=True).click()
  expect(p.get_by_role('dialog',name='Add photo',exact=True)).to_be_visible()
  sizes=p.get_by_role('dialog').locator('button').evaluate_all('(es)=>es.map(e=>({name:e.textContent.trim()||e.getAttribute("aria-label"),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}))')
  assert all(s['width']>=24 and s['height']>=24 for s in sizes),sizes
  p.keyboard.press('Escape');expect(p.get_by_role('button',name='Add photo',exact=True)).to_be_focused()
  p.goto(f'http://localhost:5181/?version=5&brandDemo=1&flowPreview=submission&visualTheme={theme}');p.get_by_role('button',name='Collect acknowledgement',exact=True).click()
  dialog=p.get_by_role('dialog',name='Collect acknowledgement',exact=True)
  field=p.get_by_label('Your full name (required)',exact=True);field.focus();box=field.bounding_box();phone=p.locator('.phone').bounding_box()
  assert box['y']>=phone['y'] and box['y']+box['height']<=phone['y']+phone['height']+1,(box,phone)
  (OUT/f'{theme}-acknowledgement-aria.yml').write_text(dialog.aria_snapshot())
  p.screenshot(path=str(OUT/f'{theme}-short-viewport-focus.png'))
  p.evaluate('''()=>{let items=[...document.querySelectorAll('[role=dialog], [role=dialog] *')].map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]);for(let [e,size] of items)e.style.fontSize=(size*2)+'px'}''')
  p.keyboard.press('Tab');p.keyboard.press('Shift+Tab');box=field.bounding_box();assert box['y']>=phone['y'] and box['y']+box['height']<=phone['y']+phone['height']+1,(theme,'200% focus',box,phone)
  p.screenshot(path=str(OUT/f'{theme}-short-viewport-text-200-focus.png'))
  p.add_style_tag(content='*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}')
  p.add_script_tag(path='node_modules/axe-core/axe.min.js');v=p.evaluate('async()=>{let r=await axe.run(document,{runOnly:{type:"rule",values:["color-contrast"]}});return r.violations.length}')
  assert v==0,('no blur contrast',theme)
 b.close()
(OUT/'component-results.json').write_text(json.dumps(reports,indent=2))
assert not any(r['violations'] for r in reports),reports
print('PASS shared Explorer components in both themes; no-drag confirmation + focus; mobile camera targets; required semantics; short viewport focus visible; no-blur contrast. Browser AX snapshots recorded; physical screen readers not tested.')
