from playwright.sync_api import sync_playwright,expect
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 p=b.new_page(viewport={'width':1440,'height':1000});records={}
 def snapshot():
  return p.locator('.phone').evaluate("""root=>{
   const style=e=>{const s=getComputedStyle(e);return {text:e.textContent.trim(),fg:s.color,bg:s.backgroundColor,border:s.borderColor}}
   return {
    tags:[...root.querySelectorAll('[data-slot=badge]')].map(style),
    buttons:[...root.querySelectorAll('button')].map(style),
    inputs:[...root.querySelectorAll('input,textarea')].map(style),
    secondary:[...root.querySelectorAll('.overview-description,.overview-section-copy small,.overview-person-copy small,.spatial-review-result-detail,.spatial-submission-card p')].map(style),
    choices:[...root.querySelectorAll('.spatial-choice')].map(style)
   }
  }""")
 for page in ['overview','live','result','submission']:
  baseline=None
  for brand in ['spatial','mcdonalds','burger-king']:
   p.goto(f'http://127.0.0.1:5181/?version=5&brandDemo=1&flowPreview={page}&brand={brand}')
   p.locator('.screen').wait_for()
   if page=='live':p.get_by_role('radio',name='Pass',exact=True).click()
   p.evaluate('()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))')
   current=snapshot()
   if baseline is None:baseline=current
   else:assert current==baseline,(page,brand,[(key,baseline[key],current[key]) for key in current if current[key]!=baseline[key]])
   if page=='overview':
    ready=p.locator('.overview-status[data-status=ready]')
    expect(ready).to_have_text('Ready to start')
    assert ready.evaluate('(e)=>getComputedStyle(e).color')=='rgb(101, 85, 169)'
    records[brand]=p.evaluate("""()=>({canvas:getComputedStyle(document.querySelector('.phone')).backgroundImage,icon:getComputedStyle(document.querySelector('.overview-goal-icon')).color})""")
   if page=='live':
    p.get_by_role('radio',name='Fail',exact=True).click()
    p.evaluate('()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})))')
    fail=p.locator('.spatial-choice[data-selected=true]')
    assert fail.evaluate('(e)=>getComputedStyle(e).backgroundColor')=='rgb(255, 242, 242)'
  print('PASS invariant tags, buttons, fields, secondary text and semantic states',page,flush=True)
 assert len({r['canvas'] for r in records.values()})==3,records
 assert len({r['icon'] for r in records.values()})==3,records
 # Switching an active session changes branding without losing the answer.
 p.goto('http://127.0.0.1:5181/?version=5&brandDemo=1&flowPreview=live')
 p.get_by_role('radio',name='Pass',exact=True).click()
 saved=p.evaluate('localStorage.getItem("lp-rosa-flow-v5-v01-preview")')
 p.get_by_role('combobox',name='Brand preview').click()
 p.get_by_role('option',name="McDonald's",exact=True).click()
 expect(p.get_by_role('radio',name='Pass',exact=True)).to_be_checked()
 assert p.evaluate('localStorage.getItem("lp-rosa-flow-v5-v01-preview")')==saved
 print('PASS only icon decor/canvas change; runtime brand switch preserves responses')
 b.close()
