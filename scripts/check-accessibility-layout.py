import json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
OUT=Path('docs/rosa-accessibility-13');reports=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for theme in ['spatial','fluid']:
  for width,height in [(320,844),(375,844),(390,844),(419,844),(390,520),(844,390),(1280,900)]:
   p=b.new_page(viewport={'width':width,'height':height},has_touch=True,is_mobile=width<900)
   for screen in ['overview','live','result','submission']:
    p.goto(f'http://localhost:5181/?version=5&brandDemo=1&visualTheme={theme}&flowPreview={screen}');p.locator('.phone').wait_for();p.wait_for_timeout(120)
    normal=p.evaluate('document.documentElement.scrollWidth<=innerWidth')
    assert normal,(theme,width,height,screen,'normal overflow')
    # Text resize stress, not a claim of physical browser zoom or mobile AT testing.
    p.evaluate('''()=>{const sizes=[...document.querySelectorAll('.phone *')].filter(e=>!e.dataset.a11yResized).map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]);for(let [e,size] of sizes){e.style.fontSize=(size*2)+'px';e.dataset.a11yResized='true'}}''')
    if screen=='submission':
     p.get_by_role('button',name='Collect acknowledgement',exact=True).click();dialog=p.get_by_role('dialog',name='Collect acknowledgement',exact=True)
     expect(dialog).to_be_visible()
     p.evaluate('''()=>{for(let e of document.querySelectorAll('[role=dialog] *'))if(!e.dataset.a11yResized){e.style.fontSize=(parseFloat(getComputedStyle(e).fontSize)*2)+'px';e.dataset.a11yResized='true'}}''')
     p.screenshot(path=str(OUT/f'{theme}-acknowledgement-{width}x{height}-text-200.png'))
     p.keyboard.press('Escape');expect(dialog).not_to_be_visible()
    reflow=p.evaluate('document.documentElement.scrollWidth<=innerWidth')
    # Find horizontally clipped reading text, excluding intentional tab-strip scrolling and icon decorations.
    clipped=p.locator('.phone').evaluate('''root=>[...root.querySelectorAll('h1,h2,h3,p,label,button,input,textarea')].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&e.scrollWidth>e.clientWidth+3&&!e.closest('.sr-only')&&!e.closest('.spatial-review-filters')&&s.whiteSpace==='nowrap'&&e.textContent.trim().length>2}).map(e=>({tag:e.tagName,text:e.textContent.slice(0,80),width:e.clientWidth,scroll:e.scrollWidth}))''')
    reports.append({'theme':theme,'width':width,'height':height,'screen':screen,'documentReflow':reflow,'clippedText':clipped})
    if width==320 and screen in ['live','overview','submission']:p.locator('.phone').screenshot(path=str(OUT/f'{theme}-{screen}-text-200.png'))
   p.close()
 b.close()
(OUT/'reflow-results.json').write_text(json.dumps(reports,indent=2))
print('Reflow cases:',len(reports),'page overflow:',sum(not r['documentReflow'] for r in reports),'clipped text cases:',sum(bool(r['clippedText']) for r in reports))
print([r for r in reports if not r['documentReflow'] or r['clippedText']][:10])

assert all(r['documentReflow'] and not r['clippedText'] for r in reports), 'Text reflow regression: see reflow-results.json'
